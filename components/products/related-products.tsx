"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/lib/types";
import { ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface RelatedProductsProps {
  products: (Product & {
    images: { url: string; altText?: string | null; isPrimary: boolean }[];
  })[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(price);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-6">You might also like</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
            <Card key={product.id} className="group cursor-pointer card-hover">
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
                </div>

                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Care Level */}
                  {product.careLevel && (
                    <div className="mb-3">
                      <Badge variant="outline" className="text-xs">
                        {product.careLevel.toLowerCase()}
                      </Badge>
                    </div>
                  )}

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-bold currency">
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
                        <span className="text-sm text-muted-foreground">4.8</span>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart */}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => addItem(product.id, 1, product)}
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
    </div>
  );
}
