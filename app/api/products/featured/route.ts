export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const prisma = getPrismaClient();
    const featuredProducts = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        images: true,
        category: true,
        variants: {
          where: {
            isActive: true,
          },
        },
      },
      take: 8,
    });

    return NextResponse.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 });
  }
}
