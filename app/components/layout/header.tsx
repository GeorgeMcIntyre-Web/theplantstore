
'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { ShoppingCart, User, Search, Menu, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NavigationMenu } from '@/components/layout/navigation-menu'
import { CartSheet } from '@/components/cart/cart-sheet'
import { SearchDialog } from '@/components/search/search-dialog'
import { UserMenu } from '@/components/layout/user-menu'
import { MobileMenu } from '@/components/layout/mobile-menu'
import { useCart } from '@/hooks/use-cart'
import { useState } from 'react'

export function Header() {
  const { data: session } = useSession()
  const { itemCount } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary">The House Plant Store</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <NavigationMenu />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex"
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* User Menu */}
            {session ? (
              <UserMenu />
            ) : (
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCartOpen(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen} />

      {/* Cart Sheet */}
      <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />

      {/* Search Dialog */}
      <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </header>
  )
}
