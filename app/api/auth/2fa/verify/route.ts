import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TwoFactorService } from '@/lib/2fa';
import { getPrismaClient } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token, backupCode } = await request.json();
    const prisma = getPrismaClient();
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let isValid = false;

    if (backupCode) {
      // Verify backup code
      isValid = user.backupCodes?.includes(backupCode) ?? false;
      if (isValid) {
        // Remove used backup code
        const updatedBackupCodes = user.backupCodes.filter(code => code !== backupCode);
        await prisma.user.update({
          where: { id: user.id },
          data: { backupCodes: updatedBackupCodes }
        });
      }
    } else if (token && user.twoFactorSecret) {
      // Verify TOTP token
      isValid = TwoFactorService.verifyToken(token, user.twoFactorSecret);
    }

    if (isValid) {
      // Mark 2FA as verified for this session
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorVerified: true }
      });
    }

    return NextResponse.json({ success: isValid });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
} 