import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { createExpenseJournalEntry } from '@/lib/accounting';
import { UserRole, ExpenseStatus } from '@prisma/client';
import { z } from 'zod';

// Zod schema for approval request
const approveExpenseSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be either APPROVED or REJECTED' })
  }),
  comments: z.string().max(1000, 'Comments too long').optional()
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email } 
  });
  
  // STRICT PERMISSION: Only FINANCIAL_MANAGER or SUPER_ADMIN can approve
  const allowedRoles: UserRole[] = [UserRole.FINANCIAL_MANAGER, UserRole.SUPER_ADMIN];
  if (!user || !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Approval permission denied' }, { status: 403 });
  }

  try {
    const expenseId = params.id;
    
    // Validate expense ID
    if (!expenseId || typeof expenseId !== 'string') {
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 });
    }
    
    const body = await request.json();
    
    // Validate request body
    const validationResult = approveExpenseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: validationResult.error.errors 
      }, { status: 400 });
    }
    
    const { status, comments } = validationResult.data;
    
    const expense = await prisma.expense.findUnique({ 
      where: { id: expenseId },
      include: { category: true }
    });

    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }

    if (expense.status !== ExpenseStatus.PENDING_APPROVAL) {
      return NextResponse.json({ 
        error: 'Expense is not pending approval',
        currentStatus: expense.status 
      }, { status: 400 });
    }

    // Use a transaction to update status and create financial records
    const transactionResult = await prisma.$transaction(async (tx) => {
      const updatedExpense = await tx.expense.update({
        where: { id: expenseId },
        data: { 
          status: status === 'APPROVED' ? ExpenseStatus.APPROVED : ExpenseStatus.REJECTED 
        },
        include: { category: true }
      });

      await tx.expenseApproval.create({
        data: {
          expenseId: expenseId,
          approverId: user.id,
          status: status,
          comments: comments,
        },
      });

      // Only create journal entry if approved
      if (status === 'APPROVED') {
        const journalEntry = await createExpenseJournalEntry(updatedExpense, tx);
        
        // Link the journal entry back to the expense
        await tx.expense.update({
          where: { id: expenseId },
          data: { journalEntryId: journalEntry.id }
        });
      }

      return updatedExpense;
    });

    return NextResponse.json(transactionResult, { status: 200 });
  } catch (error) {
    console.error('Error approving expense:', error);
    return NextResponse.json({ error: 'Failed to approve expense' }, { status: 500 });
  }
} 