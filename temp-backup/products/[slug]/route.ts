export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Define interfaces for type safety
interface ReviewWithRating {
  rating: number;
  [key: string]: any;
}

interface ProductWithReviews {
  reviews: ReviewWithRating[];
  [key: string]: any;
}

export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        category: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        reviews: {
          where: { isApproved: true },
        },
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    // Calculate average ratings
    const productsWithRatings = products.map((product: any) => ({
      ...product,
      averageRating:
        product.reviews.length > 0
          ? product.reviews.reduce(
              (acc: number, review: ReviewWithRating) => acc + review.rating,
              0,
            ) / product.reviews.length
          : 0,
      reviewCount: product.reviews.length,
    }));

    return NextResponse.json({
      products: productsWithRatings,
    });
  } catch (error: any) {
    console.error("Featured products fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch featured products" },
      { status: 500 },
    );
  }
}
