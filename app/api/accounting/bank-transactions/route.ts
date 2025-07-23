import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schemas
const createTransactionSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  transactionDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format'
  }),
  description: z.string().min(1, 'Description is required'),
  amount: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'Amount must be a number'
  }),
  type: z.enum(['credit', 'debit']),
  bankReference: z.string().min(1, 'Bank reference is required'),
  category: z.string().optional(),
  balance: z.string().refine((val) => !isNaN(Number(val)), {
    message: 'Balance must be a number'
  })
});

const getTransactionsQuerySchema = z.object({
  accountNumber: z.string().optional(),
  reconciled: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const allowedRoles: UserRole[] = [UserRole.FINANCIAL_MANAGER, UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN];
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const queryObj: any = {};
    for (const key of ['accountNumber', 'reconciled', 'startDate', 'endDate', 'page', 'limit']) {
      if (searchParams.has(key)) queryObj[key] = searchParams.get(key);
    }

    const queryResult = getTransactionsQuerySchema.safeParse(queryObj);
    if (!queryResult.success) {
      return NextResponse.json({
        error: 'Invalid query parameters',
        details: queryResult.error.errors
      }, { status: 400 });
    }

    const { accountNumber, reconciled, startDate, endDate, page = '1', limit = '20' } = queryResult.data;

    const where: any = {};
    if (accountNumber) where.accountNumber = accountNumber;
    if (reconciled !== undefined) where.reconciled = reconciled === 'true';
    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) where.transactionDate.gte = new Date(startDate);
      if (endDate) where.transactionDate.lte = new Date(endDate);
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, total] = await Promise.all([
      prisma.bankTransaction.findMany({
        where,
        include: {
          bankAccount: true,
          expense: {
            include: {
              category: true
            }
          }
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.bankTransaction.count({ where })
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching bank transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    const allowedRoles: UserRole[] = [UserRole.FINANCIAL_MANAGER, UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN];
    if (!user || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = createTransactionSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      }, { status: 400 });
    }

    const { accountNumber, transactionDate, description, amount, type, bankReference, category, balance } = validationResult.data;

    // Verify bank account exists
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { accountNumber }
    });

    if (!bankAccount) {
      return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    }

    // Check if transaction already exists
    const existingTransaction = await prisma.bankTransaction.findUnique({
      where: { bankReference }
    });

    if (existingTransaction) {
      return NextResponse.json({ error: 'Transaction with this reference already exists' }, { status: 409 });
    }

    const transaction = await prisma.bankTransaction.create({
      data: {
        accountNumber,
        transactionDate: new Date(transactionDate),
        description,
        amount: parseFloat(amount),
        type,
        bankReference,
        category,
        balance: parseFloat(balance)
      },
      include: {
        bankAccount: true
      }
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating bank transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
} 