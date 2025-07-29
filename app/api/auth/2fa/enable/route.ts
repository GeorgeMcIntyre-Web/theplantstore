import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrismaClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.twoFactorVerified) {
      return NextResponse.json({ error: '2FA not verified' }, { status: 400 });
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorVerified: false // Reset for next login
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA enable error:', error);
    return NextResponse.json({ error: 'Enable failed' }, { status: 500 });
  }
} 