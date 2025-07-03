import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Zod schemas for validation
const exportQuerySchema = z.object({
  format: z.enum(['csv', 'pdf']).default('csv'),
  action: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid startDate format'
  }),
  endDate: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: 'Invalid endDate format'
  }),
  search: z.string().optional()
});

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
    for (const key of ['format', 'action', 'userId', 'startDate', 'endDate', 'search']) {
      if (searchParams.has(key)) queryObj[key] = searchParams.get(key);
    }
    const queryResult = exportQuerySchema.safeParse(queryObj);

    if (!queryResult.success) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: queryResult.error.errors 
      }, { status: 400 });
    }

    const { format, action, userId, startDate, endDate, search } = queryResult.data;

    if (format === 'pdf') {
      return NextResponse.json({ error: 'PDF export not yet implemented' }, { status: 501 });
    }

    const where: any = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        {
          expense: {
            description: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        }
      ];
    }

    const auditLogs = await prisma.expenseAuditLog.findMany({
      where,
      include: {
        expense: {
          select: {
            description: true,
            amount: true,
            status: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const data = auditLogs.map(log => ({
      'Date & Time': new Date(log.createdAt).toLocaleString('en-ZA'),
      'Action': log.action,
      'User': log.user.name || log.user.email,
      'Expense Description': log.expense.description,
      'Expense Amount': Number(log.expense.amount).toFixed(2),
      'Expense Status': log.expense.status,
      'Before Data': log.before ? JSON.stringify(log.before) : '',
      'After Data': log.after ? JSON.stringify(log.after) : ''
    }));

    const headers = ['Date & Time', 'Action', 'User', 'Expense Description', 'Expense Amount', 'Expense Status', 'Before Data', 'After Data'];
    const csvData = generateCSV(data, headers);
    const filename = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Error exporting audit logs:', error);
    return NextResponse.json({ error: 'Failed to export audit logs' }, { status: 500 });
  }
} 