import { NextResponse } from 'next/server';
import { getPrismaClient } from '@/lib/db';

export async function GET() {
  try {
    const prisma = getPrismaClient();
    
    // Test database connection
    await prisma.$connect();
    
    // Test basic query
    const productCount = await prisma.product.count();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      productCount,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV,
    }, { status: 500 });
  }
}
