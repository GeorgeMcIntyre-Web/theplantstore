"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Leaf,
  Home,
  TreePine,
  Flower,
  Wrench,
  BookOpen,
  User,
  LogIn,
  Settings,
} from "lucide-react";

interface MobileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileMenu({ open, onOpenChange }: MobileMenuProps) {
  const { data: session } = useSession();

  const menuItems = [
    {
      title: "Indoor Plants",
      href: "/collections/indoor-plants",
      icon: Leaf,
    },
    {
      title: "Outdoor Plants",
      href: "/collections/outdoor-plants",
      icon: TreePine,
    },
    {
      title: "Succulents",
      href: "/collections/succulents",
      icon: Flower,
    },
    {
      title: "Accessories",
      href: "/collections/accessories",
      icon: Wrench,
    },
    {
      title: "Plant Care",
      href: "/plant-care",
      icon: BookOpen,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            The House Plant Store
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <Link href="/" onClick={() => onOpenChange(false)}>
            <Button variant="ghost" className="w-full justify-start">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Button>
          </Link>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Shop
            </h3>
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
              >
                <Button variant="ghost" className="w-full justify-start">
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </div>

          <Separator />

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Account
            </h3>
            {session ? (
              <>
                <Link href="/account" onClick={() => onOpenChange(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </Button>
                </Link>
                {(session.user as any)?.role !== "CUSTOMER" && (
                  <Link href="/admin" onClick={() => onOpenChange(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/auth/signin" onClick={() => onOpenChange(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
