import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';

function generatePONumber() {
  return `PO-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// GET: List all purchase orders (admin only)
export async function GET(req: NextRequest) {
  const adminId = req.nextUrl.searchParams.get('adminId'); // TEMP: for testing
  if (!adminId) return NextResponse.json({ error: 'Missing adminId' }, { status: 400 });
  const pos = await prisma.purchaseOrder.findMany({
    where: { adminId },
    include: { supplier: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(pos);
}

// POST: Create a draft purchase order
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { adminId, supplierId, items } = body;
  if (!adminId || !supplierId || !items || items.length === 0) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  // Calculate total
  let total = new Decimal(0);
  items.forEach((item: any) => {
    total = total.add(new Decimal(item.price).mul(item.quantity));
  });
  const po = await prisma.purchaseOrder.create({
    data: {
      orderNumber: generatePONumber(),
      status: 'DRAFT',
      adminId,
      supplierId,
      items,
      total,
    },
    include: { supplier: true },
  });
  // Notify admin for approval
  await prisma.notification.create({
    data: {
      userId: adminId,
      type: 'po-draft',
      message: `Purchase order draft created for supplier`,
      link: `/admin/purchase-orders/${po.id}`,
    },
  });
  return NextResponse.json(po, { status: 201 });
}

// PATCH: Approve/send a purchase order
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, adminId } = body;
  if (!id || !adminId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  const po = await prisma.purchaseOrder.update({
    where: { id },
    data: { status: 'APPROVED' },
    include: { supplier: true },
  });
  // Notify admin of approval
  await prisma.notification.create({
    data: {
      userId: adminId,
      type: 'po-approved',
      message: `Purchase order approved and sent to supplier`,
      link: `/admin/purchase-orders/${po.id}`,
    },
  });
  return NextResponse.json(po);
} 
