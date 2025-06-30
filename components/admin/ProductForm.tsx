// components/admin/ProductForm.tsx - UPDATED WITH DYNAMIC CATEGORIES
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Product } from "@/lib/types";

interface ProductFormProps {
  product?: Partial<Product>;
}

interface Category {
  id: string;
  name: string;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    shortDescription: product?.shortDescription || "",
    price: product?.price ? Number(product.price) : 0,
    compareAtPrice: product?.compareAtPrice
      ? Number(product.compareAtPrice)
      : 0,
    sku: product?.sku || "",
    stockQuantity: product?.stockQuantity || 0,
    lowStockThreshold: product?.lowStockThreshold || 10,
    weight: product?.weight ? Number(product.weight) : 0,
    dimensions: product?.dimensions || "",
    categoryId: product?.categoryId || "",
    isFeatured: product?.isFeatured || false,
    careLevel: product?.careLevel || "",
    lightRequirement: product?.lightRequirement || "",
    wateringFrequency: product?.wateringFrequency || "",
    isPetSafe: product?.isPetSafe || false,
    plantSize: product?.plantSize || "",
    growthRate: product?.growthRate || "",
    careInstructions: product?.careInstructions || "",
    metaTitle: product?.metaTitle || "",
    metaDescription: product?.metaDescription || "",
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        } else {
          console.error("Failed to fetch categories");
          // Fallback to mock data if API fails
          setCategories([
            { id: "cat1", name: "Indoor Plants" },
            { id: "cat2", name: "Outdoor Plants" },
            { id: "cat3", name: "Succulents" },
            { id: "cat4", name: "Accessories" },
          ]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to mock data
        setCategories([
          { id: "cat1", name: "Indoor Plants" },
          { id: "cat2", name: "Outdoor Plants" },
          { id: "cat3", name: "Succulents" },
          { id: "cat4", name: "Accessories" },
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = product?.id
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = product?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: product?.id ? "Product updated" : "Product created",
          description: "Product has been saved successfully.",
        });
        router.push("/admin/products");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to save product");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input
                  id="shortDescription"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    handleInputChange("shortDescription", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (R) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange("price", parseFloat(e.target.value))
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="compareAtPrice">Compare Price (R)</Label>
                  <Input
                    id="compareAtPrice"
                    type="number"
                    step="0.01"
                    value={formData.compareAtPrice}
                    onChange={(e) =>
                      handleInputChange(
                        "compareAtPrice",
                        parseFloat(e.target.value),
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => handleInputChange("sku", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="categoryId">Category *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      handleInputChange("categoryId", value)
                    }
                    disabled={categoriesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          categoriesLoading
                            ? "Loading categories..."
                            : "Select category"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plant Care Information */}
          <Card>
            <CardHeader>
              <CardTitle>Plant Care Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="careLevel">Care Level</Label>
                  <Select
                    value={formData.careLevel}
                    onValueChange={(value) =>
                      handleInputChange("careLevel", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select care level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MODERATE">Moderate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lightRequirement">Light Requirement</Label>
                  <Select
                    value={formData.lightRequirement}
                    onValueChange={(value) =>
                      handleInputChange("lightRequirement", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select light requirement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="BRIGHT">Bright</SelectItem>
                      <SelectItem value="DIRECT_SUN">Direct Sun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="wateringFrequency">Watering Frequency</Label>
                  <Select
                    value={formData.wateringFrequency}
                    onValueChange={(value) =>
                      handleInputChange("wateringFrequency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select watering frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="BI_WEEKLY">Bi-weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="plantSize">Plant Size</Label>
                  <Select
                    value={formData.plantSize}
                    onValueChange={(value) =>
                      handleInputChange("plantSize", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plant size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMALL">Small</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LARGE">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="careInstructions">Care Instructions</Label>
                <Textarea
                  id="careInstructions"
                  value={formData.careInstructions}
                  onChange={(e) =>
                    handleInputChange("careInstructions", e.target.value)
                  }
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPetSafe"
                  checked={formData.isPetSafe}
                  onCheckedChange={(checked) =>
                    handleInputChange("isPetSafe", checked)
                  }
                />
                <Label htmlFor="isPetSafe">Pet Safe</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stockQuantity">Stock Quantity *</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) =>
                    handleInputChange("stockQuantity", parseInt(e.target.value))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                <Input
                  id="lowStockThreshold"
                  type="number"
                  value={formData.lowStockThreshold}
                  onChange={(e) =>
                    handleInputChange(
                      "lowStockThreshold",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    handleInputChange("isFeatured", checked)
                  }
                />
                <Label htmlFor="isFeatured">Featured Product</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) =>
                    handleInputChange("metaTitle", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) =>
                    handleInputChange("metaDescription", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? "Saving..."
            : product?.id
              ? "Update Product"
              : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
