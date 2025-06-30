import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

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