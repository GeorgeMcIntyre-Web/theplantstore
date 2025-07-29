export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const prisma = getPrismaClient();
    const product = await prisma.product.findUnique({
      where: { slug: params.slug },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: {
          where: { isActive: true },
          include: {
            images: true,
          },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
