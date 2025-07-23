export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";

export async function POST() {
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

    await prisma.cartItem.deleteMany({
      where: { userId: user.id },
    });

    return NextResponse.json({ message: "Cart cleared" });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { error: "Failed to clear cart" },
      { status: 500 },
    );
  }
}
