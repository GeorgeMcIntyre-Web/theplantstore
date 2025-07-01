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
      { error: "Internal server error while creating product" },
      { status: 500 },
    );
  }
}
