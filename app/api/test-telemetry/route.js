import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get the data from the request
    const data = await request.json();
    
    // Log the received data
    console.log('Received telemetry data:', data);
    
    // Return a success response
    return NextResponse.json({ 
      success: true, 
      message: 'Telemetry data received',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing telemetry test data:', error);
    return NextResponse.json(
      { error: 'Failed to process telemetry data' },
      { status: 500 }
    );
  }
} 