import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function toCSV(rows: any[], columns: string[]): string {
  const header = columns.join(",");
  const data = rows.map(row => columns.map(col => JSON.stringify(row[col] ?? "")).join(",")).join("\n");
  return header + "\n" + data;
}

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { items: true, user: true },
    orderBy: { createdAt: "desc" },
  });
  const columns = [
    "orderNumber", "createdAt", "status", "totalAmount", "userEmail", "userName", "items"
  ];
  const rows = orders.map(order => ({
    orderNumber: order.orderNumber,
    createdAt: order.createdAt.toISOString(),
    status: order.status,
    totalAmount: order.totalAmount.toString(),
    userEmail: order.user?.email,
    userName: order.user?.name,
    items: order.items.map(i => `${i.productName} x${i.quantity}`).join("; ")
  }));
  const csv = toCSV(rows, columns);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=orders.csv"
    }
  });
} 