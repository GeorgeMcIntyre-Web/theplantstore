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

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: '2FA already enabled' }, { status: 400 });
    }

    // Generate 2FA secret and QR code
    const { secret, qrCode, backupCodes } = TwoFactorService.generateSecret(user.email);

    // Generate QR code data URL
    const qrCodeDataURL = await TwoFactorService.generateQRCodeDataURL(qrCode);

    // Store secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        backupCodes: backupCodes
      }
    });

    return NextResponse.json({
      secret,
      qrCode: qrCodeDataURL,
      backupCodes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
} 