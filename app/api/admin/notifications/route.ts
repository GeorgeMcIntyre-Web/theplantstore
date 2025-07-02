import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
// import { getSessionUserId } from '@/lib/auth'; // Placeholder for user context

// GET: Fetch notifications for the current user
export async function GET(req: NextRequest) {
  // const userId = await getSessionUserId(req); // Replace with real user context
  const userId = req.nextUrl.searchParams.get('userId'); // TEMP: for testing
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(notifications);
}

// POST: Create a new notification
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, type, message, link } = body;
  if (!userId || !type || !message) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const notification = await prisma.notification.create({
    data: { userId, type, message, link },
  });
  return NextResponse.json(notification, { status: 201 });
}

// PATCH: Mark notification as read
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'Missing notification id' }, { status: 400 });
  const notification = await prisma.notification.update({
    where: { id },
    data: { read: true },
  });
  return NextResponse.json(notification);
} 