"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CartItemWithProduct, Product } from "@/lib/types";
import { toast } from "@/hooks/use-toast";

interface CartHook {
  items: CartItemWithProduct[];
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  addItem: (productId: string, quantity?: number, product?: Product) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartHook | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  const refreshCart = async () => {
    if (!session?.user) {
      setItems([]);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = async (productId: string, quantity = 1, product?: Product) => {
    if (!session?.user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }
    const prevItems = [...items];
    let updated = false;
    const newItems = items.map(item => {
      if (item.product.id === productId) {
        updated = true;
        return { ...item, quantity: item.quantity + quantity };
      }
      return item;
    });
    let optimisticProduct = product || {
      id: productId,
      name: "(Adding...)",
      slug: "",
      description: "",
      shortDescription: "",
      price: 0,
      compareAtPrice: 0,
      sku: "",
      stockQuantity: 1,
      lowStockThreshold: 1,
      weight: 0,
      dimensions: "",
      isActive: true,
      isFeatured: false,
      sortOrder: 0,
      careLevel: null,
      lightRequirement: null,
      wateringFrequency: null,
      isPetSafe: null,
      plantSize: null,
      growthRate: null,
      careInstructions: "",
      metaTitle: "",
      metaDescription: "",
      createdAt: new Date(),
      updatedAt: new Date(),
      categoryId: "",
      category: {
        id: "",
        name: "",
        slug: "",
        isActive: true,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        children: [],
        products: [],
      },
      images: [],
      reviews: [],
    };
    let optimisticItems = updated
      ? newItems
      : [
          ...items,
          {
            id: Math.random().toString(36),
            userId: session.user.id || "optimistic-user",
            productId: productId,
            quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
            product: optimisticProduct,
          },
        ];
    setItems(optimisticItems);
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });
      if (response.ok) {
        await refreshCart();
        toast({
          title: "Added to cart",
          description: "Item has been added to your cart",
        });
      } else {
        setItems(prevItems);
        throw new Error("Failed to add item");
      }
    } catch (error) {
      setItems(prevItems);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const prevItems = [...items];
    const optimisticItems = items.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    setItems(optimisticItems);
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, quantity }),
      });
      if (response.ok) {
        await refreshCart();
      } else {
        setItems(prevItems);
        throw new Error("Failed to update quantity");
      }
    } catch (error) {
      setItems(prevItems);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: string) => {
    const prevItems = [...items];
    const optimisticItems = items.filter(item => item.id !== itemId);
    setItems(optimisticItems);
    setIsLoading(true);
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId }),
      });
      if (response.ok) {
        await refreshCart();
        toast({
          title: "Removed from cart",
          description: "Item has been removed from your cart",
        });
      } else {
        setItems(prevItems);
        throw new Error("Failed to remove item");
      }
    } catch (error) {
      setItems(prevItems);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/cart/clear", {
        method: "POST",
      });
      if (response.ok) {
        setItems([]);
      } else {
        throw new Error("Failed to clear cart");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        isLoading,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartHook {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}