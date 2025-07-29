export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const prisma = getPrismaClient();
    
    // First try to get featured products
    let featuredProducts = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        images: true,
        category: true,
      },
      take: 8,
    });

    // If no featured products found, get some active products as fallback
    if (featuredProducts.length === 0) {
      featuredProducts = await prisma.product.findMany({
        where: {
          isActive: true,
        },
        include: {
          images: true,
          category: true,
        },
        take: 8,
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    return NextResponse.json(featuredProducts);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Failed to fetch featured products' }, { status: 500 });
  }
}
