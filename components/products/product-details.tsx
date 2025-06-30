"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Product } from "@/lib/types";
import { useCart } from "@/hooks/use-cart";
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Droplets,
  Sun,
  PawPrint,
  Ruler,
  TrendingUp,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProductDetailsProps {
  product: Product & {
    averageRating: number;
    reviewCount: number;
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem, isLoading } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(price);
  };

  const discountPercent = product.compareAtPrice
    ? Math.round(
        ((Number(product.compareAtPrice) - Number(product.price)) /
          Number(product.compareAtPrice)) *
          100,
      )
    : 0;

  const handleAddToCart = async () => {
    await addItem(product.id, quantity);
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: isWishlisted
        ? "Item removed from your wishlist"
        : "Item added to your wishlist",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.shortDescription || product.description || "",
          url: window.location.href,
        });
      } catch (error) {
        // Handle share error
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  const getCareIcon = (type: string) => {
    switch (type) {
      case "watering":
        return <Droplets className="h-4 w-4 text-blue-600" />;
      case "light":
        return <Sun className="h-4 w-4 text-yellow-600" />;
      case "pet":
        return <PawPrint className="h-4 w-4 text-green-600" />;
      case "size":
        return <Ruler className="h-4 w-4 text-purple-600" />;
      case "growth":
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Product Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline">{product.category.name}</Badge>
          {product.isFeatured && <Badge variant="secondary">Featured</Badge>}
        </div>

        <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

        {/* Rating */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-5 w-5 ${
                  i < Math.floor(product.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground">
              {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleWishlist}
              className={isWishlisted ? "text-red-500" : ""}
            >
              <Heart
                className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
              />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold currency">
            {formatPrice(Number(product.price))}
          </span>
          {product.compareAtPrice && (
            <>
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(Number(product.compareAtPrice))}
              </span>
              <Badge variant="destructive" className="text-sm">
                {discountPercent}% OFF
              </Badge>
            </>
          )}
        </div>

        {product.shortDescription && (
          <p className="text-muted-foreground">{product.shortDescription}</p>
        )}
      </div>

      {/* Plant Care Information */}
      {(product.careLevel ||
        product.lightRequirement ||
        product.wateringFrequency ||
        product.isPetSafe !== null ||
        product.plantSize ||
        product.growthRate) && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Plant Care Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {product.careLevel && (
                <div className="flex items-center gap-2">
                  {getCareIcon("care")}
                  <span>
                    Care Level:{" "}
                    <strong>{product.careLevel.toLowerCase()}</strong>
                  </span>
                </div>
              )}
              {product.lightRequirement && (
                <div className="flex items-center gap-2">
                  {getCareIcon("light")}
                  <span>
                    Light:{" "}
                    <strong>
                      {product.lightRequirement.replace("_", " ").toLowerCase()}
                    </strong>
                  </span>
                </div>
              )}
              {product.wateringFrequency && (
                <div className="flex items-center gap-2">
                  {getCareIcon("watering")}
                  <span>
                    Water:{" "}
                    <strong>
                      {product.wateringFrequency
                        .replace("_", " ")
                        .toLowerCase()}
                    </strong>
                  </span>
                </div>
              )}
              {product.isPetSafe !== null && (
                <div className="flex items-center gap-2">
                  {getCareIcon("pet")}
                  <span
                    className={
                      product.isPetSafe ? "text-green-600" : "text-red-600"
                    }
                  >
                    <strong>
                      {product.isPetSafe ? "Pet Safe" : "Not Pet Safe"}
                    </strong>
                  </span>
                </div>
              )}
              {product.plantSize && (
                <div className="flex items-center gap-2">
                  {getCareIcon("size")}
                  <span>
                    Size: <strong>{product.plantSize.toLowerCase()}</strong>
                  </span>
                </div>
              )}
              {product.growthRate && (
                <div className="flex items-center gap-2">
                  {getCareIcon("growth")}
                  <span>
                    Growth: <strong>{product.growthRate.toLowerCase()}</strong>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock Status */}
      <div className="space-y-2">
        {product.stockQuantity > 0 ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 font-medium">In Stock</span>
            {product.stockQuantity <= product.lowStockThreshold && (
              <span className="text-sm text-orange-600">
                (Only {product.stockQuantity} left)
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm text-red-600 font-medium">
              Out of Stock
            </span>
          </div>
        )}

        {product.sku && (
          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
        )}
      </div>

      {/* Quantity and Add to Cart */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="px-3"
            >
              -
            </Button>
            <span className="px-4 py-2 text-center min-w-[3rem]">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setQuantity(Math.min(product.stockQuantity, quantity + 1))
              }
              disabled={quantity >= product.stockQuantity}
              className="px-3"
            >
              +
            </Button>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0 || isLoading}
            className="flex-1"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {product.stockQuantity === 0
              ? "Out of Stock"
              : isLoading
                ? "Adding..."
                : "Add to Cart"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Shipping & Returns */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <Truck className="h-5 w-5 text-green-600" />
          <span>Free shipping on orders over R500</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Shield className="h-5 w-5 text-blue-600" />
          <span>30-day plant guarantee</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <RotateCcw className="h-5 w-5 text-orange-600" />
          <span>Easy returns within 14 days</span>
        </div>
      </div>
    </div>
  );
}
