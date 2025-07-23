import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function toCSV(rows: any[], columns: string[]): string {
  const header = columns.join(",");
  const data = rows.map(row => columns.map(col => JSON.stringify(row[col] ?? "")).join(",")).join("\n");
  return header + "\n" + data;
}

export async function GET() {
  const customers = await prisma.user.findMany({ where: { role: "CUSTOMER" } });
  const columns = [
    "id", "name", "email", "createdAt", "updatedAt"
  ];
  const rows = customers.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));
  const csv = toCSV(rows, columns);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=customers.csv"
    }
  });
} 