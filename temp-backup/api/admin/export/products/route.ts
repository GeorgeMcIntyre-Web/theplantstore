import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function toCSV(rows: any[], columns: string[]): string {
  const header = columns.join(",");
  const data = rows.map(row => columns.map(col => JSON.stringify(row[col] ?? "")).join(",")).join("\n");
  return header + "\n" + data;
}

export async function GET() {
  const products = await prisma.product.findMany();
  const columns = [
    "id", "name", "slug", "price", "stockQuantity", "isActive", "createdAt", "updatedAt"
  ];
  const rows = products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price.toString(),
    stockQuantity: p.stockQuantity,
    isActive: p.isActive,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
  const csv = toCSV(rows, columns);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=products.csv"
    }
  });
} 