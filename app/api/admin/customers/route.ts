export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as unknown as { role: string }).role;
    if (userRole !== "SUPER_ADMIN" && userRole !== "PLANT_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customers" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    if (userRole !== "SUPER_ADMIN" && userRole !== "PLANT_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: "CUSTOMER" },
      select: { id: true, name: true, email: true, role: true, createdAt: true, isActive: true },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    if (userRole !== "SUPER_ADMIN" && userRole !== "PLANT_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id, name, isActive } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id },
      data: { name, isActive },
      select: { id: true, name: true, email: true, role: true, createdAt: true, isActive: true },
    });
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userRole = (session.user as any).role;
    if (userRole !== "SUPER_ADMIN" && userRole !== "PLANT_MANAGER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete customer" }, { status: 500 });
  }
}
