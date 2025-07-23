"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CartItemWithProduct } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface CartItemCardProps {
  item: CartItemWithProduct;
}

export function CartItemCard({ item }: CartItemCardProps) {
  const { updateQuantity, removeItem, isLoading } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(price);
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.product.stockQuantity) return;

    setQuantity(newQuantity);
    await updateQuantity(item.id, newQuantity);
  };

  const primaryImage =
    item.product.images.find((img) => img.isPrimary) || item.product.images[0];

  return (
    <Card className="p-4">
      <div className="flex space-x-4">
        {/* Product Image */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText || item.product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">No image</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/products/${item.product.slug}`}
            className="text-sm font-medium hover:text-primary"
          >
            {item.product.name}
          </Link>

          <div className="mt-1 flex items-center space-x-2">
            <span className="text-sm font-semibold currency">
              {formatPrice(item.product.price)}
            </span>
            {item.product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(item.product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="mt-2 flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isLoading || quantity <= 1}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseInt(e.target.value);
                if (!isNaN(newQuantity)) {
                  handleQuantityChange(newQuantity);
                }
              }}
              className="h-8 w-16 text-center"
              min={1}
              max={item.product.stockQuantity}
              disabled={isLoading}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isLoading || quantity >= item.product.stockQuantity}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(item.id)}
              disabled={isLoading}
              className="h-8 w-8 p-0 ml-auto text-destructive hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* Stock Warning */}
          {item.product.stockQuantity <= item.product.lowStockThreshold && (
            <p className="text-xs text-orange-600 mt-1">
              Only {item.product.stockQuantity} left in stock
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
