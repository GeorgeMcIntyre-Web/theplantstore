// app/admin/products/[id]/page.tsx

// This line tells Next.js to render this page dynamically
export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { prisma } from '@/lib/db';

interface EditProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: true,
      reviews: true,
    },
  });
  return product;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    return notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <div className="mt-8">
        <ProductForm product={product as any} />
      </div>
    </div>
  );
}
