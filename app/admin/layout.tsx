"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { ReactNode } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LineChart, Box, ShoppingCart, Users, Upload, Mail, Package, Layers, Truck, Activity, BarChart3, Settings, Bell } from "lucide-react";
import QuickCalculator from '@/components/ui/quick-calculator';

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
        <QuickCalculator />
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><LineChart className="w-5 h-5" /> Overview</Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Box className="w-5 h-5" /> Products</Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Layers className="w-5 h-5" /> Categories</Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><ShoppingCart className="w-5 h-5" /> Orders</Link>
          <Link href="/admin/purchase-orders" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Package className="w-5 h-5" /> Purchase Orders</Link>
          <Link href="/admin/suppliers" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Truck className="w-5 h-5" /> Suppliers</Link>
          <Link href="/admin/customers" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Users className="w-5 h-5" /> Customers</Link>
          <Link href="/admin/email" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Mail className="w-5 h-5" /> Email</Link>
          <Link href="/admin/importexport" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Upload className="w-5 h-5" /> Import/Export</Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Settings className="w-5 h-5" /> Settings</Link>
          <Link href="/admin/notifications" className="flex items-center gap-3 px-4 py-3 mt-2 rounded hover:bg-accent transition text-base text-primary font-medium">
            <Bell className="w-5 h-5" />
            Notifications
          </Link>
          {/* Accounting Section - RBAC */}
          {(userRole === 'FINANCIAL_MANAGER' || userRole === 'ACCOUNTANT' || userRole === 'SUPER_ADMIN') && (
            <>
              <div className="mt-4 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accounting</div>
              <Link href="/admin/accounting" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><LineChart className="w-5 h-5" /> Dashboard</Link>
              <Link href="/admin/accounting/expenses" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Box className="w-5 h-5" /> Expenses</Link>
              <Link href="/admin/accounting/categories" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Layers className="w-5 h-5" /> Categories</Link>
              <Link href="/admin/accounting/reports" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><BarChart3 className="w-5 h-5" /> Reports</Link>
              <Link href="/admin/accounting/audit-logs" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Activity className="w-5 h-5" /> Audit Logs</Link>
              <Link href="/admin/accounting/bank-feed" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Box className="w-5 h-5" /> Bank Accounts</Link>
              <Link href="/admin/accounting/bank-transactions" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><Activity className="w-5 h-5" /> Bank Transactions</Link>
              <Link href="/admin/accounting/reconciliation" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-accent transition text-base font-medium"><BarChart3 className="w-5 h-5" /> Reconciliation</Link>
            </>
          )}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
} 