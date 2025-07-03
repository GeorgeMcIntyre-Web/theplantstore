import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { getFinancialSummary } from '@/lib/accounting';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Zod schema for query parameters
const financialSummaryQuerySchema = z.object({
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format'
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format'
  }),
  period: z.enum(['current-month', 'current-quarter', 'current-year']).optional()
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
    const queryResult = financialSummaryQuerySchema.safeParse({
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      period: searchParams.get('period')
    });

    if (!queryResult.success) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: queryResult.error.errors 
      }, { status: 400 });
    }

    const { startDate, endDate, period } = queryResult.data;
    
    let actualStartDate: Date;
    let actualEndDate: Date;
    
    if (period) {
      // Use predefined periods
      const now = new Date();
      switch (period) {
        case 'current-month':
          actualStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
          actualEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'current-quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          actualStartDate = new Date(now.getFullYear(), quarter * 3, 1);
          actualEndDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
          break;
        case 'current-year':
          actualStartDate = new Date(now.getFullYear(), 0, 1);
          actualEndDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          return NextResponse.json({ error: 'Invalid period specified' }, { status: 400 });
      }
    } else {
      // Use provided dates
      actualStartDate = new Date(startDate);
      actualEndDate = new Date(endDate);
    }
    
    // Validate date range
    if (actualStartDate >= actualEndDate) {
      return NextResponse.json({ 
        error: 'Start date must be before end date' 
      }, { status: 400 });
    }
    
    // Limit date range to prevent performance issues
    const maxDays = 365; // 1 year max
    const daysDiff = Math.ceil((actualEndDate.getTime() - actualStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > maxDays) {
      return NextResponse.json({ 
        error: `Date range too large. Maximum ${maxDays} days allowed.` 
      }, { status: 400 });
    }
    
    const summary = await getFinancialSummary(actualStartDate, actualEndDate, user.role);
    
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error getting financial summary:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('Insufficient permissions')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
      if (error.message.includes('Start date must be before end date')) {
        return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      error: 'Failed to get financial summary',
      message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
} 