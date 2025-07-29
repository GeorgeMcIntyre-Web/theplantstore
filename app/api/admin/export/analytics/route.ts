import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { OrderStatus } from "@prisma/client";

function toCSV(rows: any[], columns: string[]): string {
  const header = columns.join(",");
  const data = rows.map(row => columns.map(col => JSON.stringify(row[col] ?? "")).join(",")).join("\n");
  return header + "\n" + data;
}

export async function GET(req: NextRequest) {
  // Use last 7 days for analytics export
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 6);
  const to = today;
  // Sales & Orders per day
  const days = [];
  let d = new Date(from);
  while (d <= to) {
    days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  const salesData = await Promise.all(
    days.map(async (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const orders = await prisma.order.findMany({
        where: {
          createdAt: { gte: start, lte: end },
          status: OrderStatus.DELIVERED,
        },
      });
      const total = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      return {
        date: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        sales: total,
        orders: orders.length,
      };
    })
  );
  const salesCSV = toCSV(salesData, ["date", "sales", "orders"]);
  // Customer growth
  const customerGrowthData = await Promise.all(
    days.map(async (date) => {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      const count = await prisma.user.count({
        where: {
          createdAt: { gte: start, lte: end },
          role: "CUSTOMER",
        },
      });
      return {
        date: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        signups: count,
      };
    })
  );
  const customerCSV = toCSV(customerGrowthData, ["date", "signups"]);
  // Top products
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 6);
  const topProductsRaw = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: { createdAt: { gte: weekAgo } },
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
  const topProductsCSV = toCSV(topProductsData, ["name", "salesCount"]);
  // Revenue by category
  const ordersInWeek = await prisma.order.findMany({
    where: { createdAt: { gte: weekAgo }, status: OrderStatus.DELIVERED },
    include: { items: { include: { product: { select: { category: { select: { name: true } } } } } } },
  });
  const revenueByCategoryMap: Record<string, number> = {};
  for (const order of ordersInWeek) {
    for (const item of order.items) {
      const category = item.product?.category?.name || 'Uncategorized';
      revenueByCategoryMap[category] = (revenueByCategoryMap[category] || 0) + Number(item.totalPrice);
    }
  }
  const revenueByCategoryData = Object.entries(revenueByCategoryMap).map(([category, revenue]) => ({ category, revenue }));
  const revenueCSV = toCSV(revenueByCategoryData, ["category", "revenue"]);
  // Combine all sections
  const csv = [
    "Sales & Orders per Day:",
    salesCSV,
    "",
    "Customer Growth:",
    customerCSV,
    "",
    "Top Products:",
    topProductsCSV,
    "",
    "Revenue by Category:",
    revenueCSV,
  ].join("\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=analytics.csv"
    }
  });
} 
