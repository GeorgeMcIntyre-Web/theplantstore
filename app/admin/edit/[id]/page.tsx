// app/admin/edit/[id]/page.tsx

import { notFound } from 'next/navigation';

import { ProductForm } from '@/components/admin/ProductForm';
import { prisma } from '@/lib/db'; // Corrected: changed db to prisma

interface EditProductPageProps {
  params: {
    id: string;
  };
}

async function getProduct(id: string) {
  const product = await prisma.product.findUnique({ // Corrected: changed db to prisma
    where: { id },
  });
  return product;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    return notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <div className="mt-8">
        <ProductForm product={product} />
      </div>
    </div>
  );
}