import { getPrismaClient } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const customers = await prisma.user.findMany({
      include: {
        orders: true,
        addresses: true,
      },
    });

    const csvData = customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      role: customer.role,
      totalOrders: customer.orders.length,
      totalSpent: customer.orders.reduce((sum, order) => sum + Number(order.totalAmount), 0),
      addresses: customer.addresses.length,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));

    return NextResponse.json(csvData);
  } catch (error) {
    console.error('Error exporting customers:', error);
    return NextResponse.json({ error: 'Failed to export customers' }, { status: 500 });
  }
} 
