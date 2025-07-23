"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface Customer {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/customers");
      const data = await res.json();
      if (res.ok) setCustomers(data || []);
      else setError(data.error || "Failed to fetch customers");
    } catch (e) {
      setError("Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openAddModal = () => {
    setEditCustomer(null);
    setForm({ name: "", email: "", password: "" });
    setModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditCustomer(customer);
    setForm({ name: customer.name || "", email: customer.email, password: "" });
    setModalOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(`Delete customer '${customer.name}'?`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customer.id }),
      });
      if (res.ok) {
        toast({ title: "Customer deleted" });
        setCustomers(customers.filter((c) => c.id !== customer.id));
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete customer", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editCustomer ? "PUT" : "POST";
      const body: any = editCustomer
        ? { id: editCustomer.id, name: form.name }
        : { name: form.name, email: form.email, password: form.password };
      const res = await fetch("/api/admin/customers", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: editCustomer ? "Customer updated" : "Customer created" });
        setModalOpen(false);
        fetchCustomers();
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to save customer", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Customers</h3>
        <Button onClick={openAddModal}>Add Customer</Button>
      </div>
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : error ? (
        <div className="p-8 text-center text-destructive">{error}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Date Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.role}</TableCell>
                  <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(customer)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(customer)} disabled={saving}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCustomer ? "Edit Customer" : "Add Customer"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                disabled={saving}
              />
            </div>
            {!editCustomer && (
              <>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    disabled={saving}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    disabled={saving}
                  />
                </div>
              </>
            )}
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editCustomer ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 