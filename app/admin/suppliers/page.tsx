"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<Partial<Supplier>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/suppliers")
      .then((res) => res.json())
      .then((data) => setSuppliers(data))
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm(supplier);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;
    await fetch(`/api/admin/suppliers`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const method = editing ? "PATCH" : "POST";
    const res = await fetch("/api/admin/suppliers", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const saved = await res.json();
    if (editing) {
      setSuppliers((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
    } else {
      setSuppliers((prev) => [...prev, saved]);
    }
    setEditing(null);
    setForm({});
    setSaving(false);
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Suppliers</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <table className="min-w-full border mb-8">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Phone</th>
                <th className="p-2 text-left">Address</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.email || "-"}</td>
                  <td className="p-2">{s.phone || "-"}</td>
                  <td className="p-2">{s.address || "-"}</td>
                  <td className="p-2 space-x-2">
                    <Button size="sm" onClick={() => handleEdit(s)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(s.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <form className="space-y-4" onSubmit={handleSave}>
            <h2 className="text-lg font-semibold mb-2">{editing ? "Edit Supplier" : "Add Supplier"}</h2>
            <div>
              <input
                className="border p-2 w-full"
                placeholder="Name"
                value={form.name || ""}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <input
                className="border p-2 w-full"
                placeholder="Email"
                value={form.email || ""}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                type="email"
              />
            </div>
            <div>
              <input
                className="border p-2 w-full"
                placeholder="Phone"
                value={form.phone || ""}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div>
              <input
                className="border p-2 w-full"
                placeholder="Address"
                value={form.address || ""}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : editing ? "Save Changes" : "Add Supplier"}</Button>
            {editing && (
              <Button type="button" variant="ghost" onClick={() => { setEditing(null); setForm({}); }}>Cancel</Button>
            )}
          </form>
        </>
      )}
    </>
  );
} 