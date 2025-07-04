import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// Helper: Only allow SUPER_ADMIN or FINANCIAL_MANAGER
async function requireAdmin(request: NextRequest): Promise<{ id: string; email: string; name: string; role: string; } | NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['SUPER_ADMIN', 'FINANCIAL_MANAGER'].includes(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  return session.user;
}

// GET: List all settings
export async function GET(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof NextResponse) return user;
  const settings = await prisma.setting.findMany();
  return NextResponse.json(settings);
}

// POST: Create a new setting
export async function POST(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof NextResponse) return user;
  const { key, value, category, description } = await request.json();
  if (!key || !value || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const setting = await prisma.setting.create({
      data: {
        key,
        value,
        category,
        description,
        updatedBy: user.id,
      },
    });
    return NextResponse.json(setting, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Key must be unique or other error.' }, { status: 400 });
  }
}

// PUT: Update a setting (by key)
export async function PUT(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof NextResponse) return user;
  const { key, value, category, description } = await request.json();
  if (!key || !value) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  try {
    const setting = await prisma.setting.update({
      where: { key },
      data: {
        value,
        category,
        description,
        updatedBy: user.id,
      },
    });
    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: 'Setting not found or other error.' }, { status: 404 });
  }
}

// DELETE: Remove a setting (by key)
export async function DELETE(request: NextRequest) {
  const user = await requireAdmin(request);
  if (user instanceof NextResponse) return user;
  const { key } = await request.json();
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 });
  }
  try {
    await prisma.setting.delete({ where: { key } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Setting not found or other error.' }, { status: 404 });
  }
} 