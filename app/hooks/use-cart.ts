
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { CartItemWithProduct } from '@/lib/types'
import { toast } from '@/hooks/use-toast'

interface CartHook {
  items: CartItemWithProduct[]
  itemCount: number
  totalAmount: number
  isLoading: boolean
  addItem: (productId: string, quantity?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  refreshCart: () => Promise<void>
}

export function useCart(): CartHook {
  const { data: session } = useSession()
  const [items, setItems] = useState<CartItemWithProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const totalAmount = items.reduce((total, item) => total + (item.product.price * item.quantity), 0)

  // Fetch cart items
  const refreshCart = async () => {
    if (!session?.user) {
      setItems([])
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        setItems(data.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Add item to cart
  const addItem = async (productId: string, quantity = 1) => {
    if (!session?.user) {
      toast({
        title: 'Please sign in',
        description: 'You need to sign in to add items to cart',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, quantity }),
      })

      if (response.ok) {
        await refreshCart()
        toast({
          title: 'Added to cart',
          description: 'Item has been added to your cart',
        })
      } else {
        throw new Error('Failed to add item')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, quantity }),
      })

      if (response.ok) {
        await refreshCart()
      } else {
        throw new Error('Failed to update quantity')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update quantity',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Remove item from cart
  const removeItem = async (itemId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      })

      if (response.ok) {
        await refreshCart()
        toast({
          title: 'Removed from cart',
          description: 'Item has been removed from your cart',
        })
      } else {
        throw new Error('Failed to remove item')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Clear cart
  const clearCart = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/cart/clear', {
        method: 'POST',
      })

      if (response.ok) {
        setItems([])
      } else {
        throw new Error('Failed to clear cart')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load cart on session change
  useEffect(() => {
    refreshCart()
  }, [session])

  return {
    items,
    itemCount,
    totalAmount,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  }
}
