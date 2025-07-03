import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { UserRole, ExpenseStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';

// Zod schemas for validation
const createExpenseSchema = z.object({
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Amount must be a positive number'
  }),
  expenseDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  categoryId: z.string().min(1, 'Category is required'),
  vendorName: z.string().optional(),
  notes: z.string().optional(),
  vatRate: z.string().optional().refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 0), {
    message: 'VAT rate must be a positive number'
  })
});

const getExpensesQuerySchema = z.object({
  status: z.string().optional(),
  categoryId: z.string().optional(),
  page: z.string().optional().refine((val) => !val || !isNaN(Number(val)), {
    message: 'Page must be a number'
  }),
  limit: z.string().optional().refine((val) => !val || !isNaN(Number(val)), {
    message: 'Limit must be a number'
  }),
  startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid startDate format'
  }),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid endDate format'
  })
});

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  const allowedRoles: UserRole[] = [UserRole.FINANCIAL_MANAGER, UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN];
  if (!user || !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryObj: any = {};
    for (const key of ['status', 'categoryId', 'page', 'limit', 'startDate', 'endDate']) {
      if (searchParams.has(key)) queryObj[key] = searchParams.get(key);
    }
    const queryResult = getExpensesQuerySchema.safeParse(queryObj);

    if (!queryResult.success) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: queryResult.error.errors 
      }, { status: 400 });
    }

    const { status, categoryId, page = '1', limit = '20', startDate, endDate } = queryResult.data;
    
    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) where.expenseDate.lte = new Date(endDate);
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.expense.count({ where })
    ]);
    
    return NextResponse.json({
      expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  const allowedRoles: UserRole[] = [UserRole.FINANCIAL_MANAGER, UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN];
  if (!user || !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = createExpenseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }

    const { description, amount, expenseDate, categoryId, vendorName, notes, vatRate } = validationResult.data;
    
    // Verify category exists
    const category = await prisma.expenseCategory.findUnique({
      where: { id: categoryId }
    });
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    const totalAmount = new Decimal(amount);
    const vatRateDecimal = new Decimal(vatRate || 15);
    const vatAmount = totalAmount.dividedBy(new Decimal(1).plus(vatRateDecimal.dividedBy(100))).times(vatRateDecimal.dividedBy(100));

    const newExpense = await prisma.expense.create({
      data: {
        description,
        amount: Number(totalAmount),
        expenseDate: new Date(expenseDate),
        categoryId,
        vatAmount: Number(vatAmount.toDecimalPlaces(2)),
        vatRate: Number(vatRateDecimal),
        status: ExpenseStatus.DRAFT,
        vendorName,
        notes,
        userId: user.id,
      },
      include: {
        category: true
      }
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
} 