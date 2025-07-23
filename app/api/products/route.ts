import { NextRequest, NextResponse } from 'next/server';

// D1 Database client for local development
const D1_API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8787' 
  : 'https://theplantstore.fractalnexustech.workers.dev';

async function queryD1(query: string, params: any[] = [], type: 'first' | 'all' | 'run' = 'all') {
  const response = await fetch(`${D1_API_URL}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, params, type })
  });
  
  if (!response.ok) {
    throw new Error(`D1 query failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = 1
    `;
    const params: any[] = [];

    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }

    if (featured === 'true') {
      query += ' AND p.is_featured = 1';
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = await queryD1(query, params, 'all');
    
    return NextResponse.json({
      success: true,
      data: products,
      total: products.length
    });
  } catch (error) {
    console.error('Products API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
