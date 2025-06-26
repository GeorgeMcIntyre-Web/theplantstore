
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ products: [] })
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            category: {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        category: {
          select: {
            name: true
          }
        },
        images: {
          where: { isPrimary: true },
          take: 1
        }
      },
      take: 10,
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    )
  }
}
