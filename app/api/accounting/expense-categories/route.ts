import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrismaClient } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
    
    const allowedRoles: UserRole[] = [UserRole.FINANCIAL_MANAGER, UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN];
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const categories = await prisma.expenseCategory.findMany({
      include: {
        _count: {
          select: { expenses: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    if (error instanceof Error && error.message.includes('Database not available')) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch expense categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
    
    const allowedRoles: UserRole[] = [UserRole.FINANCIAL_MANAGER, UserRole.SUPER_ADMIN];
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const data = await request.json();
    
    if (!data.name || !data.name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Check if category name already exists
    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { name: data.name.trim() }
    });

    if (existingCategory) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 });
    }

    const newCategory = await prisma.expenseCategory.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        isActive: data.isActive !== undefined ? data.isActive : true
      },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating expense category:', error);
    if (error instanceof Error && error.message.includes('Database not available')) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to create expense category' }, { status: 500 });
  }
} 
