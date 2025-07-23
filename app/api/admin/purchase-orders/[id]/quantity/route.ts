import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";

interface POItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { quantity } = await req.json();
  const { id } = params;
  if (!id || !quantity || quantity < 1) {
    return NextResponse.json({ error: "Missing or invalid purchase order ID or quantity" }, { status: 400 });
  }
  try {
    // Get the PO
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) return NextResponse.json({ error: "Purchase order not found" }, { status: 404 });
    let items: POItem[] = Array.isArray(po.items)
      ? (po.items as unknown as POItem[])
      : JSON.parse(po.items as any);
    if (!items[0]) return NextResponse.json({ error: "No items in PO" }, { status: 400 });
    items[0].quantity = quantity;
    // Recalculate total
    const total = new Decimal(items[0].price).mul(quantity);
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { items: JSON.stringify(items), total },
    });
    return NextResponse.json({ success: true, purchaseOrder: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 