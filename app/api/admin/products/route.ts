
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { Decimal } from '@prisma/client/runtime/library'

// Import NextAuth configuration to get session
async function getAuthOptions() {
  const { default: NextAuth } = await import('next-auth')
  const CredentialsProvider = (await import('next-auth/providers/credentials')).default
  const { PrismaAdapter } = await import('@next-auth/prisma-adapter')
  const bcrypt = await import('bcryptjs')

  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }
      })
    ],
    session: {
      strategy: 'jwt' as const
    },
    callbacks: {
      async jwt({ token, user }: any) {
        if (user) {
          token.role = user.role
        }
        return token
      },
      async session({ session, token }: any) {
        if (session?.user) {
          session.user.id = token.sub
          session.user.role = token.role
        }
        return session
      }
    },
    pages: {
      signIn: '/auth/signin',
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get session to check authentication
    const authOptions = await getAuthOptions()
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Check if user has admin role (SUPER_ADMIN or PLANT_MANAGER)
    const userRole = (session.user as any).role
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'PLANT_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      name,
      description,
      shortDescription,
      price,
      compareAtPrice,
      sku,
      stockQuantity,
      lowStockThreshold,
      weight,
      dimensions,
      categoryId,
      images = [],
      isFeatured = false,
      careLevel,
      lightRequirement,
      wateringFrequency,
      isPetSafe,
      plantSize,
      growthRate,
      careInstructions,
      metaTitle,
      metaDescription
    } = body

    // Validate required fields
    if (!name || !price || !categoryId || !stockQuantity) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, categoryId, stockQuantity' },
        { status: 400 }
      )
    }

    // Validate and convert data types
    let convertedPrice: Decimal
    let convertedCompareAtPrice: Decimal | undefined
    let convertedStockQuantity: number
    let convertedLowStockThreshold: number = 10
    let convertedWeight: Decimal | undefined

    try {
      // Convert price to Decimal
      convertedPrice = new Decimal(parseFloat(price.toString()))
      if (convertedPrice.isNaN() || convertedPrice.isNegative()) {
        throw new Error('Invalid price')
      }

      // Convert compareAtPrice if provided
      if (compareAtPrice !== undefined && compareAtPrice !== null && compareAtPrice !== '') {
        convertedCompareAtPrice = new Decimal(parseFloat(compareAtPrice.toString()))
        if (convertedCompareAtPrice.isNaN() || convertedCompareAtPrice.isNegative()) {
          throw new Error('Invalid compare at price')
        }
      }

      // Convert stockQuantity to integer
      convertedStockQuantity = parseInt(stockQuantity.toString())
      if (isNaN(convertedStockQuantity) || convertedStockQuantity < 0) {
        throw new Error('Invalid stock quantity')
      }

      // Convert lowStockThreshold if provided
      if (lowStockThreshold !== undefined && lowStockThreshold !== null) {
        convertedLowStockThreshold = parseInt(lowStockThreshold.toString())
        if (isNaN(convertedLowStockThreshold) || convertedLowStockThreshold < 0) {
          throw new Error('Invalid low stock threshold')
        }
      }

      // Convert weight if provided
      if (weight !== undefined && weight !== null && weight !== '') {
        convertedWeight = new Decimal(parseFloat(weight.toString()))
        if (convertedWeight.isNaN() || convertedWeight.isNegative()) {
          throw new Error('Invalid weight')
        }
      }
    } catch (error) {
      return NextResponse.json(
        { error: `Invalid data types: ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 400 }
      )
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 400 }
      )
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug is unique
    const existingProduct = await prisma.product.findUnique({
      where: { slug }
    })

    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this name already exists (slug conflict)' },
        { status: 400 }
      )
    }

    // Check if SKU is unique (if provided)
    if (sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku }
      })

      if (existingSku) {
        return NextResponse.json(
          { error: 'Product with this SKU already exists' },
          { status: 400 }
        )
      }
    }

    // Create the product
    const newProduct = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription,
        price: convertedPrice,
        compareAtPrice: convertedCompareAtPrice,
        sku,
        stockQuantity: convertedStockQuantity,
        lowStockThreshold: convertedLowStockThreshold,
        weight: convertedWeight,
        dimensions,
        categoryId,
        isFeatured,
        careLevel,
        lightRequirement,
        wateringFrequency,
        isPetSafe,
        plantSize,
        growthRate,
        careInstructions,
        metaTitle,
        metaDescription,
        isActive: true,
        sortOrder: 0,
        // Create related images if provided
        images: {
          create: images.map((image: any, index: number) => ({
            url: image.url || image,
            altText: image.altText || `${name} - Image ${index + 1}`,
            sortOrder: index,
            isPrimary: index === 0
          }))
        }
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' }
        }
      }
    })

    return NextResponse.json(
      {
        message: 'Product created successfully',
        product: newProduct
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Admin product creation error:', error)
    
    // Handle Prisma-specific errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint failed')) {
        return NextResponse.json(
          { error: 'Product with this slug or SKU already exists' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error while creating product' },
      { status: 500 }
    )
  }
}
