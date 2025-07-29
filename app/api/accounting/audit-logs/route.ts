export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrismaClient } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Zod schemas for validation
const auditLogsQuerySchema = z.object({
  action: z.string().optional(),
  userId: z.string().optional(),
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
  }),
  search: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
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

    const { searchParams } = new URL(request.url);
    
    // Validate query parameters
    const queryObj: any = {};
    for (const key of ['action', 'userId', 'page', 'limit', 'startDate', 'endDate', 'search']) {
      if (searchParams.has(key)) queryObj[key] = searchParams.get(key);
    }
    const queryResult = auditLogsQuerySchema.safeParse(queryObj);

    if (!queryResult.success) {
      return NextResponse.json({ 
        error: 'Invalid query parameters', 
        details: queryResult.error.errors 
      }, { status: 400 });
    }

    const { action, userId, page = '1', limit = '20', startDate, endDate, search } = queryResult.data;
    
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
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const [auditLogs, total] = await Promise.all([
      prisma.expenseAuditLog.findMany({
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
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.expenseAuditLog.count({ where })
    ]);
    
    return NextResponse.json({
      auditLogs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
} 