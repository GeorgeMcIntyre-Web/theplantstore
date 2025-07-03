import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { supplierId } = await req.json();
  const { id } = params;
  if (!id || !supplierId) {
    return NextResponse.json({ error: "Missing purchase order ID or supplierId" }, { status: 400 });
  }
  try {
    const po = await prisma.purchaseOrder.update({
      where: { id },
      data: { supplierId },
    });
    return NextResponse.json({ success: true, purchaseOrder: po });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 