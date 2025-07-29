export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPrismaClient } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get analytics data
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });
    const totalProducts = await prisma.product.count();

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    // Get sales data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const salesData = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        totalAmount: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get customer growth data
    const customerGrowthData = await prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        role: 'CUSTOMER',
        createdAt: {
          gte: thirtyDaysAgo
        }
      },
      _count: true,
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get top products
    const topProductsData = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    // Get revenue by category
    const revenueByCategoryData = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        price: true
      },
      orderBy: {
        _sum: {
          price: 'desc'
        }
      },
      take: 5
    });

    const analyticsData = {
      salesData: salesData.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        sales: item._sum.totalAmount || 0
      })),
      customerGrowthData: customerGrowthData.map(item => ({
        date: item.createdAt.toISOString().split('T')[0],
        customers: item._count
      })),
      topProductsData: topProductsData.map(item => ({
        productId: item.productId,
        quantity: item._sum.quantity || 0
      })),
      revenueByCategoryData: revenueByCategoryData.map(item => ({
        productId: item.productId,
        revenue: item._sum.price || 0
      })),
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        user: order.user
      })),
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalCustomers,
      totalProducts,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
} 
