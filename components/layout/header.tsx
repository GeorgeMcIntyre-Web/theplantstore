"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShoppingCart, User, Search, Menu, Leaf, Bell, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NavigationMenu } from "@/components/layout/navigation-menu";
import { CartSheet } from "@/components/cart/cart-sheet";
import { SearchDialog } from "@/components/search/search-dialog";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { useNotifications } from "@/hooks/use-notifications";

export function Header() {
  const { data: session } = useSession();
  const { itemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userId = session?.user?.id;
  const userRole = session?.user?.role;
  const isAdmin = userRole === "SUPER_ADMIN" || userRole === "PLANT_MANAGER";
  const { notifications, isLoading, markAsRead, refetch } = useNotifications(isAdmin ? userId : undefined);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [showNotifications, setShowNotifications] = useState(false);

  const markAllAsRead = async () => {
    await Promise.all(notifications.filter(n => !n.read).map(n => markAsRead(n.id)));
    refetch();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return <ShoppingCart className="h-4 w-4 text-green-600" />;
      case "po-draft": return <FileText className="h-4 w-4 text-yellow-600" />;
      case "po-approved": return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case "low-stock": return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Bell className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary">
              The House Plant Store
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <NavigationMenu />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Notification Bell (Admin only) */}
            {isAdmin && (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotifications((v) => !v)}
                  className="relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                  <span className="sr-only">Notifications</span>
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                    <div className="flex items-center justify-between p-2 font-semibold border-b">
                      <span>Notifications</span>
                      {unreadCount > 0 && (
                        <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">No notifications</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className={`flex items-start gap-2 p-2 border-b last:border-b-0 ${!n.read ? 'bg-gray-100' : ''}`}>
                          <span className="mt-1">{getIcon(n.type)}</span>
                          <div className="flex-1">
                            {n.link ? (
                              <Link href={n.link} className="font-medium hover:underline" onClick={() => markAsRead(n.id)}>
                                {n.message}
                              </Link>
                            ) : (
                              <span>{n.message}</span>
                            )}
                            <div className="text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                          {!n.read && (
                            <Button size="icon" variant="ghost" onClick={() => markAsRead(n.id)} title="Mark as read">
                              <span className="sr-only">Mark as read</span>
                              ●
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
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
  );
}
