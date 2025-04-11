import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

// CORS headers helper function that accepts the request to get the origin
function corsHeaders(req: Request) {
  // Get the origin from the request headers
  const origin = req.headers.get('origin') || '';

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

// Handle OPTIONS requests (CORS preflight)
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(req),
  });
}

// Common function to process telemetry data
async function processTelemetry(req: Request, type: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = type === 'pageview' ? db.collection('pageviews') : db.collection('events');
    
    // Parse the request body
    const data = await req.json();
    
    // Basic validation
    if (!data.siteId) {
      return NextResponse.json(
        { error: 'siteId is required' },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    if (type === 'event' && !data.eventName) {
      return NextResponse.json(
        { error: 'eventName is required for event tracking' },
        { status: 400, headers: corsHeaders(req) }
      );
    }

    // Add server-side timestamp
    data.serverTimestamp = new Date();
    
    // Store IP address if not in privacy mode
    if (!data.anonymizeIp) {
      // Get the IP address from headers
      const forwarded = req.headers.get('x-forwarded-for');
      const realIp = req.headers.get('x-real-ip');
      const ip = forwarded || realIp || 'unknown';
      
      data.ipAddress = ip;
    }

    // Insert the data into the appropriate collection
    await collection.insertOne(data);

    // Update site stats
    const sitesCollection = db.collection('sites');
    
    if (type === 'pageview') {
      await sitesCollection.updateOne(
        { siteId: data.siteId },
        { 
          $inc: { totalPageviews: 1 },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true }
      );
    } else {
      await sitesCollection.updateOne(
        { siteId: data.siteId },
        { 
          $inc: { [`eventCounts.${data.eventName}`]: 1, totalEvents: 1 },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true }
      );
    }

    // Return success
    return NextResponse.json(
      { success: true },
      { status: 200, headers: corsHeaders(req) }
    );
  } catch (error) {
    console.error(`Error processing ${type}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: corsHeaders(req) }
    );
  }
}

// Handle POST requests
export async function POST(
  req: Request,
  { params }: { params: { type: string } }
) {
  const { type } = params;
  
  // Only allow valid types
  if (type !== 'pageview' && type !== 'event') {
    return NextResponse.json(
      { error: 'Invalid telemetry type' },
      { status: 400, headers: corsHeaders(req) }
    );
  }
  
  return processTelemetry(req, type);
} 