import { getPrismaClient } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { UserRole } from '@prisma/client';

export const maxDuration = 300; // 5 minutes timeout
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { products, chunkIndex, totalChunks } = await request.json();

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: 'Invalid products data' }, { status: 400 });
    }

    const errors = [];
    const created = [];
    const updated = [];

    // Process products in this chunk
    for (const product of products) {
      try {
        // Check if product already exists
        const existingProduct = await prisma.product.findUnique({
          where: { sku: product.sku }
        });

        const productData = {
          name: product.name,
          slug: product.slug,
          description: product.description || '',
          price: parseFloat(product.price) || 0,
          stockQuantity: parseInt(product.stockQuantity) || 0,
          isActive: product.isActive === 'true' || product.isActive === true,
          isFeatured: product.isFeatured === 'true' || product.isFeatured === false,
          imageUrl: product.imageUrl || null,
          categoryId: null,
        };

        if (existingProduct) {
          // Update existing product
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: productData,
          });
          updated.push(product.sku);
        } else {
          // Create new product
          await prisma.product.create({
            data: productData,
          });
          created.push(product.sku);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Failed to process ${product.sku || product.name}: ${errorMessage}`);
      }
    }

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} completed. Created: ${created.length}, Updated: ${updated.length}, Errors: ${errors.length}`,
      created: created.length,
      updated: updated.length,
      failed: errors.length,
      errors: errors,
    });

  } catch (error) {
    console.error('Error processing chunk:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to process chunk',
      details: errorMessage 
    }, { status: 500 });
  }
} 