import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrismaClient } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    // Get bank accounts
    const bankAccounts = await prisma.bankAccount.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ bankAccounts });
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    if (error instanceof Error && error.message.includes('Database not available')) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch bank accounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();

    const body = await request.json();
    const { bankName, accountNumber, autoReconcile, categories } = body;

    // Create or update bank account
    const bankAccount = await prisma.bankAccount.upsert({
      where: { accountNumber },
      update: {
        bankName,
        autoReconcile,
        categories: categories || {},
        updatedAt: new Date()
      },
      create: {
        accountNumber,
        bankName,
        autoReconcile: autoReconcile || false,
        categories: categories || {},
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ bankAccount });
  } catch (error) {
    console.error('Error creating bank account:', error);
    if (error instanceof Error && error.message.includes('Database not available')) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create bank account' },
      { status: 500 }
    );
  }
} 