import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';

// POST: Assign notifications to a user and update status
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { notificationIds, userId, status } = body;
  if (!notificationIds || !userId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  
  const prisma = getPrismaClient();
  const updates = await Promise.all(
    notificationIds.map((id: string) =>
      prisma.notification.update({
        where: { id },
        data: {
          assignedTo: userId,
          status: status || 'pending',
        },
      })
    )
  );
  return NextResponse.json({ updated: updates.length });
} 
