"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Supplier {
  id: string;
  name: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  status: string;
  supplier: Supplier;
  total: string;
  createdAt: string;
}

export default function PurchaseOrdersPage() {
  const { data: session } = useSession();
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  const adminId = session?.user?.id;

  useEffect(() => {
    if (!adminId) return;
    setLoading(true);
    fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
      .then((res) => res.json())
      .then((data) => setPOs(data))
      .finally(() => setLoading(false));
  }, [adminId]);

  const approvePO = async (id: string) => {
    setApproving(id);
    await fetch("/api/admin/purchase-orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, adminId }),
    });
    setApproving(null);
    // Refetch
    fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
      .then((res) => res.json())
      .then((data) => setPOs(data));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Purchase Orders</h1>
      {loading ? (
        <div>Loading...</div>
      ) : pos.length === 0 ? (
        <div>No purchase orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">PO Number</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Supplier</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => (
                <tr key={po.id} className="border-b">
                  <td className="p-2 font-mono">{po.orderNumber}</td>
                  <td className="p-2">{po.status}</td>
                  <td className="p-2">{po.supplier?.name || "-"}</td>
                  <td className="p-2">R{Number(po.total).toFixed(2)}</td>
                  <td className="p-2">{new Date(po.createdAt).toLocaleString()}</td>
                  <td className="p-2 space-x-2">
                    <Link href={`/admin/purchase-orders/${po.id}`} className="underline text-blue-600">View</Link>
                    {po.status === "DRAFT" && (
                      <Button size="sm" onClick={() => approvePO(po.id)} disabled={approving === po.id}>
                        {approving === po.id ? "Approving..." : "Approve"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 