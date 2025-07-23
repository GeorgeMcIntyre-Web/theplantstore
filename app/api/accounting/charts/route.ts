export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { getChartData } from '@/lib/accounting';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Zod schema for query parameters
const chartDataQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly']).default('monthly'),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format'
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid end date format'
  }),
  type: z.enum(['revenue', 'expenses', 'profit', 'vat']).optional()
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
    const queryResult = chartDataQuerySchema.safeParse({
      period: searchParams.get('period'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      type: searchParams.get('type')
    });

    if (!queryResult.success) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: queryResult.error.errors 
      }, { status: 400 });
    }

    const { period, startDate, endDate, type } = queryResult.data;
    
    const actualStartDate = new Date(startDate);
    const actualEndDate = new Date(endDate);
    
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
    
    // Validate period based on date range
    if (period === 'daily' && daysDiff > 90) {
      return NextResponse.json({ 
        error: 'Daily view limited to 90 days maximum' 
      }, { status: 400 });
    }
    
    if (period === 'weekly' && daysDiff > 365) {
      return NextResponse.json({ 
        error: 'Weekly view limited to 1 year maximum' 
      }, { status: 400 });
    }
    
    const chartData = await getChartData(period, actualStartDate, actualEndDate, user.role);
    
    // Filter data based on type if specified
    if (type) {
      switch (type) {
        case 'revenue':
          return NextResponse.json({
            period,
            data: chartData.revenue
          });
        case 'expenses':
          return NextResponse.json({
            period,
            data: chartData.expenses
          });
        case 'profit':
          // Calculate profit from revenue and expenses
          const profitData = chartData.revenue.map((revenueItem: any, index: number) => {
            const expenseItem = chartData.expenses[index];
            return {
              period: revenueItem.period,
              profit: (revenueItem.revenue || 0) - (expenseItem?.expenses || 0)
            };
          });
          return NextResponse.json({
            period,
            data: profitData
          });
        case 'vat':
          // Calculate VAT liability
          const vatData = chartData.revenue.map((revenueItem: any, index: number) => {
            const expenseItem = chartData.expenses[index];
            return {
              period: revenueItem.period,
              vatCollected: revenueItem.vat_collected || 0,
              vatPaid: expenseItem?.vat_paid || 0,
              vatLiability: (revenueItem.vat_collected || 0) - (expenseItem?.vat_paid || 0)
            };
          });
          return NextResponse.json({
            period,
            data: vatData
          });
        default:
          return NextResponse.json(chartData);
      }
    }
    
    return NextResponse.json(chartData);
  } catch (error) {
    console.error('Error getting chart data:', error);
    
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
      error: 'Failed to get chart data',
      message: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 });
  }
} 