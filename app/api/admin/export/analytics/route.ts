import { getPrismaClient } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const prisma = getPrismaClient();
    
    // Get analytics data
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });
    const totalCustomers = await prisma.user.count({
      where: { role: 'CUSTOMER' },
    });
    const totalProducts = await prisma.product.count();

    const analyticsData = {
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalCustomers,
      totalProducts,
      exportDate: new Date().toISOString(),
    };

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error('Error exporting analytics:', error);
    return NextResponse.json({ error: 'Failed to export analytics' }, { status: 500 });
  }
} 
