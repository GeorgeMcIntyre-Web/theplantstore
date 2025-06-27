// app/admin/products/new/page.tsx

import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Create New Product</h1>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}