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
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({
    name: "",
    isActive: true,
    sortOrder: 0,
  });
  const [saving, setSaving] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const allSelected = categories.length > 0 && selectedCategoryIds.length === categories.length;
  const toggleSelectAll = () => setSelectedCategoryIds(allSelected ? [] : categories.map(c => c.id));
  const toggleSelect = (id: string) => setSelectedCategoryIds(selectedCategoryIds.includes(id) ? selectedCategoryIds.filter(cid => cid !== id) : [...selectedCategoryIds, id]);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
      else setError(data.error || "Failed to fetch categories");
    } catch (e) {
      setError("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditCategory(null);
    setForm({ name: "", isActive: true, sortOrder: 0 });
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditCategory(cat);
    setForm({
      name: cat.name,
      isActive: cat.isActive,
      sortOrder: cat.sortOrder,
    });
    setModalOpen(true);
  };

  const handleDelete = async (cat: Category) => {
    if (!window.confirm(`Delete category '${cat.name}'?`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id }),
      });
      if (res.ok) {
        toast({ title: "Category deleted" });
        setCategories(categories.filter((c) => c.id !== cat.id));
      } else {
        const data = await res.json();
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = editCategory ? "PUT" : "POST";
      const res = await fetch("/api/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editCategory ? { id: editCategory.id } : {}),
          name: form.name,
          isActive: form.isActive,
          sortOrder: Number(form.sortOrder) || 0,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: editCategory ? "Category updated" : "Category created" });
        setModalOpen(false);
        fetchCategories();
      } else {
        toast({ title: "Error", description: data.error, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to save category", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedCategoryIds.length} selected categories?`)) return;
    for (const id of selectedCategoryIds) {
      await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    }
    setSelectedCategoryIds([]);
    // Optionally, refresh category list here
    window.location.reload();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold">Categories</h3>
        <Button onClick={openAddModal}>Add Category</Button>
      </div>
      {loading ? (
        <div className="p-8 text-center">Loading...</div>
      ) : error ? (
        <div className="p-8 text-center text-destructive">{error}</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Active</TableHead>
              <TableHead>Sort Order</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell><input type="checkbox" checked={selectedCategoryIds.includes(cat.id)} onChange={() => toggleSelect(cat.id)} /></TableCell>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell>{cat.isActive ? "Yes" : "No"}</TableCell>
                  <TableCell>{cat.sortOrder}</TableCell>
                  <TableCell>{cat.id}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEditModal(cat)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(cat)} disabled={saving}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
      {selectedCategoryIds.length > 0 && (
        <div className="mb-4">
          <Button variant="destructive" onClick={handleBulkDelete}>
            Delete Selected ({selectedCategoryIds.length})
          </Button>
        </div>
      )}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCategory ? "Edit Category" : "Add Category"}</DialogTitle>
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
            <div className="flex items-center gap-2">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                disabled={saving}
              />
            </div>
            <div>
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                disabled={saving}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : editCategory ? "Update" : "Create"}
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