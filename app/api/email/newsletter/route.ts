import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { emailService } from '@/lib/email/email-service';
import { getPrismaClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has admin privileges
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'PLANT_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { subject, content, testEmail } = body;

    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, content' },
        { status: 400 }
      );
    }

    // If test email is provided, send only to that email
    if (testEmail) {
      const success = await emailService.sendNewsletter(testEmail, content);
      
      if (success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Test newsletter sent successfully' 
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to send test newsletter' },
          { status: 500 }
        );
      }
    }

    // Get all newsletter subscribers
    const prisma = getPrismaClient();
    const subscribers = await prisma.user.findMany({
      where: {
        newsletterSubscribed: true,
        NOT: { emailVerified: null },
      },
      select: {
        email: true,
        name: true,
      },
    });

    if (subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No newsletter subscribers found' },
        { status: 404 }
      );
    }

    // Send newsletter to all subscribers
    const emailPromises = subscribers.map((subscriber: any) =>
      emailService.sendNewsletter(subscriber.email, content)
    );

    const results = await Promise.allSettled(emailPromises);
    const successfulSends = results.filter((result: any) => 
      result.status === 'fulfilled' && result.value === true
    ).length;

    const failedSends = results.length - successfulSends;

    return NextResponse.json({
      success: true,
      message: `Newsletter sent to ${successfulSends} subscribers`,
      stats: {
        total: subscribers.length,
        successful: successfulSends,
        failed: failedSends,
      },
    });
  } catch (error) {
    console.error('Newsletter sending error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get newsletter subscribers count
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'PLANT_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const prisma = getPrismaClient();
    const subscriberCount = await prisma.user.count({
      where: {
        newsletterSubscribed: true,
        NOT: { emailVerified: null },
      },
    });

    return NextResponse.json({
      subscriberCount,
    });
  } catch (error) {
    console.error('Newsletter stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
