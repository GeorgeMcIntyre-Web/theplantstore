
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: params.slug,
        isActive: true,
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                name: true,
                image: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate average rating
    const averageRating = product.reviews.length > 0
      ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
      : 0

    // Get related products
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isActive: true,
      },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        }
      },
      take: 4
    })

    return NextResponse.json({
      product: {
        ...product,
        averageRating,
        reviewCount: product.reviews.length
      },
      relatedProducts
    })
  } catch (error) {
    console.error('Product fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
