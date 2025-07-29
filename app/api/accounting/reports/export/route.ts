export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrismaClient } from '@/lib/db';
import { UserRole, OrderStatus, ExpenseStatus } from '@prisma/client';
import { z } from 'zod';

// Zod schemas for validation
const exportQuerySchema = z.object({
  type: z.enum(['summary', 'detailed', 'vat', 'trends']).default('summary'),
  period: z.enum(['current-month', 'current-quarter', 'current-year', 'custom']).default('current-month'),
  format: z.enum(['csv', 'pdf']).default('csv'),
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

function generateCSV(data: any[], headers: string[]): string {
  const csvRows = [headers.join(',')];
  
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value).replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

export async function GET(request: NextRequest) {
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

  try {
    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryObj: any = {};
    for (const key of ['type', 'period', 'format', 'startDate', 'endDate']) {
      if (searchParams.has(key)) queryObj[key] = searchParams.get(key);
    }
    const queryResult = exportQuerySchema.safeParse(queryObj);

    if (!queryResult.success) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: queryResult.error.errors 
      }, { status: 400 });
    }

    const { type, period, format, startDate, endDate } = queryResult.data;
    const { start, end } = getDateRange(period, startDate, endDate);

    if (format === 'pdf') {
      return NextResponse.json({ error: 'PDF export not yet implemented' }, { status: 501 });
    }

    // Fetch data based on report type
    let csvData: string;
    let filename: string;

    switch (type) {
      case 'summary':
        csvData = await generateSummaryCSV(start, end, prisma);
        filename = `financial-summary-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      case 'detailed':
        csvData = await generateDetailedCSV(start, end, prisma);
        filename = `financial-detailed-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      case 'vat':
        csvData = await generateVATCSV(start, end, prisma);
        filename = `vat-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      case 'trends':
        csvData = await generateTrendsCSV(start, end, prisma);
        filename = `financial-trends-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting financial report:', error);
    return NextResponse.json({ error: 'Failed to export financial report' }, { status: 500 });
  }
}

async function generateSummaryCSV(start: Date, end: Date, prisma: any): Promise<string> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
    }
  });

  const expenses = await prisma.expense.findMany({
    where: {
      expenseDate: { gte: start, lte: end },
      status: { in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID] }
    },
    include: { category: true }
  });

  const totalRevenue = orders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);
  const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + Number(expense.amount), 0);
  const profit = totalRevenue - totalExpenses;

  const data = [
    {
      'Period Start': start.toLocaleDateString(),
      'Period End': end.toLocaleDateString(),
      'Total Revenue': totalRevenue.toFixed(2),
      'Total Expenses': totalExpenses.toFixed(2),
      'Net Profit': profit.toFixed(2),
      'Profit Margin %': totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(2) : '0.00',
      'Order Count': orders.length,
      'Expense Count': expenses.length
    }
  ];

  const headers = ['Period Start', 'Period End', 'Total Revenue', 'Total Expenses', 'Net Profit', 'Profit Margin %', 'Order Count', 'Expense Count'];
  return generateCSV(data, headers);
}

async function generateDetailedCSV(start: Date, end: Date, prisma: any): Promise<string> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
    },
    include: { items: { include: { product: true } } }
  });

  const expenses = await prisma.expense.findMany({
    where: {
      expenseDate: { gte: start, lte: end },
      status: { in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID] }
    },
    include: { category: true }
  });

  const data = [
    // Revenue section
    ...orders.map((order: any) => ({
      'Type': 'Revenue',
      'Date': order.createdAt.toLocaleDateString(),
      'Reference': order.orderNumber,
      'Description': `Order ${order.orderNumber}`,
      'Amount': Number(order.totalAmount).toFixed(2),
      'Category': 'Sales',
      'VAT Amount': Number(order.vatAmount).toFixed(2),
      'Net Amount': (Number(order.totalAmount) - Number(order.vatAmount)).toFixed(2)
    })),
    // Expense section
    ...expenses.map((expense: any) => ({
      'Type': 'Expense',
      'Date': expense.expenseDate.toLocaleDateString(),
      'Reference': expense.id,
      'Description': expense.description,
      'Amount': Number(expense.amount).toFixed(2),
      'Category': expense.category.name,
      'VAT Amount': Number(expense.vatAmount || 0).toFixed(2),
      'Net Amount': (Number(expense.amount) - Number(expense.vatAmount || 0)).toFixed(2)
    }))
  ];

  const headers = ['Type', 'Date', 'Reference', 'Description', 'Amount', 'Category', 'VAT Amount', 'Net Amount'];
  return generateCSV(data, headers);
}

async function generateVATCSV(start: Date, end: Date, prisma: any): Promise<string> {
  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
    }
  });

  const expenses = await prisma.expense.findMany({
    where: {
      expenseDate: { gte: start, lte: end },
      status: { in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID] }
    }
  });

  const vatCollected = orders.reduce((sum: number, order: any) => sum + Number(order.vatAmount), 0);
  const vatPaid = expenses.reduce((sum: number, expense: any) => sum + Number(expense.vatAmount || 0), 0);
  const vatLiability = vatCollected - vatPaid;

  const data = [
    {
      'Period Start': start.toLocaleDateString(),
      'Period End': end.toLocaleDateString(),
      'VAT Collected': vatCollected.toFixed(2),
      'VAT Paid': vatPaid.toFixed(2),
      'Net VAT Liability': vatLiability.toFixed(2),
      'VAT Status': vatLiability > 0 ? 'Payable' : vatLiability < 0 ? 'Refundable' : 'Balanced'
    }
  ];

  const headers = ['Period Start', 'Period End', 'VAT Collected', 'VAT Paid', 'Net VAT Liability', 'VAT Status'];
  return generateCSV(data, headers);
}

async function generateTrendsCSV(start: Date, end: Date, prisma: any): Promise<string> {
  const currentDate = new Date();
  const data = [];

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0, 23, 59, 59, 999);

    const monthOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
        status: { in: [OrderStatus.DELIVERED, OrderStatus.PROCESSING, OrderStatus.SHIPPED] }
      }
    });

    const monthExpenses = await prisma.expense.findMany({
      where: {
        expenseDate: { gte: monthStart, lte: monthEnd },
        status: { in: [ExpenseStatus.APPROVED, ExpenseStatus.PAID] }
      }
    });

    const revenue = monthOrders.reduce((sum: number, order: any) => sum + Number(order.totalAmount), 0);
    const expenses = monthExpenses.reduce((sum: number, expense: any) => sum + Number(expense.amount), 0);
    const profit = revenue - expenses;

    data.push({
      'Month': monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      'Revenue': revenue.toFixed(2),
      'Expenses': expenses.toFixed(2),
      'Profit': profit.toFixed(2),
      'Profit Margin %': revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : '0.00',
      'Order Count': monthOrders.length,
      'Expense Count': monthExpenses.length
    });
  }

  const headers = ['Month', 'Revenue', 'Expenses', 'Profit', 'Profit Margin %', 'Order Count', 'Expense Count'];
  return generateCSV(data, headers);
} 
