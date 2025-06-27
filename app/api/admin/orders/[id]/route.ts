// app/api/admin/orders/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== 'SUPER_ADMIN' &&
        session.user.role !== 'PLANT_MANAGER')
    ) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Admin order fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== 'SUPER_ADMIN' &&
        session.user.role !== 'PLANT_MANAGER')
    ) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { status, trackingNumber } = body;

    const updatedOrder = await db.order.update({
      where: { id: params.id },
      data: {
        status,
        trackingNumber,
      },
    });

    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating order' },
      { status: 500 }
    );
  }
}