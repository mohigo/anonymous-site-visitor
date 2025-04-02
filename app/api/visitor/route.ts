import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { VisitorData } from '@/lib/fingerprint';
import { generateServerFingerprint, analyzeVisitorPatterns } from '@/lib/fingerprint';

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(uri);
const dbName = 'visitor-analytics';

export async function POST(request: Request) {
  try {
    const visitor = await request.json();
    const now = new Date().toISOString();
    
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('visitors');

    // Try to find an existing visitor with the same fingerprint pattern
    const existingVisitor = await collection.findOne({ visitorId: visitor.visitorId });

    if (existingVisitor) {
      // Update existing visitor
      await collection.updateOne(
        { visitorId: visitor.visitorId },
        {
          $set: {
            lastVisit: now,
            browser: visitor.browser || 'Unknown',
            country: visitor.country || 'Unknown',
            screenResolution: visitor.screenResolution || '1920x1080',
            preferences: visitor.preferences || { theme: 'light', language: 'en' },
            timestamp: Date.now()
          },
          $inc: { visitCount: 1 }
        }
      );
    } else {
      // Insert new visitor with proper initialization
      await collection.insertOne({
        ...visitor,
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        browser: visitor.browser || 'Unknown',
        country: visitor.country || 'Unknown',
        screenResolution: visitor.screenResolution || '1920x1080',
        preferences: visitor.preferences || { theme: 'light', language: 'en' },
        timestamp: Date.now()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving visitor data:', error);
    return NextResponse.json(
      { error: 'Failed to save visitor data' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function GET(request: Request) {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('visitors');

    // Get visitors and ensure all required fields are present
    const visitors = await collection.find({}).toArray();
    const processedVisitors = visitors.map(visitor => ({
      visitorId: visitor.visitorId,
      firstVisit: visitor.firstVisit || visitor.lastVisit || new Date().toISOString(),
      lastVisit: visitor.lastVisit || new Date().toISOString(),
      visitCount: visitor.visitCount || 1,
      browser: visitor.browser || 'Unknown',
      country: visitor.country || 'Unknown',
      screenResolution: visitor.screenResolution || '1920x1080',
      preferences: visitor.preferences || { theme: 'light', language: 'en' },
      timestamp: visitor.timestamp || Date.now()
    }));
    
    // Get ML-based pattern analysis
    const patterns = await analyzeVisitorPatterns(processedVisitors[0]); // Pass the most recent visitor
    
    // Calculate basic stats
    const totalVisitors = processedVisitors.length;
    const uniqueVisitors = new Set(processedVisitors.map(v => v.visitorId)).size;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeToday = processedVisitors.filter(v => new Date(v.lastVisit) >= today).length;
    
    // Calculate hourly distribution
    const hourlyVisitors = new Array(24).fill(0);
    processedVisitors.forEach(visitor => {
      const hour = new Date(visitor.lastVisit).getHours();
      hourlyVisitors[hour]++;
    });
    
    // Calculate browser distribution
    const browserDistribution = processedVisitors.reduce((acc: { [key: string]: number }, visitor) => {
      acc[visitor.browser] = (acc[visitor.browser] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate country distribution
    const countryDistribution = processedVisitors.reduce((acc: { [key: string]: number }, visitor) => {
      acc[visitor.country] = (acc[visitor.country] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      visitors: processedVisitors,
      stats: {
        totalVisitors,
        uniqueVisitors,
        activeToday,
        averageVisitsPerUser: totalVisitors / uniqueVisitors
      },
      hourlyVisitors,
      browserDistribution,
      countryDistribution,
      patterns
    });
  } catch (error) {
    console.error('Error fetching visitors:', error);
    return NextResponse.json({ visitors: [] });
  } finally {
    await client.close();
  }
} 