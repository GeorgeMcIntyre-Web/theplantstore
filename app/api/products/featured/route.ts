
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true }
        }
      },
      orderBy: { sortOrder: 'asc' },
      take: 8
    })

    // Calculate average ratings
    const productsWithRatings = products.map((product: any) => ({
      ...product,
      averageRating: product.reviews.length > 0
        ? product.reviews.reduce((acc: number, review: any) => acc + review.rating, 0) / product.reviews.length
        : 0,
      reviewCount: product.reviews.length
    }))

    return NextResponse.json({
      products: productsWithRatings
    })
  } catch (error) {
    console.error('Featured products fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    )
  }
}
