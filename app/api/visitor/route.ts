import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { VisitorData } from '@/lib/types';
import { detectCountry } from '@/lib/geolocation';
import { generateServerFingerprint, analyzeVisitorPatterns } from '@/lib/fingerprint';

const dbName = 'visitor-analytics';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Visitor ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('visitor-analytics');
    const collection = db.collection('visitors');
    const visitor = await collection.findOne({ visitorId: id });

    if (!visitor) {
      return NextResponse.json({ error: 'Visitor not found' }, { status: 404 });
    }

    return NextResponse.json(visitor);
  } catch (error) {
    console.error('Error fetching visitor:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, shouldIncrementVisit } = body;

    if (!visitorId) {
      return NextResponse.json({ error: 'Visitor ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('visitor-analytics');
    const collection = db.collection('visitors');

    // Get geolocation data
    console.log('Getting geolocation data...');
    const geoData = await detectCountry(req);
    console.log('Geolocation data:', geoData);

    // First, try to find the existing visitor
    console.log('Looking for existing visitor:', visitorId);
    const existingVisitor = await collection.findOne({ visitorId });
    console.log('Existing visitor:', existingVisitor);

    // Prepare the update operation based on whether the visitor exists
    const updateOperation = !existingVisitor ? {
      // New visitor: set all fields including initial visit count
      $set: {
        visitorId,
        firstVisit: new Date(),
        lastVisit: new Date(),
        visitCount: 1,
        browser: body.browser || 'Unknown',
        country: geoData.country,
        countryCode: geoData.countryCode,
        screenResolution: body.screenResolution || '1920x1080',
        preferences: body.preferences || { theme: 'light', language: 'en' },
        timestamp: Date.now()
      }
    } : {
      // Existing visitor: update fields and optionally increment visit count
      $set: {
        lastVisit: new Date(),
        browser: body.browser || existingVisitor.browser,
        country: geoData.country,
        countryCode: geoData.countryCode,
        screenResolution: body.screenResolution || existingVisitor.screenResolution,
        preferences: body.preferences || existingVisitor.preferences,
        timestamp: Date.now()
      },
      ...(shouldIncrementVisit ? {
        $inc: { visitCount: 1 }
      } : {})
    };

    console.log('Update operation:', JSON.stringify(updateOperation, null, 2));

    // Update or insert the visitor
    const result = await collection.findOneAndUpdate(
      { visitorId },
      updateOperation,
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    console.log('MongoDB result:', result);

    if (!result) {
      console.error('Failed to update visitor - no result');
      return NextResponse.json({ error: 'Failed to update visitor' }, { status: 500 });
    }

    // Return the updated document
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating visitor:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
    }
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET_ML(request: Request) {
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
      countryCode: visitor.countryCode || 'XX',
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