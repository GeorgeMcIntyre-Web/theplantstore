import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET: List all suppliers
export async function GET() {
  const suppliers = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(suppliers);
}

// POST: Create a new supplier
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, address } = body;
  if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  const supplier = await prisma.supplier.create({ data: { name, email, phone, address } });
  return NextResponse.json(supplier, { status: 201 });
}

// PATCH: Update a supplier
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, name, email, phone, address } = body;
  if (!id || !name) return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
  const supplier = await prisma.supplier.update({
    where: { id },
    data: { name, email, phone, address },
  });
  return NextResponse.json(supplier);
}

// DELETE: Remove a supplier
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  await prisma.supplier.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 