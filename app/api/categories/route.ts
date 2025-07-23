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
    const categories = await queryD1('SELECT * FROM categories ORDER BY name', [], 'all');
    
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Categories API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch categories',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const { name, isActive = true, sortOrder = 0 } = await request.json();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const slug = generateSlug(name);
    const category = await queryD1('INSERT INTO categories (name, slug, isActive, sortOrder) VALUES (?, ?, ?, ?)', [name, slug, isActive, sortOrder], 'first');
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, isActive, sortOrder } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    let data: any = { isActive, sortOrder };
    if (name) {
      data.name = name;
      data.slug = generateSlug(name);
    }
    const category = await queryD1('UPDATE categories SET ? WHERE id = ?', [data, id], 'first');
    return NextResponse.json({ category });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }
    await queryD1('DELETE FROM categories WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
