import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Papa from "papaparse";
import { Decimal } from "@prisma/client/runtime/library";

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
    const updateNotes: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.name || !row.slug || !row.price || !row.category) {
        failed++;
        errors.push(`Row ${i + 2}: Missing required fields (name, slug, price, or category)`);
        continue;
      }
      try {
        // Look up category by name (case-insensitive, trimmed)
        const categoryName = row.category.trim();
        const category = await prisma.category.findFirst({
          where: {
            name: {
              equals: categoryName,
              mode: 'insensitive',
            },
          },
        });
        if (!category) {
          failed++;
          errors.push(`Row ${i + 2}: Category '${row.category}' not found (case-insensitive match failed)`);
          continue;
        }
        const data: any = {
          name: row.name,
          slug: row.slug,
          price: new Decimal(parseFloat(row.price)),
          categoryId: category.id,
          description: row.description || null,
          shortDescription: row.shortDescription || null,
          compareAtPrice: row.compareAtPrice ? new Decimal(parseFloat(row.compareAtPrice)) : undefined,
          sku: row.sku || null,
          stockQuantity: row.stockQuantity ? parseInt(row.stockQuantity) : 0,
          careLevel: row.careLevel || null,
          lightRequirement: row.lightRequirement || null,
          wateringFrequency: row.wateringFrequency || null,
          isPetSafe: row.isPetSafe === "true" ? true : false,
          plantSize: row.plantSize || null,
          growthRate: row.growthRate || null,
          careInstructions: row.careInstructions || null,
          isFeatured: row.isFeatured === "true" ? true : false,
          isActive: row.isActive === "true" ? true : false,
        };
        // Handle imageUrls (comma-separated)
        let images = [];
        if (row.imageUrls) {
          images = row.imageUrls.split(",").map((url: string, idx: number) => ({
            url: url.trim(),
            altText: `${row.name} - Image ${idx + 1}`,
            sortOrder: idx,
            isPrimary: idx === 0,
          }));
        }
        let where = undefined;
        if (row.id) where = { id: row.id };
        else where = { slug: row.slug };
        console.log(`Processing row: ${row.name}, slug: ${row.slug}, where:`, where);
        const existing = await prisma.product.findUnique({ where });
        if (existing) {
          console.log(`Updating existing product: ${existing.id}, slug: ${existing.slug}`);
          await prisma.product.update({ where, data });
          if (images.length > 0) {
            // Remove old images and add new ones
            await prisma.productImage.deleteMany({ where: { productId: existing.id } });
            await prisma.product.update({
              where,
              data: {
                images: { create: images }
              }
            });
            updateNotes.push(`Updated images for product: ${row.name} (${row.slug})`);
          }
          updated++;
        } else {
          console.log(`Creating new product: ${row.name}, slug: ${row.slug}`);
          await prisma.product.create({
            data: {
              ...data,
              images: images.length > 0 ? { create: images } : undefined,
            },
          });
          created++;
        }
      } catch (e: any) {
        failed++;
        errors.push(`Row ${i + 2}: ${e.message}`);
      }
    }
    return NextResponse.json({ created, updated, failed, errors, updateNotes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 