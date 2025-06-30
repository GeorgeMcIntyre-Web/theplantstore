import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fromStr = searchParams.get("from");
    const toStr = searchParams.get("to");
    if (!fromStr || !toStr) {
      return NextResponse.json({ error: "Missing date range" }, { status: 400 });
    }
    const from = startOfDay(new Date(fromStr));
    const to = endOfDay(new Date(toStr));

    // Sales & Orders per day (optimized)
    const salesRaw = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        status: OrderStatus.DELIVERED,
      },
      select: {
        createdAt: true,
        totalAmount: true,
        id: true,
      },
    });
    const salesMap: { [key: string]: { sales: number; orders: number; date: string } } = {};
    for (const order of salesRaw) {
      const day = order.createdAt.toISOString().slice(0, 10);
      if (!salesMap[day]) salesMap[day] = { sales: 0, orders: 0, date: day };
      salesMap[day].sales += Number(order.totalAmount);
      salesMap[day].orders += 1;
    }
    const salesData = Object.values(salesMap).sort((a, b) => (a.date as string).localeCompare(b.date as string));

    // Customer growth per day (optimized)
    const customersRaw = await prisma.user.findMany({
      where: {
        createdAt: { gte: from, lte: to },
        role: "CUSTOMER",
      },
      select: { createdAt: true },
    });
    const customerMap: { [key: string]: { signups: number; date: string } } = {};
    for (const user of customersRaw) {
      const day = user.createdAt.toISOString().slice(0, 10);
      if (!customerMap[day]) customerMap[day] = { signups: 0, date: day };
      customerMap[day].signups += 1;
    }
    const customerGrowthData = Object.values(customerMap).sort((a, b) => (a.date as string).localeCompare(b.date as string));

    // Top products (unchanged)
    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { createdAt: { gte: from, lte: to } },
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    const productIds = topProductsRaw.map(p => p.productId);
    const productNames = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productNameMap = Object.fromEntries(productNames.map(p => [p.id, p.name]));
    const topProductsData = topProductsRaw.map(p => ({
      name: productNameMap[p.productId] || 'Unknown',
      salesCount: (p._sum?.quantity) || 0,
    }));

    // Revenue by category (unchanged)
    const ordersInRange = await prisma.order.findMany({
      where: { createdAt: { gte: from, lte: to }, status: OrderStatus.DELIVERED },
      include: { items: { include: { product: { select: { category: { select: { name: true } } } } } } },
    });
    const revenueByCategoryMap: Record<string, number> = {};
    for (const order of ordersInRange) {
      for (const item of order.items) {
        const category = item.product?.category?.name || 'Uncategorized';
        revenueByCategoryMap[category] = (revenueByCategoryMap[category] || 0) + Number(item.totalPrice);
      }
    }
    const revenueByCategoryData = Object.entries(revenueByCategoryMap).map(([category, revenue]) => ({ category, revenue }));

    // Recent orders (unchanged)
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
      where: { createdAt: { gte: from, lte: to } },
    });
    // Low inventory (unchanged)
    const lowInventory = await prisma.product.findMany({
      where: { stockQuantity: { lt: 5 } },
      select: { id: true, name: true, stockQuantity: true },
      take: 3,
    });
    return NextResponse.json({
      salesData,
      customerGrowthData,
      topProductsData,
      revenueByCategoryData,
      recentOrders,
      lowInventory,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
} 