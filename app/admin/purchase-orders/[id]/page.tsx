"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
}

interface POItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: string;
  supplier: Supplier;
  supplierId?: string;
  items: POItem[];
  total: string;
  createdAt: string;
}

export default function PurchaseOrderDetailPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const [po, setPO] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [savingSupplier, setSavingSupplier] = useState(false);
  const adminId = session?.user?.id;
  const id = params?.id as string;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p: PurchaseOrder) => p.id === id);
        setPO(found || null);
        setSelectedSupplier(found?.supplier?.id || "");
      })
      .finally(() => setLoading(false));
  }, [id, adminId]);

  useEffect(() => {
    // Fetch all suppliers
    fetch("/api/admin/suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(data));
  }, []);

  const approvePO = async () => {
    setApproving(true);
    await fetch("/api/admin/purchase-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminId }),
    });
    setApproving(false);
    router.push("/admin/purchase-orders");
  };

  const updateSupplier = async () => {
    if (!selectedSupplier || !po) return;
    setSavingSupplier(true);
    await fetch(`/api/admin/purchase-orders/${po.id}/supplier`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId: selectedSupplier }),
    });
    setSavingSupplier(false);
    // Refetch PO
    setLoading(true);
    fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
      .then((res) => res.json())
      .then((data) => {
        const found = data.find((p: PurchaseOrder) => p.id === id);
        setPO(found || null);
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!po) return <div className="p-8">Purchase order not found.</div>;

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/admin/purchase-orders");
            }
          }}
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold ml-2">Purchase Order Details</h1>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Purchase Order {po.orderNumber}</h1>
        <div className="mb-4">
          <div><b>Status:</b> {po.status}</div>
          <div className="flex items-center gap-2">
            <b>Supplier:</b>
            {po.status === "DRAFT" ? (
              <>
                <select
                  className="border p-1 rounded"
                  value={selectedSupplier}
                  onChange={e => setSelectedSupplier(e.target.value)}
                  disabled={savingSupplier}
                >
                  <option value="">Select supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <Button size="sm" onClick={updateSupplier} disabled={savingSupplier || !selectedSupplier}>
                  {savingSupplier ? "Saving..." : "Save Supplier"}
                </Button>
              </>
            ) : (
              <span>{po.supplier?.name || "-"}</span>
            )}
          </div>
          <div><b>Total:</b> R{Number(po.total).toFixed(2)}</div>
          <div><b>Created:</b> {new Date(po.createdAt).toLocaleString()}</div>
        </div>
        <h2 className="text-lg font-semibold mb-2">Items</h2>
        <table className="min-w-full border mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Quantity</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Total</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(po.items) && po.items.map((item) => (
              <tr key={item.productId} className="border-b">
                <td className="p-2">{item.name}</td>
                <td className="p-2">{item.quantity}</td>
                <td className="p-2">R{Number(item.price).toFixed(2)}</td>
                <td className="p-2">R{Number(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {po.status === "DRAFT" && (
          <Button onClick={approvePO} disabled={approving}>
            {approving ? "Approving..." : "Approve Purchase Order"}
          </Button>
        )}
      </div>
    </div>
  );
} 