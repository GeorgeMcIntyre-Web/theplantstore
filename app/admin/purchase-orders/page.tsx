"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  total: string;
  createdAt: string;
  items: POItem[];
}

export default function PurchaseOrdersPage() {
  const { data: session } = useSession();
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [editingQuantities, setEditingQuantities] = useState<Record<string, number>>({});
  const [batchQuantity, setBatchQuantity] = useState<number>(1);
  const [showBatchQuantity, setShowBatchQuantity] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [batchSupplier, setBatchSupplier] = useState<string>("");
  const [showBatchSupplier, setShowBatchSupplier] = useState(false);
  const router = useRouter();
  const adminId = session?.user?.id;
  const { toast } = useToast();

  useEffect(() => {
    if (!adminId) return;
    setLoading(true);
    fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
      .then((res) => res.json())
      .then((data) => setPOs(data))
      .finally(() => setLoading(false));
    // Fetch suppliers
    fetch("/api/admin/suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(data));
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

  const handleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));
  };
  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? pos.map((po) => po.id) : []);
  };

  const handleQuantityChange = (poId: string, value: number) => {
    setEditingQuantities((prev) => ({ ...prev, [poId]: value }));
  };

  const saveQuantity = async (po: PurchaseOrder) => {
    const newQty = editingQuantities[po.id];
    if (!newQty || newQty < 1) return;
    // PATCH to backend (to be implemented)
    await fetch(`/api/admin/purchase-orders/${po.id}/quantity`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });
    setEditingQuantities((prev) => {
      const copy = { ...prev };
      delete copy[po.id];
      return copy;
    });
    // Refetch
    fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
      .then((res) => res.json())
      .then((data) => setPOs(data));
  };

  const handleBatchQuantity = async () => {
    for (const poId of selected) {
      await fetch(`/api/admin/purchase-orders/${poId}/quantity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: batchQuantity }),
      });
    }
    setShowBatchQuantity(false);
    setBatchQuantity(1);
    setSelected([]);
    // Refetch
    fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
      .then((res) => res.json())
      .then((data) => setPOs(data));
  };

  const handleBatchApprove = async () => {
    for (const poId of selected) {
      await fetch("/api/admin/purchase-orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: poId, adminId }),
      });
    }
    setSelected([]);
    // Refetch
    fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
      .then((res) => res.json())
      .then((data) => setPOs(data));
  };

  const handleBatchSupplier = async () => {
    for (const poId of selected) {
      await fetch(`/api/admin/purchase-orders/${poId}/supplier`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplierId: batchSupplier }),
      });
    }
    setShowBatchSupplier(false);
    setBatchSupplier("");
    setSelected([]);
    // Refetch
    fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
      .then((res) => res.json())
      .then((data) => setPOs(data));
  };

  const generateAutoDraftPOs = async () => {
    if (!adminId) return;
    try {
      const res = await fetch("/api/admin/purchase-orders/auto-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: `Created ${data.created} auto-draft purchase order(s).` });
        // Refetch
        setLoading(true);
        fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
          .then((res) => res.json())
          .then((data) => setPOs(data))
          .finally(() => setLoading(false));
      } else {
        toast({ title: "Error", description: data.error || "Failed to generate purchase orders.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to generate purchase orders.", variant: "destructive" });
    }
  };

  const deleteSelectedDrafts = async () => {
    if (!adminId || selected.length === 0) return;
    try {
      const res = await fetch("/api/admin/purchase-orders/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, poIds: selected }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: `Deleted ${data.deleted} draft purchase order(s).` });
        setSelected([]);
        setLoading(true);
        fetch(`/api/admin/purchase-orders?adminId=${adminId}`)
          .then((res) => res.json())
          .then((data) => setPOs(data))
          .finally(() => setLoading(false));
      } else {
        toast({ title: "Error", description: data.error || "Failed to delete purchase orders.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete purchase orders.", variant: "destructive" });
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/admin");
            }
          }}
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold ml-2">Purchase Orders</h1>
        <Button className="ml-auto" variant="outline" onClick={generateAutoDraftPOs}>
          Generate Purchase Orders for Low Stock
        </Button>
      </div>
      {selected.length > 0 && (
        <div className="mb-4 flex gap-4 items-center bg-accent p-3 rounded">
          <span>{selected.length} selected</span>
          <Button size="sm" onClick={() => setShowBatchQuantity(true)}>Batch Update Quantity</Button>
          <Button size="sm" onClick={() => setShowBatchSupplier(true)}>Batch Update Supplier</Button>
          <Button size="sm" onClick={handleBatchApprove}>Batch Approve</Button>
          <Button size="sm" variant="destructive" onClick={deleteSelectedDrafts}>Delete Selected</Button>
        </div>
      )}
      {showBatchQuantity && (
        <div className="mb-4 flex gap-2 items-center bg-muted p-3 rounded">
          <span>Set quantity for {selected.length} selected POs:</span>
          <input
            type="number"
            min={1}
            value={batchQuantity}
            onChange={e => setBatchQuantity(Number(e.target.value))}
            className="border p-1 w-20"
          />
          <Button size="sm" onClick={handleBatchQuantity}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowBatchQuantity(false)}>Cancel</Button>
        </div>
      )}
      {showBatchSupplier && (
        <div className="mb-4 flex gap-2 items-center bg-muted p-3 rounded">
          <span>Set supplier for {selected.length} selected POs:</span>
          <select
            className="border p-1 rounded"
            value={batchSupplier}
            onChange={e => setBatchSupplier(e.target.value)}
          >
            <option value="">Select supplier...</option>
            {suppliers.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <Button size="sm" onClick={handleBatchSupplier} disabled={!batchSupplier}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setShowBatchSupplier(false)}>Cancel</Button>
        </div>
      )}
      {loading ? (
        <div>Loading...</div>
      ) : pos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-lg mb-4">No purchase orders found.</div>
          <div className="mb-4">
            <Button onClick={generateAutoDraftPOs}>
              Generate Purchase Orders for Low Stock
            </Button>
          </div>
          <Link href="/admin/purchase-orders/new">
            <Button variant="secondary">Create Purchase Order</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2"><input type="checkbox" checked={selected.length === pos.length} onChange={e => handleSelectAll(e.target.checked)} /></th>
                <th className="p-2 text-left">PO Number</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Supplier</th>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Amount Required</th>
                <th className="p-2 text-left">Total</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pos.map((po) => {
                const isSelected = selected.includes(po.id);
                const isDraft = po.status === "DRAFT";
                const item = Array.isArray(po.items) ? po.items[0] : null;
                return (
                  <tr key={po.id} className="border-b">
                    <td className="p-2"><input type="checkbox" checked={isSelected} onChange={e => handleSelect(po.id, e.target.checked)} /></td>
                    <td className="p-2 font-mono">{po.orderNumber}</td>
                    <td className="p-2">{po.status}</td>
                    <td className="p-2">{po.supplier?.name || "-"}</td>
                    <td className="p-2">{item?.name || "-"}</td>
                    <td className="p-2">
                      {isDraft && item ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            value={editingQuantities[po.id] ?? item.quantity}
                            onChange={e => handleQuantityChange(po.id, Number(e.target.value))}
                            className="border p-1 w-20"
                          />
                          <Button size="sm" onClick={() => saveQuantity(po)} disabled={!editingQuantities[po.id] || editingQuantities[po.id] === item.quantity}>Save</Button>
                        </div>
                      ) : item ? (
                        item.quantity
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-2">R{Number(po.total).toFixed(2)}</td>
                    <td className="p-2">{new Date(po.createdAt).toLocaleString()}</td>
                    <td className="p-2 space-x-2">
                      <Link href={`/admin/purchase-orders/${po.id}`} className="underline text-blue-600">View</Link>
                      {isDraft && (
                        <Button size="sm" onClick={() => approvePO(po.id)} disabled={approving === po.id}>
                          {approving === po.id ? "Approving..." : "Approve"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 