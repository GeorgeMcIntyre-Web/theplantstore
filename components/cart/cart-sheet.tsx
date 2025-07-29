"use client";

import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { CartItemCard } from "@/components/cart/cart-item-card";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag } from "lucide-react";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, totalAmount, itemCount, isLoading } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(price);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Shopping Cart
            {itemCount > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {!items || items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4">
            <div className="rounded-full bg-muted p-6">
              <ShoppingBag className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center">
              <h3 className="font-semibold">Your cart is empty</h3>
              <p className="text-sm text-muted-foreground">
                Add some beautiful plants to get started
              </p>
            </div>
            <Button onClick={() => onOpenChange(false)} asChild>
              <Link href="/collections/indoor-plants">Start Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="flex h-full flex-col">
            <ScrollArea className="flex-1 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemCard key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="currency">{formatPrice(totalAmount)}</span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  asChild
                  disabled={isLoading || !items || items.length === 0}
                >
                  <Link href="/checkout" onClick={() => onOpenChange(false)}>
                    Checkout
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/cart" onClick={() => onOpenChange(false)}>
                    View Cart
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Shipping calculated at checkout
              </p>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
