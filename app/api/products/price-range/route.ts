import { getPrismaClient } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const priceRange = await prisma.product.aggregate({
      where: {
        isActive: true,
      },
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
    });

    return NextResponse.json({
      minPrice: priceRange._min.price || 0,
      maxPrice: priceRange._max.price || 0,
    });
  } catch (error) {
    console.error('Error fetching price range:', error);
    return NextResponse.json({ error: 'Failed to fetch price range' }, { status: 500 });
  }
} 
