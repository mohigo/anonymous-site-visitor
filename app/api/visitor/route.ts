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
    console.log('Received POST request to /api/visitor');
    
    const body = await req.json();
    console.log('Request body:', body);
    
    const { visitorId, shouldIncrementVisit, isReturningVisitor } = body;

    if (!visitorId) {
      console.error('Missing visitorId in request');
      return NextResponse.json({ error: 'Visitor ID is required' }, { status: 400 });
    }

    let client;
    try {
      client = await clientPromise;
      console.log('MongoDB connection established');
    } catch (dbError) {
      console.error('Failed to connect to MongoDB:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    const db = client.db('visitor-analytics');
    const collection = db.collection('visitors');

    // Get geolocation data
    console.log('Getting geolocation data...');
    let geoData;
    try {
      geoData = await detectCountry(req);
      console.log('Geolocation data:', geoData);
    } catch (geoError) {
      console.error('Geolocation detection failed:', geoError);
      geoData = { country: 'Unknown', countryCode: 'XX' };
    }

    // First, try to find the existing visitor
    console.log('Looking for existing visitor:', visitorId);
    let existingVisitor;
    try {
      existingVisitor = await collection.findOne({ visitorId });
      console.log('Existing visitor:', existingVisitor);
    } catch (findError) {
      console.error('Error finding visitor:', findError);
      return NextResponse.json({ error: 'Failed to check existing visitor' }, { status: 500 });
    }

    const now = new Date();

    // Prepare the update operation based on visitor status
    const updateOperation = !existingVisitor ? {
      // New visitor: set all fields including initial visit count
      $set: {
        visitorId,
        firstVisit: now,
        lastVisit: now,
        visitCount: 1,
        browser: body.browser || 'Unknown',
        country: geoData.country,
        countryCode: geoData.countryCode,
        screenResolution: body.screenResolution || '1920x1080',
        preferences: body.preferences || { theme: 'light', language: 'en' },
        timestamp: Date.now(),
        clearHistory: isReturningVisitor ? 1 : 0 // Track number of times history was cleared
      }
    } : {
      // Existing visitor: update fields and optionally increment visit count
      $set: {
        lastVisit: now,
        browser: body.browser || existingVisitor.browser,
        country: geoData.country,
        countryCode: geoData.countryCode,
        screenResolution: body.screenResolution || existingVisitor.screenResolution,
        preferences: body.preferences || existingVisitor.preferences,
        timestamp: Date.now()
      },
      ...(shouldIncrementVisit ? {
        $inc: { 
          visitCount: 1,
          ...(isReturningVisitor ? { clearHistory: 1 } : {}) // Increment clearHistory if returning after clearing
        }
      } : {})
    };

    console.log('Update operation:', updateOperation);

    // Update or insert the visitor document
    let result;
    try {
      result = await collection.updateOne(
        { visitorId },
        updateOperation,
        { upsert: true }
      );
      console.log('Update result:', result);
    } catch (updateError) {
      console.error('Error updating visitor:', updateError);
      return NextResponse.json({ error: 'Failed to update visitor data' }, { status: 500 });
    }

    // Get the updated visitor data
    let updatedVisitor;
    try {
      updatedVisitor = await collection.findOne({ visitorId });
      if (!updatedVisitor) {
        throw new Error('Failed to retrieve updated visitor data');
      }
      console.log('Updated visitor data:', updatedVisitor);
    } catch (fetchError) {
      console.error('Error fetching updated visitor:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch updated visitor data' }, { status: 500 });
    }

    return NextResponse.json(updatedVisitor);
  } catch (error) {
    console.error('Unhandled error in visitor API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
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