export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user and update newsletter subscription
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email not found in our system' },
        { status: 404 }
      );
    }

    if (!user.newsletterSubscribed) {
      return NextResponse.json(
        { error: 'You are not subscribed to our newsletter' },
        { status: 400 }
      );
    }

    // Update user to unsubscribe
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { newsletterSubscribed: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle GET requests for unsubscribe links
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Find user and update newsletter subscription
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email not found in our system' },
        { status: 404 }
      );
    }

    if (!user.newsletterSubscribed) {
      return NextResponse.json(
        { error: 'You are not subscribed to our newsletter' },
        { status: 400 }
      );
    }

    // Update user to unsubscribe
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { newsletterSubscribed: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 