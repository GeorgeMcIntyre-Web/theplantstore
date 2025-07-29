// app/admin/products/[id]/page.tsx

// This line tells Next.js to render this page dynamically
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getPrismaClient } from "@/lib/db";
import type { Product } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  try {
    const prisma = getPrismaClient();
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    return notFound();
  }

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <Link
          href="/admin/products"
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
        <h1 className="text-2xl font-bold ml-2">Edit Product</h1>
      </div>
      <div className="mt-8">
        <ProductForm product={product as unknown as Partial<Product>} />
      </div>
    </div>
  );
}
