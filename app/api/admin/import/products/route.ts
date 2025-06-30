import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Papa from "papaparse";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  try {
    // Parse form and get file
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const text = await file.text();
    const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
    if (parsed.errors.length) {
      return NextResponse.json({ error: parsed.errors[0].message }, { status: 400 });
    }
    const rows = parsed.data as any[];
    let created = 0, updated = 0, failed = 0;
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.name || !row.slug || !row.price) {
        failed++;
        errors.push(`Row ${i + 2}: Missing required fields`);
        continue;
      }
      try {
        const data: any = {
          name: row.name,
          slug: row.slug,
          price: parseFloat(row.price),
        };
        if (row.stockQuantity) data.stockQuantity = parseInt(row.stockQuantity);
        if (row.isActive !== undefined) data.isActive = row.isActive === "true";
        let where = undefined;
        if (row.id) where = { id: row.id };
        else where = { slug: row.slug };
        const existing = await prisma.product.findUnique({ where });
        if (existing) {
          await prisma.product.update({ where, data });
          updated++;
        } else {
          await prisma.product.create({ data });
          created++;
        }
      } catch (e: any) {
        failed++;
        errors.push(`Row ${i + 2}: ${e.message}`);
      }
    }
    return NextResponse.json({ created, updated, failed, errors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 