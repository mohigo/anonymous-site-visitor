import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const dbName = 'visitor-analytics';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection('visitors');

    // Find existing visitor
    const visitor = await collection.findOne({ visitorId: data.visitorId });

    if (visitor) {
      // Update existing visitor
      await collection.updateOne(
        { visitorId: data.visitorId },
        {
          $set: { 
            lastVisit: new Date(),
            browser: data.browser || 'Unknown',
            country: data.country || 'Unknown',
            screenResolution: data.screenResolution || '1920x1080',
            preferences: data.preferences || { theme: 'light', language: 'en' }
          },
          $inc: { visitCount: 1 }
        }
      );
    } else {
      // Create new visitor
      const now = new Date();
      await collection.insertOne({
        ...data,
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        browser: data.browser || 'Unknown',
        country: data.country || 'Unknown',
        screenResolution: data.screenResolution || '1920x1080',
        preferences: data.preferences || { theme: 'light', language: 'en' }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving visitor data:', error);
    return NextResponse.json(
      { error: 'Failed to save visitor data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection('visitors');

    // Convert string dates to Date objects for existing records
    await collection.updateMany(
      { 
        $or: [
          { lastVisit: { $type: "string" } },
          { firstVisit: { $type: "string" } }
        ]
      },
      [
        { 
          $set: {
            lastVisit: { $toDate: "$lastVisit" },
            firstVisit: { $toDate: "$firstVisit" }
          }
        }
      ]
    );

    // Get analytics data using MongoDB native operations
    const [
      recentVisitors,
      topCountries,
      topBrowsers,
      totalVisitsAgg
    ] = await Promise.all([
      // Recent visitors - ensure proper date sorting
      collection.find()
        .sort({ lastVisit: -1 })
        .limit(5)
        .project({
          visitorId: 1,
          firstVisit: 1,
          lastVisit: 1,
          visitCount: 1,
          browser: 1,
          country: 1,
          preferences: 1
        })
        .toArray(),
      
      // Top countries
      collection.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { country: '$_id', count: 1, _id: 0 } }
      ]).toArray(),
      
      // Top browsers
      collection.aggregate([
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { browser: '$_id', count: 1, _id: 0 } }
      ]).toArray(),

      // Total visits
      collection.aggregate([
        {
          $group: {
            _id: null,
            totalVisits: { $sum: "$visitCount" }
          }
        }
      ]).toArray()
    ]);

    const uniqueVisitors = await collection.distinct('visitorId');
    const totalVisits = totalVisitsAgg[0]?.totalVisits || 0;

    // Get hourly visitors for the last 24 hours
    const hourlyVisitors = await collection.aggregate([
      {
        $match: {
          lastVisit: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $hour: '$lastVisit' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // Convert hourly data to array of counts
    const hourlyData = new Array(24).fill(0);
    hourlyVisitors.forEach(({ _id, count }) => {
      hourlyData[_id] = count;
    });

    // Calculate peak hours (hours with visits > average)
    const average = hourlyData.reduce((a, b) => a + b, 0) / 24;
    const peakHours = hourlyData
      .map((count, hour) => ({ hour, count }))
      .filter(({ count }) => count > average)
      .map(({ hour }) => hour);

    // Get active visitors today (since midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeVisitors = await collection.countDocuments({
      lastVisit: { $gte: today }
    });

    // Calculate returning visitor rate
    const returningVisitors = await collection.countDocuments({
      visitCount: { $gt: 1 }
    });
    const returningVisitorRate = returningVisitors / uniqueVisitors.length || 0;

    // Calculate average visit duration (using a 30-minute session timeout)
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds
    const visitorSessions = await collection.aggregate([
      {
        $group: {
          _id: '$visitorId',
          visits: {
            $push: {
              lastVisit: '$lastVisit',
              visitCount: '$visitCount'
            }
          }
        }
      }
    ]).toArray();

    let totalDuration = 0;
    let totalSessions = 0;

    interface Visit {
      lastVisit: Date;
      visitCount: number;
    }

    visitorSessions.forEach(({ visits }) => {
      // Sort visits by timestamp
      const sortedVisits = visits.sort((a: Visit, b: Visit) => 
        new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime()
      );

      // For each visitor, estimate session duration based on visit patterns
      let currentSessionStart: number | null = null;
      sortedVisits.forEach((visit: Visit, index: number) => {
        const visitTime = new Date(visit.lastVisit).getTime();
        
        if (!currentSessionStart) {
          currentSessionStart = visitTime;
        } else {
          const timeSinceLastVisit = visitTime - currentSessionStart;
          
          // If time between visits exceeds session timeout, consider it a new session
          if (timeSinceLastVisit > sessionTimeout) {
            // Add previous session duration (with minimum 5 minutes per session)
            totalDuration += Math.max(5 * 60 * 1000, sessionTimeout);
            totalSessions++;
            currentSessionStart = visitTime;
          }
        }
        
        // Handle last visit in the sequence
        if (index === sortedVisits.length - 1 && currentSessionStart) {
          totalDuration += Math.max(5 * 60 * 1000, sessionTimeout);
          totalSessions++;
        }
      });
    });

    const averageVisitDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

    // Detect anomalies
    const anomalies = [];
    
    // Check for unusual spikes in traffic
    const maxHourlyVisits = Math.max(...hourlyData);
    if (maxHourlyVisits > average * 3) {
      anomalies.push({
        score: maxHourlyVisits / (average * 3),
        isAnomaly: true,
        reasons: ['Unusual spike in traffic detected']
      });
    }

    // Check for unusual number of visits from same IP
    const suspiciousVisitors = await collection.aggregate([
      {
        $group: {
          _id: '$visitorId',
          count: { $sum: 1 },
          lastVisit: { $max: '$lastVisit' }
        }
      },
      {
        $match: {
          count: { $gt: 100 }, // Threshold for suspicious activity
          lastVisit: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        }
      }
    ]).toArray();

    if (suspiciousVisitors.length > 0) {
      anomalies.push({
        score: 0.8,
        isAnomaly: true,
        reasons: ['High frequency of visits from same visitor ID']
      });
    }

    // Return analytics data
    return NextResponse.json({
      recentVisitors,
      totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      activeVisitors,
      hourlyVisitors: hourlyData,
      topBrowsers,
      topCountries,
      patterns: {
        peakHours,
        returningVisitorRate,
        averageVisitDuration,
        anomalies
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 