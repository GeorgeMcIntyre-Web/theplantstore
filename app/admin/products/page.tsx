// app/admin/products/page.tsx - COMPLETE FIXED VERSION
"use client";
import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit } from "lucide-react";
import Link from "next/link";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: "",
    productName: "",
  });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const allSelected = products.length > 0 && selectedProductIds.length === products.length;
  const toggleSelectAll = () => setSelectedProductIds(allSelected ? [] : products.map(p => p.id));
  const toggleSelect = (id: string) => setSelectedProductIds(selectedProductIds.includes(id) ? selectedProductIds.filter(pid => pid !== id) : [...selectedProductIds, id]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (product: unknown) => {
    const p = product as { id: string; name: string; /* add other expected fields here */ };
    setDeleteDialog({
      isOpen: true,
      productId: p.id,
      productName: p.name,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(
        `/api/admin/products/${deleteDialog.productId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        // Remove the deleted product from the local state
        setProducts(products.filter((p) => p.id !== deleteDialog.productId));
        alert("Product deleted successfully");
      } else {
        alert("Failed to delete product");
      }
    } catch (error) {
      alert("Failed to delete product");
    } finally {
      setDeleteDialog({ isOpen: false, productId: "", productName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, productId: "", productName: "" });
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedProductIds.length} selected products?`)) return;
    for (const id of selectedProductIds) {
      await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    }
    setSelectedProductIds([]);
    // Optionally, refresh product list here
    window.location.reload();
  };

  // Fetch categories for bulk actions
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (e) {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Bulk update handler
  const handleBulkAction = async (action: string, value?: any) => {
    setBulkActionLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedProductIds, action, value }),
      });
      if (res.ok) {
        // Refresh products
        await fetchProducts();
        setSelectedProductIds([]);
        setBulkCategory("");
        setBulkPrice("");
        setBulkStock("");
      } else {
        const data = await res.json();
        alert(data.error || "Bulk update failed");
      }
    } catch (e) {
      alert("Bulk update failed");
    } finally {
      setBulkActionLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading products...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Product
          </Link>
        </Button>
      </div>

      {selectedProductIds.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <Button
            size="sm"
            disabled={bulkActionLoading}
            onClick={() => handleBulkAction("activate")}
          >
            Activate
          </Button>
          <Button
            size="sm"
            disabled={bulkActionLoading}
            onClick={() => handleBulkAction("deactivate")}
          >
            Deactivate
          </Button>
          <Button
            size="sm"
            disabled={bulkActionLoading}
            onClick={() => handleBulkAction("setFeatured")}
          >
            Set Featured
          </Button>
          <Button
            size="sm"
            disabled={bulkActionLoading}
            onClick={() => handleBulkAction("unsetFeatured")}
          >
            Unset Featured
          </Button>
          <div className="flex items-center gap-1">
            <Select
              value={bulkCategory}
              onValueChange={(val) => setBulkCategory(val)}
              disabled={categoriesLoading || bulkActionLoading}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Change Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              disabled={!bulkCategory || bulkActionLoading}
              onClick={() => handleBulkAction("changeCategory", bulkCategory)}
            >
              Change
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Set Price"
              value={bulkPrice}
              min={0}
              step={0.01}
              onChange={(e) => setBulkPrice(e.target.value)}
              className="w-24"
              disabled={bulkActionLoading}
            />
            <Button
              size="sm"
              disabled={!bulkPrice || bulkActionLoading}
              onClick={() => handleBulkAction("setPrice", parseFloat(bulkPrice))}
            >
              Set
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="number"
              placeholder="Set Stock"
              value={bulkStock}
              min={0}
              step={1}
              onChange={(e) => setBulkStock(e.target.value)}
              className="w-24"
              disabled={bulkActionLoading}
            />
            <Button
              size="sm"
              disabled={!bulkStock || bulkActionLoading}
              onClick={() => handleBulkAction("setStock", parseInt(bulkStock))}
            >
              Set
            </Button>
          </div>
          <Button
            variant="destructive"
            size="sm"
            disabled={bulkActionLoading}
            onClick={handleBulkDelete}
          >
            Delete Selected ({selectedProductIds.length})
          </Button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><input type="checkbox" checked={allSelected} onChange={toggleSelectAll} /></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>ID</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No products found. Create your first product to get started.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell><input type="checkbox" checked={selectedProductIds.includes(product.id)} onChange={() => toggleSelect(product.id)} /></TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku || "-"}</TableCell>
                  <TableCell>{product.category?.name || "-"}</TableCell>
                  <TableCell>R{Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stockQuantity <=
                        (product.lowStockThreshold || 10)
                          ? "bg-red-100 text-red-800"
                          : product.stockQuantity <=
                              (product.lowStockThreshold || 10) * 2
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {product.stockQuantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                    <Switch
                      checked={product.isActive}
                      onCheckedChange={async (checked) => {
                        // Update isActive status via API
                        await fetch(`/api/admin/products/${product.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ isActive: checked }),
                        });
                        // Update UI
                        setProducts((prev) =>
                          prev.map((p) =>
                            p.id === product.id ? { ...p, isActive: checked } : p
                          )
                        );
                      }}
                      className="ml-2"
                    />
                  </TableCell>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/products/${product.id}`}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(product)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.isOpen} onOpenChange={handleDeleteCancel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;<strong>{deleteDialog.productName}</strong>&quot; and all associated
              data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Product
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
