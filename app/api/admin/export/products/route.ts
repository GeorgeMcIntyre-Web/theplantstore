import { getPrismaClient } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const prisma = getPrismaClient();
    const products = await prisma.product.findMany({
      include: {
        category: true,
        images: true,
        variants: true,
      },
    });

    const csvData = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      category: product.category?.name || '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      stockQuantity: product.stockQuantity,
      sku: product.sku,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    return NextResponse.json(csvData);
  } catch (error) {
    console.error('Error exporting products:', error);
    return NextResponse.json({ error: 'Failed to export products' }, { status: 500 });
  }
} 
