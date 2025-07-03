import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { yocoService } from '@/lib/yoco';
import { authOptions } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { 
      token, 
      amount, 
      customerDetails, 
      shippingDetails, 
      items 
    } = body;

    // Validate required fields
    if (!token || !amount || !customerDetails || !shippingDetails || !items) {
      return NextResponse.json(
        { error: 'Missing required payment data' },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;
    
    // Calculate totals
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    const shippingCost = subtotal >= 500 ? 0 : 85; // Free shipping over R500
    const totalAmount = subtotal + shippingCost;

    // Verify amount matches
    if (Math.abs(totalAmount - amount) > 0.01) {
      return NextResponse.json(
        { error: 'Amount mismatch' },
        { status: 400 }
      );
    }

    // Process payment with Yoco
    const charge = await yocoService.createCharge(token, {
      amountInCents: Math.round(totalAmount * 100),
      currency: 'ZAR',
      metadata: {
        orderNumber,
        customerEmail: customerDetails.email,
        customerName: customerDetails.name,
      },
    });

    if (charge.status !== 'successful') {
      return NextResponse.json(
        { error: 'Payment failed' },
        { status: 400 }
      );
    }

    // Create shipping address
    const shippingAddress = await prisma.address.create({
      data: {
        userId: user.id,
        firstName: customerDetails.name.split(' ')[0] || customerDetails.name,
        lastName: customerDetails.name.split(' ').slice(1).join(' ') || '',
        addressLine1: shippingDetails.address,
        city: shippingDetails.city,
        province: shippingDetails.province as any,
        postalCode: shippingDetails.postalCode,
        phone: customerDetails.phone,
        isDefault: false,
      },
    });

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'CONFIRMED',
        paymentMethod: 'YOCO',
        paymentStatus: 'PAID',
        shippingMethod: 'STANDARD',
        subtotal: new Decimal(subtotal),
        shippingCost: new Decimal(shippingCost),
        totalAmount: new Decimal(totalAmount),
        shippingAddressId: shippingAddress.id,
        paymentReference: charge.id,
        paidAt: new Date(),
        customerNotes: '',
      },
    });

    // Create order items
    for (const item of items) {
      // Get product to get cost price
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { productCosts: { orderBy: { createdAt: 'desc' }, take: 1 } }
      });

      const costPrice = product?.productCosts[0]?.costPrice || new Decimal(0);

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: new Decimal(item.price),
          totalPrice: new Decimal(item.price * item.quantity),
          costPrice: costPrice,
          productName: item.productName,
          productSku: product?.sku || null,
        },
      });

      // Update product stock
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Clear user's cart
    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentId: charge.id,
      message: 'Payment successful',
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
} 