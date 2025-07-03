// app/api/admin/products/route.ts - FIXED VERSION
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { Decimal } from "@prisma/client/runtime/library";
import { authOptions } from "@/lib/auth";

// This forces the route to be dynamic, which is good practice for admin routes
export const dynamic = "force-dynamic";

// GET handler to fetch all products
export async function GET() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      stockQuantity: true,
      lowStockThreshold: true,
      isActive: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      images: {
        select: {
          url: true,
          isPrimary: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      // Add more fields as needed for the admin table
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}

// POST handler to create a new product
export async function POST(request: NextRequest) {
  try {
    // Use the centralized authOptions to get the user's session
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has the correct role
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 },
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== "SUPER_ADMIN" && userRole !== "PLANT_MANAGER") {
      return NextResponse.json(
        { error: "Forbidden - Insufficient permissions" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      shortDescription,
      price,
      compareAtPrice,
      sku,
      stockQuantity,
      lowStockThreshold,
      weight,
      dimensions,
      categoryId,
      images = [],
      isFeatured = false,
      careLevel,
      lightRequirement,
      wateringFrequency,
      isPetSafe,
      plantSize,
      growthRate,
      careInstructions,
      metaTitle,
      metaDescription,
    } = body;

    if (!name || !price || !categoryId || stockQuantity === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, price, categoryId, stockQuantity",
        },
        { status: 400 },
      );
    }

    // Data type validation and conversion
    const convertedPrice = new Decimal(parseFloat(price.toString()));
    const convertedCompareAtPrice =
      compareAtPrice != null && compareAtPrice !== ""
        ? new Decimal(parseFloat(compareAtPrice.toString()))
        : undefined;
    const convertedStockQuantity = parseInt(stockQuantity.toString());
    const convertedLowStockThreshold =
      lowStockThreshold != null ? parseInt(lowStockThreshold.toString()) : 10;
    const convertedWeight =
      weight != null && weight !== ""
        ? new Decimal(parseFloat(weight.toString()))
        : undefined;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 400 },
      );
    }

    // Slug generation and uniqueness check
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const existingProductBySlug = await prisma.product.findUnique({
      where: { slug },
    });
    if (existingProductBySlug) {
      return NextResponse.json(
        { error: "Product with this name already exists (slug conflict)" },
        { status: 400 },
      );
    }

    // SKU uniqueness check
    if (sku) {
      const existingProductBySku = await prisma.product.findUnique({
        where: { sku },
      });
      if (existingProductBySku) {
        return NextResponse.json(
          { error: "Product with this SKU already exists" },
          { status: 400 },
        );
      }
    }

    // Create the product in the database
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        price: convertedPrice,
        compareAtPrice: convertedCompareAtPrice,
        sku,
        stockQuantity: convertedStockQuantity,
        lowStockThreshold: convertedLowStockThreshold,
        weight: convertedWeight,
        dimensions,
        categoryId,
        isFeatured,
        careLevel,
        lightRequirement,
        wateringFrequency,
        isPetSafe,
        plantSize,
        growthRate,
        careInstructions,
        metaTitle,
        metaDescription,
        isActive: true,
        sortOrder: 0,
        images: {
          create: images.map((image: any, index: number) => ({
            url: image.url || image,
            altText: image.altText || `${name} - Image ${index + 1}`,
            sortOrder: index,
            isPrimary: index === 0,
          })),
        },
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(
      { message: "Product created successfully", product: newProduct },
      { status: 201 },
    );
  } catch (error) {
    console.error("Admin product creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}

// Bulk update endpoint
export async function PATCH(req: NextRequest) {
  try {
    const { ids, action, value } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No product IDs provided" }, { status: 400 });
    }
    let data: any = {};
    switch (action) {
      case "activate":
        data.isActive = true;
        break;
      case "deactivate":
        data.isActive = false;
        break;
      case "setFeatured":
        data.isFeatured = true;
        break;
      case "unsetFeatured":
        data.isFeatured = false;
        break;
      case "changeCategory":
        if (!value) return NextResponse.json({ error: "No categoryId provided" }, { status: 400 });
        data.categoryId = value;
        break;
      case "setPrice":
        if (typeof value !== "number") return NextResponse.json({ error: "Invalid price" }, { status: 400 });
        data.price = value;
        break;
      case "setStock":
        if (typeof value !== "number") return NextResponse.json({ error: "Invalid stock quantity" }, { status: 400 });
        data.stockQuantity = value;
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    const updated = await prisma.product.updateMany({
      where: { id: { in: ids } },
      data,
    });
    return NextResponse.json({ updated: updated.count });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
