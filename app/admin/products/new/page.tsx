"use client";
// app/admin/products/new/page.tsx

import { ProductForm } from "@/components/admin/ProductForm";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();

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
        <h1 className="text-2xl font-bold ml-2">New Product</h1>
      </div>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
