import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';
import { OrderStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const prisma = getPrismaClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') as OrderStatus | null;

    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.order.count({ where });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

function generateOrderNumber() {
  // Example: ORD-20250702-XXXX
  return `ORD-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrismaClient();
    const body = await request.json();
    const { name, email, address, city, province, postalCode, items } = body;
    if (!name || !email || !address || !city || !province || !postalCode || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: { name, email },
      });
    }

    // Create shipping address
    const shippingAddress = await prisma.address.create({
      data: {
        userId: user.id,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        addressLine1: address,
        city,
        province,
        postalCode,
        phone: '',
      },
    });

    // Fetch product info for all items
    const productIds = items.map((item: any) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // Build order items and calculate totals
    let subtotal = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      const price = Number(product.price);
      const totalPrice = price * item.quantity;
      subtotal += totalPrice;
      return {
        productId: product.id,
        quantity: item.quantity,
        price,
        totalPrice,
        productName: product.name,
        productSku: product.sku || null,
      };
    });

    // Calculate shipping, tax, discount (set to 0 for now)
    const shippingCost = 0; // Changed from Decimal to number
    const taxAmount = 0; // Changed from Decimal to number
    const discountAmount = 0; // Changed from Decimal to number
    const totalAmount = subtotal + shippingCost + taxAmount - discountAmount; // Changed from Decimal to number

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: user.id,
        status: "PENDING",
        subtotal,
        shippingCost,
        taxAmount,
        discountAmount,
        totalAmount,
        shippingAddressId: shippingAddress.id,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
        shippingAddress: true,
      },
    });

    // Find admin users to notify
    const admins = await prisma.user.findMany({
      where: {
        OR: [
          { role: "SUPER_ADMIN" },
          { role: "PLANT_MANAGER" },
        ],
      },
    });

    // Create notifications for each admin
    await Promise.all(admins.map((admin) =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          type: "order",
          message: `New order placed by ${name} (R${Number(totalAmount).toFixed(2)})`,
          link: `/admin/orders/${order.id}`,
        },
      })
    ));

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
} 
