import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import Contact from '@/lib/models/contact';

export async function POST(request: Request) {
  try {
    // Connect to database
    await connectToDatabase();

    // Parse the request body
    const body = await request.json();
    const { name, email, plan } = body;

    // Validate required fields
    if (!name || !email || !plan) {
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
      subject: `${plan} Trial Request`,
      message: `New trial request for ${plan} plan.`,
      source: plan === 'Pro' ? 'start_pro' : 'start_free',
    });

    return NextResponse.json(
      { message: 'Trial request submitted successfully', id: contact._id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in trial request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 