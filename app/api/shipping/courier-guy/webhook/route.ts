import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-courier-guy-signature');

    // Verify webhook signature (if The Courier Guy provides one)
    if (signature && !verifySignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);

    // Handle tracking updates
    if (data.event_type === 'tracking_update') {
      await handleTrackingUpdate(data);
    }

    // Handle delivery confirmation
    if (data.event_type === 'delivery_confirmation') {
      await handleDeliveryConfirmation(data);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Courier Guy webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleTrackingUpdate(data: any) {
  const { waybill_number, status_code, status_description, location } = data;

  const order = await prisma.order.findFirst({
    where: { trackingNumber: waybill_number },
  });

  if (order) {
    let orderStatus = order.status;

    // Map Courier Guy status to order status
    switch (status_code) {
      case 'COLLECTED':
        orderStatus = 'PROCESSING';
        break;
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        orderStatus = 'SHIPPED';
        break;
      case 'DELIVERED':
        orderStatus = 'DELIVERED';
        break;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        deliveredAt: status_code === 'DELIVERED' ? new Date() : order.deliveredAt,
      },
    });

    // Send notification to customer if needed
    // await sendCustomerNotification(order, status_description);
  }
}

async function handleDeliveryConfirmation(data: any) {
  const { waybill_number, delivered_at, recipient_name } = data;

  const order = await prisma.order.findFirst({
    where: { trackingNumber: waybill_number },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'DELIVERED',
        deliveredAt: new Date(delivered_at),
      },
    });
  }
}

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.COURIER_GUY_WEBHOOK_SECRET;
  if (!secret) return true; // Skip verification if no secret configured

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  return signature === expectedSignature;
} 