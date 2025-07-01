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

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
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
