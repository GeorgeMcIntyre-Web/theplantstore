import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';
// import { getSessionUserId } from '@/lib/auth'; // Placeholder for user context

// GET: Fetch all notifications for admin view
export async function GET(req: NextRequest) {
  try {
    const notifications = await prisma.notification.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST: Create a new notification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, type, message, link } = body;
    
    if (!userId || !type || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const notification = await prisma.notification.create({
      data: { 
        userId, 
        type, 
        message, 
        link,
      },
    });
    
    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
}

// PATCH: Mark notification as read
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing notification id' }, { status: 400 });
    }
    
    const notification = await prisma.notification.update({
      where: { id },
      data: { read: true },
    });
    
    return NextResponse.json(notification);
  } catch (error) {
    console.error('Failed to update notification:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
} 
