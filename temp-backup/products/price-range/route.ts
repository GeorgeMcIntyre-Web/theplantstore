import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    let where = {};
    if (category) {
      where = {
        category: {
          slug: category,
        },
      };
    }
    const [min, max] = await Promise.all([
      prisma.product.aggregate({ _min: { price: true }, where }),
      prisma.product.aggregate({ _max: { price: true }, where }),
    ]);
    return NextResponse.json({
      minPrice: min._min.price ?? 0,
      maxPrice: max._max.price ?? 1000,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch price range' }, { status: 500 });
  }
} 