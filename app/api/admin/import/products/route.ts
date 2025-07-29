import { getPrismaClient } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const prisma = getPrismaClient();
    const { products } = await request.json();
    
    const importedProducts = await prisma.product.createMany({
      data: products,
    });

    return NextResponse.json({ 
      message: `Successfully imported ${importedProducts.count} products` 
    });
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json({ error: 'Failed to import products' }, { status: 500 });
  }
} 
