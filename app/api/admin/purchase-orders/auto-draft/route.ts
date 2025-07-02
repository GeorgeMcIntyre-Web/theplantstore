import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';

// POST: Auto-create draft POs for low stock products
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { adminId } = body;
  if (!adminId) return NextResponse.json({ error: 'Missing adminId' }, { status: 400 });

  // Find all low stock products (ensure supplierId is included)
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      price: true,
      stockQuantity: true,
      lowStockThreshold: true,
      supplierId: true,
    },
  });
  const lowStock = products.filter(
    (p) => typeof p.stockQuantity === 'number' && typeof p.lowStockThreshold === 'number' && p.stockQuantity <= p.lowStockThreshold && p.supplierId
  );

  const createdPOs = [];
  for (const product of lowStock) {
    // Check if a draft PO already exists for this product and supplier
    const existing = await prisma.purchaseOrder.findFirst({
      where: {
        status: 'DRAFT',
        supplierId: product.supplierId!,
        adminId,
        items: { path: '$[*].productId', array_contains: product.id },
      },
    });
    if (existing) continue;
    // Create draft PO
    const items = [{
      productId: product.id,
      name: product.name,
      quantity: Math.max(1, product.lowStockThreshold - product.stockQuantity + 1),
      price: product.price,
    }];
    const total = new Decimal(product.price).mul(items[0].quantity);
    const po = await prisma.purchaseOrder.create({
      data: {
        orderNumber: `PO-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        status: 'DRAFT',
        adminId,
        supplierId: product.supplierId!,
        items,
        total,
      },
    });
    // Notify admin
    await prisma.notification.create({
      data: {
        userId: adminId,
        type: 'po-draft',
        message: `Auto-draft PO created for low stock: ${product.name}`,
        link: `/admin/purchase-orders/${po.id}`,
      },
    });
    createdPOs.push(po);
  }
  return NextResponse.json({ created: createdPOs.length, purchaseOrders: createdPOs });
} 