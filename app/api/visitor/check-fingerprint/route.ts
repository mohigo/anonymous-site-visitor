import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fingerprint = searchParams.get('fingerprint');

    if (!fingerprint) {
      return NextResponse.json({ error: 'Fingerprint is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('visitor-analytics');
    const collection = db.collection('visitors');

    // Look for a visitor with this fingerprint
    const existingVisitor = await collection.findOne({ visitorId: fingerprint });

    return NextResponse.json({
      exists: !!existingVisitor,
      // Only return minimal data if visitor exists
      visitor: existingVisitor ? {
        firstVisit: existingVisitor.firstVisit,
        visitCount: existingVisitor.visitCount
      } : null
    });
  } catch (error) {
    console.error('Error checking fingerprint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 