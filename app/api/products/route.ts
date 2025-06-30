export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const category = searchParams.get("category");
    const careLevel = searchParams.get("careLevel");
    const lightRequirement = searchParams.get("lightRequirement");
    const isPetSafe = searchParams.get("isPetSafe");
    const plantSize = searchParams.get("plantSize");
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (careLevel) {
      where.careLevel = careLevel;
    }

    if (lightRequirement) {
      where.lightRequirement = lightRequirement;
    }

    if (isPetSafe !== null && isPetSafe !== undefined) {
      where.isPetSafe = isPetSafe === "true";
    }

    if (plantSize) {
      where.plantSize = plantSize;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Build order clause
    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else if (sortBy === "created") {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.name = sortOrder;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: "asc" },
          },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    // Calculate average ratings
    const productsWithRatings = products.map((product: any) => ({
      ...product,
      averageRating:
        product.reviews.length > 0
          ? product.reviews.reduce(
              (acc: number, review: any) => acc + review.rating,
              0,
            ) / product.reviews.length
          : 0,
      reviewCount: product.reviews.length,
    }));

    return NextResponse.json({
      products: productsWithRatings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
