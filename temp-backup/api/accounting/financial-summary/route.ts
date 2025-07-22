export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { UserRole, OrderStatus, ExpenseStatus } from '@prisma/client';
import { z } from 'zod';

// Zod schemas for validation
const summaryQuerySchema = z.object({
  period: z.enum(['current-month', 'current-quarter', 'current-year']).default('current-month')
});

function getDateRange(period: string) {
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
    for (const key of ['period']) {
      if (searchParams.has(key)) queryObj[key] = searchParams.get(key);
    }
    const queryResult = summaryQuerySchema.safeParse(queryObj);

    if (!queryResult.success) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: queryResult.error.errors 
      }, { status: 400 });
    }

    const { period } = queryResult.data;
    const { start, end } = getDateRange(period);

    // Fetch orders data
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
      }
    });

    // Fetch expenses data
    const expenses = await prisma.expense.findMany({
      where: {
        expenseDate: { gte: start, lte: end },
        status: { in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID] }
      }
    });

    // Calculate revenue metrics
    const totalRevenue = orders.reduce((sum, order) => {
      return sum + Number(order.totalAmount);
    }, 0);

    const vatCollected = orders.reduce((sum, order) => {
      return sum + Number(order.vatAmount);
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

    // Get expense breakdown by category
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        expenseDate: { gte: start, lte: end },
        status: { in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID] }
      },
      _sum: {
        amount: true
      }
    });

    const categoryDetails = await Promise.all(
      expensesByCategory.map(async (group) => {
        const category = await prisma.expenseCategory.findUnique({
          where: { id: group.categoryId }
        });
        return {
          category: category?.name || 'Unknown',
          amount: Number(group._sum.amount)
        };
      })
    );

    // Get top products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: start, lte: end },
          status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
        }
      },
      _sum: {
        totalPrice: true,
        quantity: true
      },
      orderBy: {
        _sum: {
          totalPrice: 'desc'
        }
      },
      take: 5
    });

    const productDetails = await Promise.all(
      topProducts.map(async (group) => {
        const product = await prisma.product.findUnique({
          where: { id: group.productId }
        });
        return {
          name: product?.name || 'Unknown Product',
          revenue: Number(group._sum.totalPrice),
          quantity: Number(group._sum.quantity)
        };
      })
    );

    // Calculate monthly trends (last 6 months)
    const monthlyTrends = [];
    const currentDate = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const monthOrders = orders.filter(order => 
        order.createdAt >= monthStart && order.createdAt <= monthEnd
      );
      const monthExpenses = expenses.filter(expense => 
        expense.expenseDate >= monthStart && expense.expenseDate <= monthEnd
      );

      const monthRevenue = monthOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0);
      const monthExpensesTotal = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
      const monthProfit = monthRevenue - monthExpensesTotal;

      monthlyTrends.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        expenses: monthExpensesTotal,
        profit: monthProfit
      });
    }

    const summary = {
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
        byCategory: categoryDetails
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
      topProducts: productDetails,
      monthlyTrends
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating financial summary:', error);
    return NextResponse.json({ error: 'Failed to generate financial summary' }, { status: 500 });
  }
} 