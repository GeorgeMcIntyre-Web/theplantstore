// app/admin/products/[id]/page.tsx

// This line tells Next.js to render this page dynamically
export const dynamic = "force-dynamic";

import { notFound, useRouter } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { prisma } from "@/lib/db";
import type { Product } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

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

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const router = useRouter();
  const product = await getProduct(params.id);

  if (!product) {
    return notFound();
  }

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/admin/products");
            }
          }}
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold ml-2">Edit Product</h1>
      </div>
      <div className="mt-8">
        <ProductForm product={product as unknown as Partial<Product>} />
      </div>
    </div>
  );
}
