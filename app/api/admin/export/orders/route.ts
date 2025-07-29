import { getPrismaClient } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        user: true,
      },
    });

    const csvData = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      taxAmount: order.taxAmount,
      totalAmount: order.totalAmount,
      customerName: order.user?.name || '',
      customerEmail: order.user?.email || '',
      shippingAddress: order.shippingAddress ? `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}` : '',
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return NextResponse.json(csvData);
  } catch (error) {
    console.error('Error exporting orders:', error);
    return NextResponse.json({ error: 'Failed to export orders' }, { status: 500 });
  }
} 
