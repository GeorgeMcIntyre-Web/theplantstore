import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrismaClient } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Zod schemas for validation
const updateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().optional(),
  isActive: z.boolean().optional()
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
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

    const category = await prisma.expenseCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    if (error instanceof Error && error.message.includes('Database not available')) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
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

    const body = await request.json();
    
    // Validate request body
    const validationResult = updateCategorySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { name, description, isActive } = validationResult.data;

    // Check if category exists
    const existingCategory = await prisma.expenseCategory.findUnique({
      where: { id: params.id }
    });

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Check if name is already taken by another category
    if (name && name !== existingCategory.name) {
      const nameExists = await prisma.expenseCategory.findFirst({
        where: {
          name,
          id: { not: params.id }
        }
      });

      if (nameExists) {
        return NextResponse.json({ error: 'Category name already exists' }, { status: 409 });
      }
    }

    // Update category
    const updatedCategory = await prisma.expenseCategory.update({
      where: { id: params.id },
      data: {
        name: name || existingCategory.name,
        description: description !== undefined ? description : existingCategory.description,
        isActive: isActive !== undefined ? isActive : existingCategory.isActive
      },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error instanceof Error && error.message.includes('Database not available')) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
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

    // Check if category exists and has associated expenses
    const category = await prisma.expenseCategory.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { expenses: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (category._count.expenses > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete category with associated expenses',
        expenseCount: category._count.expenses
      }, { status: 409 });
    }

    // Delete category
    await prisma.expenseCategory.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error instanceof Error && error.message.includes('Database not available')) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
} 