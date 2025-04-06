import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import Contact from '@/lib/models/contact';

export async function POST(request: Request) {
  try {
    // Connect to database using the same client as visitor analytics
    const client = await clientPromise;
    const db = client.db('visitor-analytics');
    const collection = db.collection('contacts');

    // Parse the request body
    const body = await request.json();
    const { name, email, subject, message, source } = body;

    // Validate required fields
    if (!name || !email || !subject || !message || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create new contact submission
    const contact = await collection.insertOne({
      name,
      email,
      subject,
      message,
      source,
      status: 'new',
      createdAt: new Date()
    });

    return NextResponse.json(
      { message: 'Contact submission successful', id: contact.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in contact submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 