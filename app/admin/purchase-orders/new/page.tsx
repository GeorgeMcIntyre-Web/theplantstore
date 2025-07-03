"use client";
export const dynamic = "force-dynamic";
import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
}

interface POItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

function PurchaseOrderForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplierId, setSupplierId] = useState<string>("");
  const [items, setItems] = useState<POItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<{ productId: string; quantity: number }>({ productId: "", quantity: 1 });
  const [saving, setSaving] = useState(false);

  const adminId = session?.user?.id;

  useEffect(() => {
    fetch("/api/admin/suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(data));
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products || []));
  }, []);

  // Pre-fill item from query params
  useEffect(() => {
    const productId = searchParams.get("productId");
    const quantity = Number(searchParams.get("quantity")) || 1;
    if (productId && products.length > 0) {
      const product = products.find((p) => p.id === productId);
      if (product && !items.some((item) => item.productId === productId)) {
        setItems((prev) => [
          ...prev,
          { productId: product.id, name: product.name, quantity, price: product.price },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, searchParams]);

  const addItem = () => {
    const product = products.find((p) => p.id === form.productId);
    if (!product) return;
    setItems((prev) => [
      ...prev,
      { productId: product.id, name: product.name, quantity: form.quantity, price: product.price },
    ]);
    setForm({ productId: "", quantity: 1 });
    setAdding(false);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminId || !supplierId || items.length === 0) return;
    setSaving(true);
    await fetch("/api/admin/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminId, supplierId, items }),
    });
    setSaving(false);
    router.push("/admin/purchase-orders");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Purchase Order</h1>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium">Supplier</label>
          <select
            className="border p-2 w-full"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            required
          >
            <option value="">Select supplier...</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Items</label>
          <table className="min-w-full border mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.productId} className="border-b">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2">{item.quantity}</td>
                  <td className="p-2">R{Number(item.price).toFixed(2)}</td>
                  <td className="p-2">R{Number(item.price * item.quantity).toFixed(2)}</td>
                  <td className="p-2">
                    <Button size="sm" variant="destructive" onClick={() => removeItem(item.productId)}>Remove</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {adding ? (
            <div className="flex gap-2 items-end mb-2">
              <select
                className="border p-2"
                value={form.productId}
                onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                required
              >
                <option value="">Select product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                className="border p-2 w-20"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                required
              />
              <Button type="button" size="sm" onClick={addItem}>Add</Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button>
            </div>
          ) : (
            <Button type="button" size="sm" onClick={() => setAdding(true)}>Add Item</Button>
          )}
        </div>
        <Button type="submit" disabled={saving || !supplierId || items.length === 0}>
          {saving ? "Saving..." : "Create Purchase Order"}
        </Button>
      </form>
    </div>
  );
}

export default function NewPurchaseOrderPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8 max-w-2xl">Loading...</div>}>
      <PurchaseOrderForm />
    </Suspense>
  );
} 