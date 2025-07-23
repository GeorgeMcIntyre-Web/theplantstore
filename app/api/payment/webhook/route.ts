import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { yocoService } from '@/lib/yoco';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-yoco-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!yocoService.verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.type) {
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.data);
        break;
      case 'payment.refunded':
        await handlePaymentRefunded(event.data);
        break;
      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(paymentData: any) {
  const order = await prisma.order.findFirst({
    where: { paymentReference: paymentData.id },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CONFIRMED',
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });
  }
}

async function handlePaymentFailed(paymentData: any) {
  const order = await prisma.order.findFirst({
    where: { paymentReference: paymentData.id },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'FAILED',
      },
    });
  }
}

async function handlePaymentRefunded(paymentData: any) {
  const order = await prisma.order.findFirst({
    where: { paymentReference: paymentData.id },
  });

  if (order) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'REFUNDED',
        paymentStatus: 'REFUNDED',
      },
    });
  }
} 