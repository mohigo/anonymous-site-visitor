import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Contact from '@/lib/models/contact';

export async function POST(request: Request) {
  try {
    // Connect to database
    await connectToDatabase();

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
    const contact = await Contact.create({
      name,
      email,
      subject,
      message,
      source,
    });

    return NextResponse.json(
      { message: 'Contact submission successful', id: contact._id },
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