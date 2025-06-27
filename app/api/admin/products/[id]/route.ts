// app/api/admin/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';

// Re-using the same auth logic for consistency
async function getAuthOptions() {
  const { default: NextAuth } = await import('next-auth');
  const CredentialsProvider = (
    await import('next-auth/providers/credentials')
  ).default;
  const { PrismaAdapter } = await import('@next-auth/prisma-adapter');
  const bcrypt = await import('bcryptjs');

  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user || !user.password) {
            return null;
          }
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        },
      }),
    ],
    session: {
      strategy: 'jwt' as const,
    },
    callbacks: {
      async jwt({ token, user }: any) {
        if (user) {
          token.role = user.role;
        }
        return token;
      },
      async session({ session, token }: any) {
        if (session?.user) {
          session.user.id = token.sub;
          session.user.role = token.role;
        }
        return session;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  };
}

// GET handler for a single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: { category: true, images: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT handler for updating a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);

    const userRole = (session?.user as any)?.role;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'PLANT_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    // Destructuring all possible fields from the body
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
    } = body;

    // Data conversion and validation
    const convertedPrice = new Decimal(parseFloat(price.toString()));
    const convertedCompareAtPrice =
      compareAtPrice != null
        ? new Decimal(parseFloat(compareAtPrice.toString()))
        : undefined;
    const convertedStockQuantity = parseInt(stockQuantity.toString());
    const convertedLowStockThreshold =
      lowStockThreshold != null
        ? parseInt(lowStockThreshold.toString())
        : undefined;
    const convertedWeight =
      weight != null ? new Decimal(parseFloat(weight.toString())) : undefined;

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
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
      },
    });

    return NextResponse.json({
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Admin product update error:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating product' },
      { status: 500 }
    );
  }
}

// DELETE handler for a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);

    const userRole = (session?.user as any)?.role;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'PLANT_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    await prisma.product.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Admin product delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error while deleting product' },
      { status: 500 }
    );
  }
}