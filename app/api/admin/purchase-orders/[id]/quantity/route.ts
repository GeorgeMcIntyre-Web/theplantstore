import { getPrismaClient } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const prisma = getPrismaClient();
    const { quantity } = await request.json();

    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: params.id },
      data: { quantity: parseInt(quantity) },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating purchase order quantity:', error);
    return NextResponse.json({ error: 'Failed to update quantity' }, { status: 500 });
  }
} 