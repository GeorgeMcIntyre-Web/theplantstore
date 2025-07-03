"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ReactNode } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LineChart, Box, ShoppingCart, Users, Upload, Mail, Package, Layers } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-muted/40 border-r flex flex-col py-8 px-4 gap-2">
        <Link href="/" className="mb-6">
          <button className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 transition font-semibold">← Back to Website</button>
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <Avatar>
            {session?.user?.image && <AvatarImage src={session.user.image} alt={session.user.name || "Admin"} />}
            <AvatarFallback>{session?.user?.name?.[0] || "A"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-lg">{session?.user?.name || "Admin"}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              {userRole ? <Badge variant="destructive">{userRole}</Badge> : <span>Not Assigned</span>}
            </div>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><LineChart className="w-5 h-5" /> Overview</Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Box className="w-5 h-5" /> Products</Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Layers className="w-5 h-5" /> Categories</Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><ShoppingCart className="w-5 h-5" /> Orders</Link>
          <Link href="/admin/purchase-orders" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Package className="w-5 h-5" /> Purchase Orders</Link>
          <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Users className="w-5 h-5" /> Customers</Link>
          <Link href="/admin/email" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Mail className="w-5 h-5" /> Email</Link>
          <Link href="/admin/importexport" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Upload className="w-5 h-5" /> Import/Export</Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 px-4 py-3 mt-2 rounded hover:bg-accent transition text-base text-primary font-medium">
            <span><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></span>
            Notifications
          </Link>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
} 