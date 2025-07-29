import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Papa from "papaparse";
import { Decimal } from "@prisma/client/runtime/library";
import path from "path";
import fs from "fs/promises";

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
    const imageWarnings: string[] = [];
    const imageFiles = form.getAll("images") as File[]; // Expect multiple files under 'images'
    // Build a map of filename -> file object (case-sensitive)
    const fileMap = new Map<string, File>();
    for (const f of imageFiles as File[]) {
      fileMap.set(f.name, f);
    }
    // Get a list of all files in public/products for case-sensitive matching
    const productsDir = path.join(process.cwd(), "public", "products");
    const existingProductFiles = new Set<string>(
      (await fs.readdir(productsDir)).map(f => f)
    );
    const imageVerificationMap: Record<string, string[]> = {};
    // Track used uploaded images by index
    let usedImageIndexes = new Set<number>();
    // Log all uploaded images received
    console.log(`Received ${imageFiles.length} uploaded images:`);
    imageFiles.forEach((f, idx) => console.log(`  [${idx}] ${f.name}`));
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
            },
          },
        });
        if (!category) {
          failed++;
          errors.push(`Row ${i + 2}: Category '${row.category}' not found (case-insensitive match failed)`);
          continue;
        }

        // Handle SKU conflicts
        let finalSku = row.sku || null;
        if (finalSku) {
          // Check if SKU already exists
          const existingProductWithSku = await prisma.product.findUnique({
            where: { sku: finalSku },
          });
          if (existingProductWithSku) {
            // SKU already exists, generate a new one or skip it
            console.log(`Row ${i + 2}: SKU '${finalSku}' already exists for product '${existingProductWithSku.name}', generating new SKU`);
            // Generate a new unique SKU based on the slug
            const baseSku = row.slug.toUpperCase().replace(/[^A-Z0-9]/g, '');
            let counter = 1;
            let newSku = `${baseSku}-${counter.toString().padStart(3, '0')}`;
            while (await prisma.product.findUnique({ where: { sku: newSku } })) {
              counter++;
              newSku = `${baseSku}-${counter.toString().padStart(3, '0')}`;
            }
            finalSku = newSku;
            updateNotes.push(`Row ${i + 2}: Generated new SKU '${finalSku}' for product '${row.name}' (original SKU '${row.sku}' was already taken)`);
          }
        }

        const data: any = {
          name: row.name,
          slug: row.slug,
          price: new Decimal(parseFloat(row.price)),
          categoryId: category.id,
          description: row.description || null,
          shortDescription: row.shortDescription || null,
          compareAtPrice: row.compareAtPrice ? new Decimal(parseFloat(row.compareAtPrice)) : undefined,
          sku: finalSku,
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
        // Handle image association
        let images = [];
        let imageFilenames: string[] = [];
        if (row.imageUrls) {
          imageFilenames = row.imageUrls.split(",").map((s: string) => (s as string).trim()).filter(Boolean);
        } else if (row.imageFile) {
          imageFilenames = [row.imageFile.trim()];
        }
        // Always use uploaded image at the same index if available
        let url = "";
        if (imageFiles[i]) {
          const file = imageFiles[i];
          const destPath = path.join(process.cwd(), "public", "products", file.name);
          let overwrite = false;
          try {
            await fs.access(destPath);
            overwrite = true;
          } catch {}
          const arrayBuffer = await file.arrayBuffer();
          const buffer = new Uint8Array(arrayBuffer);
          await fs.writeFile(destPath, buffer);
          url = `/products/${file.name}`;
          imageWarnings.push(`Row ${i + 2}: Used uploaded image '${file.name}' for product '${row.name}' (forced userproof order)`);
          console.log(`Product '${row.name}' (row ${i + 2}): Used uploaded image '${file.name}' - ${overwrite ? 'overwrote existing file' : 'new file'}`);
        } else {
          // Fallbacks if no uploaded image for this row
          const filename = imageFilenames[0] || "";
          if (filename && fileMap.get(filename)) {
            const file = fileMap.get(filename)!;
            const arrayBuffer = await file.arrayBuffer();
            const buffer = new Uint8Array(arrayBuffer);
            const destPath = path.join(process.cwd(), "public", "products", filename);
            await fs.writeFile(destPath, buffer);
            url = `/products/${filename}`;
            imageWarnings.push(`Row ${i + 2}: Used uploaded image '${filename}' for product '${row.name}' (filename fallback)`);
            console.log(`Product '${row.name}' (row ${i + 2}): Used uploaded image '${filename}' (filename fallback)`);
          } else if (filename && filename.startsWith("http")) {
            url = filename;
            imageWarnings.push(`Row ${i + 2}: Used remote URL for product '${row.name}' (no uploaded image)`);
            console.log(`Product '${row.name}' (row ${i + 2}): Used remote URL '${filename}'`);
          } else if (filename && existingProductFiles.has(filename)) {
            url = `/products/${filename}`;
            imageWarnings.push(`Row ${i + 2}: Used existing file '${filename}' for product '${row.name}' (no uploaded image)`);
            console.log(`Product '${row.name}' (row ${i + 2}): Used existing file '${filename}'`);
          } else {
            imageWarnings.push(`Row ${i + 2}: No image found for product '${row.name}'`);
            url = "";
            console.log(`Product '${row.name}' (row ${i + 2}): No image found`);
          }
        }
        if (url) {
          images.push({
            url,
            altText: `${row.name} - Image 1`,
            sortOrder: 0,
            isPrimary: true,
          });
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
          // Verification: fetch and log associated images
          const verifiedImages = await prisma.productImage.findMany({ where: { productId: existing.id } });
          updateNotes.push(`Verified images for product: ${row.name} (${row.slug}): ${verifiedImages.map(img => img.url).join(', ')}`);
          imageVerificationMap[row.slug] = verifiedImages.map(img => img.url);
          updated++;
        } else {
          console.log(`Creating new product: ${row.name}, slug: ${row.slug}`);
          const createdProduct = await prisma.product.create({
            data: {
              ...data,
              images: images.length > 0 ? { create: images } : undefined,
            },
          });
          // Verification: fetch and log associated images
          const verifiedImages = await prisma.productImage.findMany({ where: { productId: createdProduct.id } });
          updateNotes.push(`Verified images for product: ${row.name} (${row.slug}): ${verifiedImages.map(img => img.url).join(', ')}`);
          imageVerificationMap[row.slug] = verifiedImages.map(img => img.url);
          created++;
        }
      } catch (e: any) {
        failed++;
        errors.push(`Row ${i + 2}: ${e.message}`);
      }
    }
    return NextResponse.json({ created, updated, failed, errors, updateNotes, imageWarnings, imageVerificationMap });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 