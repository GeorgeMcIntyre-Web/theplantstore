import Link from "next/link";
import { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-56 min-h-screen bg-muted/40 border-r flex flex-col py-8 px-4 gap-2">
        <Link href="/admin" className="mb-6">
          <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg text-lg font-bold hover:bg-green-700 transition">← Back to Dashboard</button>
        </Link>
        <nav className="flex flex-col gap-2 mt-4">
          <Link href="/admin/products" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Products</Link>
          <Link href="/admin/categories" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Categories</Link>
          <Link href="/admin/orders" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Orders</Link>
          <Link href="/admin/customers" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Customers</Link>
          <Link href="/admin/notifications" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Notifications</Link>
          <Link href="/admin/purchase-orders" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Purchase Orders</Link>
          <Link href="/admin/suppliers" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Suppliers</Link>
          <Link href="/admin/users" className="py-2 px-4 rounded hover:bg-primary/10 font-medium">Users</Link>
          <Link href="/admin/products/import" className="py-2 px-4 rounded bg-primary/10 font-semibold text-primary">Import Products</Link>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
} 