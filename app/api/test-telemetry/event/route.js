import { NextResponse } from 'next/server';
import clientPromise from '../../../../lib/mongodb';

export async function POST(request) {
  try {
    // Get the data from the request
    const data = await request.json();
    
    // Log the received data
    console.log('Received event data:', data);
    console.log('Event type:', data.eventName);
    console.log('Event details:', data.eventData);
    
    // Connect to MongoDB and save the data
    try {
      const client = await clientPromise;
      const db = client.db();
      
      // Add server-side timestamp
      data.serverTimestamp = new Date();
      
      // Store IP address if available
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip');
      
      if (ip && !data.anonymizeIp) {
        data.ipAddress = ip;
      }

      // Insert the data into the test_events collection
      await db.collection('test_events').insertOne(data);
      console.log('Data saved to test_events collection');

      // Update site stats
      await db.collection('test_sites').updateOne(
        { siteId: data.siteId },
        { 
          $inc: { [`eventCounts.${data.eventName}`]: 1, totalEvents: 1 },
          $set: { lastUpdated: new Date() }
        },
        { upsert: true }
      );
    } catch (dbError) {
      console.error('Database error:', dbError);
    }
    
    // Return a success response
    return NextResponse.json({ 
      success: true, 
      message: 'Event data received and saved to database',
      eventName: data.eventName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing event data:', error);
    return NextResponse.json(
      { error: 'Failed to process event data' },
      { status: 500 }
    );
  }
} 