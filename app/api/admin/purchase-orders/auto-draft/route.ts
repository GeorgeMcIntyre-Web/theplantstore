import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';
import { getSettingValue } from '@/lib/utils';

// POST: Auto-create draft POs for low stock products
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { adminId } = body;
  if (!adminId) return NextResponse.json({ error: 'Missing adminId' }, { status: 400 });

  // Fetch global default low stock threshold
  const globalThreshold = parseInt(await getSettingValue('lowStockThreshold', '10'));
  // Find all products with supplierId
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
  // Use per-product threshold or global
  const lowStock = products.filter(
    (p) => typeof p.stockQuantity === 'number' &&
      p.supplierId &&
      p.stockQuantity <= (typeof p.lowStockThreshold === 'number' && !isNaN(p.lowStockThreshold) ? p.lowStockThreshold : globalThreshold)
  );

  const createdPOs = [];
  for (const product of lowStock) {
    // Check if a draft PO already exists for this product and supplier
    const draftPOs = await prisma.purchaseOrder.findMany({
      where: {
        status: 'DRAFT',
        supplierId: product.supplierId!,
        adminId,
      },
    });
    const existing = draftPOs.find((po: any) =>
      Array.isArray(po.items) &&
      po.items.some((item: any) => item.productId === product.id)
    );
    if (existing) continue;
    // Create draft PO
    const quantity = Math.max(1, product.lowStockThreshold - product.stockQuantity);
    const items = [{
      productId: product.id,
      name: product.name,
      quantity,
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
