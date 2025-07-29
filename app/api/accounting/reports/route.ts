export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrismaClient } from '@/lib/db';
import { UserRole, OrderStatus, ExpenseStatus } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { z } from 'zod';

// Zod schemas for validation
const reportsQuerySchema = z.object({
  type: z.enum(['summary', 'detailed', 'vat', 'trends']).default('summary'),
  period: z.enum(['current-month', 'current-quarter', 'current-year', 'custom']).default('current-month'),
  startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid startDate format'
  }),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid endDate format'
  })
});

function getDateRange(period: string, startDate?: string, endDate?: string) {
  const now = new Date();
  let start: Date;
  let end: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (period) {
    case 'current-month':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'current-quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), quarter * 3, 1);
      break;
    case 'current-year':
      start = new Date(now.getFullYear(), 0, 1);
      break;
    case 'custom':
      if (!startDate || !endDate) {
        throw new Error('Start date and end date are required for custom period');
      }
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return { start, end };
}

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
    for (const key of ['type', 'period', 'startDate', 'endDate']) {
      if (searchParams.has(key)) queryObj[key] = searchParams.get(key);
    }
    const queryResult = reportsQuerySchema.safeParse(queryObj);

    if (!queryResult.success) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: queryResult.error.errors 
      }, { status: 400 });
    }

    const { type, period, startDate, endDate } = queryResult.data;
    const { start, end } = getDateRange(period, startDate, endDate);

    // Fetch orders data
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
      },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    // Fetch expenses data
    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: { gte: start, lte: end },
        status: { in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID] }
      },
      include: {
        category: true
      }
    });

    // Calculate revenue metrics
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + Number(order.totalAmount);
    }, 0);

    const vatCollected = orders.reduce((sum, order) => {
      return sum + Number(order.totalAmount) * 0.15 / 1.15; // Assuming 15% VAT
    }, 0);

    const netRevenue = totalRevenue - vatCollected;
    const orderCount = orders.length;
    const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

    // Calculate expense metrics
    const totalExpenses = expenses.reduce((sum, expense) => {
      return sum + Number(expense.amount);
    }, 0);

    const vatPaid = expenses.reduce((sum, expense) => {
      return sum + Number(expense.vatAmount || 0);
    }, 0);

    const netExpenses = totalExpenses - vatPaid;

    // Calculate profit
    const grossProfit = netRevenue - netExpenses;
    const netProfit = grossProfit;
    const profitMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

    // Calculate VAT liability
    const vatLiability = vatCollected - vatPaid;

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const categoryName = expense.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { amount: 0, count: 0 };
      }
      acc[categoryName].amount += Number(expense.amount);
      acc[categoryName].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    const expensesByCategoryArray = Object.entries(expensesByCategory)
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    // Calculate top products
    const productSales = orders.reduce((acc, order) => {
      order.items.forEach(item => {
        const productName = item.product.name;
        if (!acc[productName]) {
          acc[productName] = { revenue: 0, quantity: 0, cost: 0 };
        }
        acc[productName].revenue += Number(item.price) * item.quantity;
        acc[productName].quantity += item.quantity;
        // Assuming 60% cost of goods sold for profit calculation
        acc[productName].cost += Number(item.price) * item.quantity * 0.6;
      });
      return acc;
    }, {} as Record<string, { revenue: number; quantity: number; cost: number }>);

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({
        name,
        revenue: data.revenue,
        quantity: data.quantity,
        profit: data.revenue - data.cost
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const monthOrders = orders.filter(order => 
        order.createdAt >= monthStart && order.createdAt <= monthEnd
      );
      const monthExpensesData = expenses.filter(expense => 
        expense.expenseDate >= monthStart && expense.expenseDate <= monthEnd
      );

      const monthRevenue = monthOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      const monthExpensesTotal = monthExpensesData.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const monthProfit = monthRevenue - monthExpensesTotal;

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        expenses: monthExpensesTotal,
        profit: monthProfit
      });
    }

    const report = {
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString()
      },
      revenue: {
        total: totalRevenue,
        net: netRevenue,
        vat: vatCollected,
        orders: orderCount,
        averageOrderValue
      },
      expenses: {
        total: totalExpenses,
        net: netExpenses,
        vat: vatPaid,
        count: expenses.length,
        byCategory: expensesByCategoryArray
      },
      profit: {
        gross: grossProfit,
        net: netProfit,
        margin: profitMargin
      },
      vat: {
        collected: vatCollected,
        paid: vatPaid,
        liability: vatLiability
      },
      topProducts,
      monthlyTrends
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error generating financial report:', error);
    return NextResponse.json({ error: 'Failed to generate financial report' }, { status: 500 });
  }
} 
