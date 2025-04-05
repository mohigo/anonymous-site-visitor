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
      totalVisitors,
      uniqueVisitors,
      recentVisitors,
      topCountries,
      topBrowsers,
    ] = await Promise.all([
      // Total visitors
      collection.countDocuments(),
      
      // Unique visitors
      collection.distinct('visitorId').then(ids => ids.length),
      
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
        { $limit: 5 },
        { $project: { country: '$_id', count: 1, _id: 0 } }
      ]).toArray(),
      
      // Top browsers
      collection.aggregate([
        { $group: { _id: '$browser', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        { $project: { browser: '$_id', count: 1, _id: 0 } }
      ]).toArray(),
    ]);

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
      { $sort: { _id: 1 } },
      { $project: { hour: '$_id', count: 1, _id: 0 } }
    ]).toArray();

    // Get active visitors (last 5 minutes)
    const activeVisitors = await collection.countDocuments({
      lastVisit: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

    return NextResponse.json({
      totalVisitors,
      uniqueVisitors,
      activeVisitors,
      recentVisitors,
      topCountries,
      topBrowsers,
      hourlyVisitors,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 