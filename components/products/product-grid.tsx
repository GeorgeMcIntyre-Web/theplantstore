"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Product } from "@/lib/types";
import { Star, Heart, ShoppingCart, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface ProductGridProps {
  category?: string;
  searchParams?: {
    page?: string;
    careLevel?: string;
    lightRequirement?: string;
    isPetSafe?: string;
    plantSize?: string;
    sortBy?: string;
    sortOrder?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export function ProductGrid({ category, searchParams }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });
  const [sortBy, setSortBy] = useState(searchParams?.sortBy || "name");
  const [sortOrder, setSortOrder] = useState(searchParams?.sortOrder || "asc");
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(price);
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (searchParams?.page) params.append("page", searchParams.page);
      if (searchParams?.careLevel)
        params.append("careLevel", searchParams.careLevel);
      if (searchParams?.lightRequirement)
        params.append("lightRequirement", searchParams.lightRequirement);
      if (searchParams?.isPetSafe)
        params.append("isPetSafe", searchParams.isPetSafe);
      if (searchParams?.plantSize)
        params.append("plantSize", searchParams.plantSize);
      if (searchParams?.minPrice)
        params.append("minPrice", searchParams.minPrice);
      if (searchParams?.maxPrice)
        params.append("maxPrice", searchParams.maxPrice);

      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, searchParams, sortBy, sortOrder]);

  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split("-");
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {products.length} of {pagination.total} products
        </p>
        <Select
          value={`${sortBy}-${sortOrder}`}
          onValueChange={handleSortChange}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
            <SelectItem value="created-desc">Newest First</SelectItem>
            <SelectItem value="created-asc">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="rounded-full bg-muted p-6 mx-auto w-fit mb-4">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or search criteria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const primaryImage =
              product.images.find((img) => img.isPrimary) || product.images[0];
            const discountPercent = product.compareAtPrice
              ? Math.round(
                  ((product.compareAtPrice - product.price) /
                    product.compareAtPrice) *
                    100,
                )
              : 0;

            return (
              <Card
                key={product.id}
                className="group cursor-pointer card-hover"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Link href={`/products/${product.slug}`}>
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={primaryImage.altText || product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">
                              No image
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {discountPercent > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          -{discountPercent}%
                        </Badge>
                      )}
                      {product.stockQuantity <= product.lowStockThreshold && (
                        <Badge variant="secondary" className="text-xs">
                          Low Stock
                        </Badge>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Care Level & Pet Safe */}
                    <div className="flex items-center gap-2 mb-3">
                      {product.careLevel && (
                        <Badge variant="outline" className="text-xs">
                          {product.careLevel.toLowerCase()}
                        </Badge>
                      )}
                      {product.isPetSafe && (
                        <Badge
                          variant="outline"
                          className="text-xs text-green-600"
                        >
                          Pet Safe
                        </Badge>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold currency">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="ml-2 text-sm text-muted-foreground line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      {/* Rating - hidden for now */}
                      {false && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">
                            {(product as any).averageRating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Add to Cart */}
                    <Button
                      className="w-full"
                      onClick={() => addItem(product.id)}
                      disabled={product.stockQuantity === 0}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {product.stockQuantity === 0
                        ? "Out of Stock"
                        : "Add to Cart"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-8">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                variant={page === pagination.page ? "default" : "outline"}
                size="sm"
                asChild
              >
                <Link
                  href={`?${new URLSearchParams({
                    ...searchParams,
                    page: page.toString(),
                  }).toString()}`}
                >
                  {page}
                </Link>
              </Button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
