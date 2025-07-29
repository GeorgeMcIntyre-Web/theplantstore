import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPrismaClient } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

const reconcileSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID is required'),
  expenseId: z.string().min(1, 'Expense ID is required')
});

const autoReconcileSchema = z.object({
  accountNumber: z.string().min(1, 'Account number is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional()
});

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
    const { action, ...data } = body;

    if (action === 'manual') {
      const validationResult = reconcileSchema.safeParse(data);
      if (!validationResult.success) {
        return NextResponse.json({
          error: 'Invalid request data',
          details: validationResult.error.errors
        }, { status: 400 });
      }

      const { transactionId, expenseId } = validationResult.data;

      // Verify transaction and expense exist
      const [transaction, expense] = await Promise.all([
        prisma.bankTransaction.findUnique({ where: { id: transactionId } }),
        prisma.expense.findUnique({ where: { id: expenseId } })
      ]);

      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }

      if (!expense) {
        return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
      }

      // Check if amounts match (within tolerance)
      const transactionAmount = typeof transaction.amount === 'object' && transaction.amount !== null && 'toNumber' in transaction.amount 
        ? (transaction.amount as any).toNumber() 
        : Number(transaction.amount);
      const expenseAmount = typeof expense.amount === 'object' && expense.amount !== null && 'toNumber' in expense.amount 
        ? (expense.amount as any).toNumber() 
        : Number(expense.amount);
      
      const amountDiff = Math.abs(transactionAmount - expenseAmount);
      if (amountDiff > 0.01) {
        return NextResponse.json({ 
          error: 'Amount mismatch', 
          transactionAmount: transactionAmount,
          expenseAmount: expenseAmount
        }, { status: 400 });
      }

      // Reconcile the transaction
      const reconciledTransaction = await prisma.bankTransaction.update({
        where: { id: transactionId },
        data: {
          reconciled: true,
          reconciledAt: new Date(),
          expenseId: expenseId
        },
        include: {
          expense: {
            include: {
              category: true
            }
          }
        }
      });

      return NextResponse.json({
        message: 'Transaction reconciled successfully',
        transaction: reconciledTransaction
      });

    } else if (action === 'auto') {
      const validationResult = autoReconcileSchema.safeParse(data);
      if (!validationResult.success) {
        return NextResponse.json({
          error: 'Invalid request data',
          details: validationResult.error.errors
        }, { status: 400 });
      }

      const { accountNumber, startDate, endDate } = validationResult.data;

      // Get unreconciled transactions
      const where: any = {
        accountNumber,
        reconciled: false
      };

      if (startDate || endDate) {
        where.transactionDate = {};
        if (startDate) where.transactionDate.gte = new Date(startDate);
        if (endDate) where.transactionDate.lte = new Date(endDate);
      }

      const unreconciledTransactions = await prisma.bankTransaction.findMany({
        where,
        orderBy: { transactionDate: 'desc' }
      });

      // Get unreconciled expenses
      const unreconciledExpenses = await prisma.expense.findMany({
        where: {
          status: 'APPROVED',
          bankTransactions: null
        },
        include: {
          category: true
        },
        orderBy: { expenseDate: 'desc' }
      });

      let reconciledCount = 0;
      const results = [];

      // Auto-reconcile based on amount and date proximity
      for (const transaction of unreconciledTransactions) {
        const matchingExpense = unreconciledExpenses.find(expense => {
          const transactionAmount = typeof transaction.amount === 'object' && transaction.amount !== null && 'toNumber' in transaction.amount 
            ? (transaction.amount as any).toNumber() 
            : Number(transaction.amount);
          const expenseAmount = typeof expense.amount === 'object' && expense.amount !== null && 'toNumber' in expense.amount 
            ? (expense.amount as any).toNumber() 
            : Number(expense.amount);
          
          const amountMatch = Math.abs(transactionAmount - expenseAmount) < 0.01;
          const dateMatch = Math.abs(
            transaction.transactionDate.getTime() - expense.expenseDate.getTime()
          ) < 7 * 24 * 60 * 60 * 1000; // Within 7 days

          return amountMatch && dateMatch;
        });

        if (matchingExpense) {
          await prisma.bankTransaction.update({
            where: { id: transaction.id },
            data: {
              reconciled: true,
              reconciledAt: new Date(),
              expenseId: matchingExpense.id
            }
          });

          reconciledCount++;
          results.push({
            transactionId: transaction.id,
            expenseId: matchingExpense.id,
            amount: typeof transaction.amount === 'object' && transaction.amount !== null && 'toNumber' in transaction.amount 
              ? (transaction.amount as any).toNumber() 
              : Number(transaction.amount),
            date: transaction.transactionDate
          });
        }
      }

      return NextResponse.json({
        message: `Auto-reconciled ${reconciledCount} transactions`,
        reconciledCount,
        results
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error reconciling transactions:', error);
    return NextResponse.json({ error: 'Failed to reconcile transactions' }, { status: 500 });
  }
} 
