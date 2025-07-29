import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { Decimal } from '@prisma/client/runtime/library';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("User orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

function generateOrderNumber() {
  // Example: ORD-20250702-XXXX
  return `ORD-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(request: NextRequest) {
  try {
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
    let subtotal = new Decimal(0);
    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      const price = new Decimal(product.price);
      const totalPrice = price.mul(item.quantity);
      subtotal = subtotal.add(totalPrice);
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
    const shippingCost = new Decimal(0);
    const taxAmount = new Decimal(0);
    const discountAmount = new Decimal(0);
    const totalAmount = subtotal.add(shippingCost).add(taxAmount).sub(discountAmount);

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
