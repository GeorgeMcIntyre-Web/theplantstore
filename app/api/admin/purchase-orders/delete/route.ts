import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';

export async function POST(req: NextRequest) {
  const { adminId, poIds } = await req.json();
  if (!adminId || !Array.isArray(poIds) || poIds.length === 0) {
    return NextResponse.json({ error: 'Missing adminId or poIds' }, { status: 400 });
  }
  
  const prisma = getPrismaClient();
  // Only delete DRAFT POs belonging to this admin
  const result = await prisma.purchaseOrder.deleteMany({
    where: {
      id: { in: poIds },
      status: 'DRAFT',
      adminId,
    },
  });
  return NextResponse.json({ deleted: result.count });
} 
