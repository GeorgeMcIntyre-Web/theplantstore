import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const productsJson = formData.get("products");
  if (!productsJson) {
    return NextResponse.json({ error: "Missing products data" }, { status: 400 });
  }
  let products: any[] = [];
  try {
    products = JSON.parse(productsJson as string);
  } catch (e) {
    return NextResponse.json({ error: "Invalid products JSON" }, { status: 400 });
  }

  // Save images and build image URL map
  const imageMap: Record<string, string> = {};
  for (const [key, value] of Array.from(formData.entries())) {
    if (key.startsWith("image-")) {
      const file = value as File;
      const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const filePath = path.join(process.cwd(), "public", "products", fileName);
      const arrayBuffer = await file.arrayBuffer();
      await fs.writeFile(filePath, new Uint8Array(arrayBuffer));
      imageMap[file.name] = `/products/${fileName}`;
    }
  }

  // Create or update products by SKU (upsert logic)
  const results = [];
  for (const prod of products) {
    try {
      const imageUrl = prod.imageMatch && imageMap[prod.imageMatch] ? imageMap[prod.imageMatch] : null;
      // Find category by name (or slug if you prefer)
      const category = await prisma.category.findUnique({ where: { name: prod.category } });
      if (!category) {
        results.push({ sku: prod.sku, status: "Error", error: `Category not found: ${prod.category}` });
        continue;
      }
      const data = {
        name: prod.name,
        slug: prod.slug,
        price: Number(prod.price),
        stockQuantity: Number(prod.stockQuantity),
        categoryId: category.id,
        description: prod.description,
        shortDescription: prod.shortDescription,
        compareAtPrice: prod.compareAtPrice ? Number(prod.compareAtPrice) : null,
        sku: prod.sku,
        careLevel: prod.careLevel,
        lightRequirement: prod.lightRequirement,
        wateringFrequency: prod.wateringFrequency,
        isPetSafe: prod.isPetSafe === "true" || prod.isPetSafe === true,
        plantSize: prod.plantSize,
        growthRate: prod.growthRate,
        careInstructions: prod.careInstructions,
        isFeatured: prod.isFeatured === "true" || prod.isFeatured === true,
        isActive: prod.isActive === "true" || prod.isActive === true,
      };
      // Upsert by SKU (update if exists, else create)
      let dbProduct = await prisma.product.findUnique({ where: { sku: prod.sku } });
      if (dbProduct) {
        dbProduct = await prisma.product.update({ where: { sku: prod.sku }, data });
      } else {
        dbProduct = await prisma.product.create({ data });
      }
      // If imageUrl, upsert ProductImage
      if (imageUrl) {
        // Remove old primary images for this product
        await prisma.productImage.updateMany({
          where: { productId: dbProduct.id, isPrimary: true },
          data: { isPrimary: false },
        });
        // Find existing image by productId and url
        const existingImage = await prisma.productImage.findFirst({
          where: { productId: dbProduct.id, url: imageUrl },
        });
        if (existingImage) {
          await prisma.productImage.update({
            where: { id: existingImage.id },
            data: { isPrimary: true },
          });
        } else {
          await prisma.productImage.create({
            data: {
              productId: dbProduct.id,
              url: imageUrl,
              isPrimary: true,
              sortOrder: 0,
            },
          });
        }
      }
      results.push({ sku: prod.sku, status: "Imported", id: dbProduct.id });
    } catch (e: any) {
      results.push({ sku: prod.sku, status: "Error", error: e.message });
    }
  }

  return NextResponse.json({ results });
} 
