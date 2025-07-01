export const dynamic = "force-dynamic";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
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
    const category = await prisma.category.create({
      data: { name, slug, isActive, sortOrder },
    });
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
    const category = await prisma.category.update({
      where: { id },
      data,
    });
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
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 },
    );
  }
}
