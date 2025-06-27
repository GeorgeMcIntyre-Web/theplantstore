// app/admin/products/[id]/page.tsx

import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/ProductForm';
import { prisma } from '@/lib/db';

// This interface defines the expected props for the page
interface EditProductPageProps {
  params: {
    id: string; // The product ID from the URL
  };
}

// Async function to fetch a single product from the database by its ID
async function getProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product;
}

// This is the main component for the edit page
export default async function EditProductPage({ params }: EditProductPageProps) {
  // Fetch the product using the ID from the URL parameters
  const product = await getProduct(params.id);

  // If no product is found with that ID, show a 404 page
  if (!product) {
    return notFound();
  }

  // Render the page title and the ProductForm component
  return (
    <div>
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <div className="mt-8">
        {/* Pass the fetched product data to the form */}
        <ProductForm product={product} />
      </div>
    </div>
  );
}
