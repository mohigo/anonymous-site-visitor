import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { VisitorData } from '@/lib/fingerprint';
import { generateServerFingerprint, analyzeVisitorPatterns } from '@/lib/fingerprint';

const dbName = 'visitor-analytics';

export async function POST(request: Request) {
  try {
    const visitor = await request.json();
    const now = new Date().toISOString();
    
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection('visitors');

    // Try to find an existing visitor with the same fingerprint pattern
    const existingVisitor = await collection.findOne({ visitorId: visitor.visitorId });

    if (existingVisitor) {
      // Check if enough time has passed since last visit (30 minutes)
      const lastVisitTime = new Date(existingVisitor.lastVisit).getTime();
      const currentTime = new Date(now).getTime();
      const shouldIncrementCount = !lastVisitTime || (currentTime - lastVisitTime) >= 30 * 60 * 1000;

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
          ...(shouldIncrementCount ? { $inc: { visitCount: 1 } } : {})
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
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visitorId = searchParams.get('id');

    if (!visitorId) {
      return NextResponse.json(
        { error: 'Visitor ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection('visitors');

    // Get specific visitor by ID
    const visitor = await collection.findOne({ visitorId });

    if (!visitor) {
      return NextResponse.json(
        { error: 'Visitor not found' },
        { status: 404 }
      );
    }

    // Process visitor data to match VisitorData type
    const processedVisitor: VisitorData = {
      visitorId: visitor.visitorId,
      firstVisit: visitor.firstVisit || visitor.lastVisit || new Date().toISOString(),
      lastVisit: visitor.lastVisit || new Date().toISOString(),
      visitCount: visitor.visitCount || 1,
      browser: visitor.browser || 'Unknown',
      country: visitor.country || 'Unknown',
      screenResolution: visitor.screenResolution || '1920x1080',
      preferences: visitor.preferences || { theme: 'light', language: 'en' },
      timestamp: visitor.timestamp || Date.now()
    };

    // Get ML-based pattern analysis
    const patterns = await analyzeVisitorPatterns(processedVisitor);

    return NextResponse.json({
      visitor: {
        ...processedVisitor,
        patterns
      }
    });
  } catch (error) {
    console.error('Error fetching visitor:', error);
    return NextResponse.json(
      { error: 'Failed to fetch visitor data' },
      { status: 500 }
    );
  }
} 