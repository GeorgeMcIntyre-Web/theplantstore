"use client";

import { useEffect, useState } from "react";
import DashboardControls from "@/components/admin/DashboardControls";
import SalesChart from "@/components/admin/SalesChart";
import CustomerGrowthChart from "@/components/admin/CustomerGrowthChart";
import TopProductsChart from "@/components/admin/TopProductsChart";
import RevenueBreakdownChart from "@/components/admin/RevenueBreakdownChart";
import { Activity, LineChart } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { subDays } from "date-fns";
import { DateRange } from "react-day-picker";
import ImportExportActions from "@/components/admin/ImportExportActions";
import { EmailManagement } from "@/components/admin/email-management";
import ProductsPage from '@/app/admin/products/page';
import CategoryManagement from '@/components/admin/CategoryManagement';
import CustomerManagement from '@/components/admin/CustomerManagement';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsData {
  salesData: any;
  customerGrowthData: any;
  topProductsData: any;
  revenueByCategoryData: any;
  recentOrders: any[];
}

interface Product {
  id: string;
  name: string;
  stockQuantity: number;
  effectiveLowStockThreshold: number;
}

function CardSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-lg p-6 shadow border">
      <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">{icon}{title}</h2>
      {children}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-48 w-full mb-4" />
      ))}
      <Skeleton className="h-32 w-full lg:col-span-2" />
      <Skeleton className="h-32 w-full mt-8" />
    </div>
  );
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [suggestingPOs, setSuggestingPOs] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    if (!dateRange.from || !dateRange.to) {
      setAnalytics(null);
      setLoading(false);
      return;
    }
    fetch(`/api/admin/analytics?from=${dateRange.from.toISOString().slice(0,10)}&to=${dateRange.to.toISOString().slice(0,10)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setAnalytics(data);
      })
      .catch((_) => setError("Failed to fetch analytics"))
      .finally(() => setLoading(false));

    // Fetch low stock products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setLowStockProducts(
            data.filter((p: Product) =>
              typeof p.stockQuantity === 'number' && typeof p.effectiveLowStockThreshold === 'number' && p.stockQuantity <= p.effectiveLowStockThreshold
            )
          );
        }
      });
  }, [dateRange, retryCount]);

  // Suggest POs handler
  const handleSuggestPOs = async () => {
    setSuggestingPOs(true);
    try {
      const res = await fetch("/api/admin/purchase-orders/auto-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: session?.user?.id }),
      });
      const data = await res.json();
      toast({
        title: data.created > 0 ? `Created ${data.created} draft POs` : "No new POs needed",
        description: data.created > 0 ? "Review and approve in Purchase Orders." : undefined,
      });
      // Optionally, refresh low stock products or notifications here
    } catch (e) {
      toast({ title: "Error", description: "Failed to suggest POs", variant: "destructive" });
    } finally {
      setSuggestingPOs(false);
    }
  };

  return (
    <div className="w-full">
      {/* Onboarding/Welcome Message */}
      {session?.user && (
        <WelcomeAdminMessage name={session.user.name || "Admin"} role={userRole} />
      )}
      {/* Onboarding tip for empty analytics or first visit */}
      {!loading && !error && (!analytics || (analytics && Object.values(analytics).every(val => Array.isArray(val) && val.length === 0))) && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-lg p-4 mb-6">
          <div className="font-semibold mb-1">Welcome to your Admin Dashboard!</div>
          <div className="text-sm">
            {userRole === 'SUPER_ADMIN' && (
              <>As a <b>Super Admin</b>, you have full access to manage products, orders, users, and all settings. Use the sidebar to explore features. Need help? See the admin guide or contact support.</>
            )}
            {userRole === 'FINANCIAL_MANAGER' && (
              <>As a <b>Financial Manager</b>, you can view analytics, manage expenses, and run reports. Use the sidebar to access accounting features. Need help? See the admin guide or contact support.</>
            )}
            {!userRole && (
              <>Use the sidebar to explore admin features. Need help? See the admin guide or contact support.</>
            )}
          </div>
        </div>
      )}
      <DashboardControls dateRange={dateRange} onDateRangeChange={setDateRange} />
      {loading && <AnalyticsSkeleton />}
      {error && (
        <div className="p-4 text-center text-destructive" role="alert" aria-live="assertive">
          {error}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setRetryCount((c) => c + 1)}>
              Retry
            </Button>
          </div>
        </div>
      )}
      {!loading && !error && analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CardSection title="Sales & Orders" icon={<LineChart className="h-5 w-5" />}>
            <SalesChart data={analytics.salesData} />
          </CardSection>
          <CardSection title="Customer Growth">
            <CustomerGrowthChart data={analytics.customerGrowthData} />
          </CardSection>
          <CardSection title="Top Products">
            <TopProductsChart data={analytics.topProductsData} />
          </CardSection>
          <CardSection title="Revenue Breakdown">
            <RevenueBreakdownChart data={analytics.revenueByCategoryData} />
          </CardSection>
          <CardSection title="Recent Activity" icon={<Activity className="h-5 w-5" />}>
            {analytics.recentOrders.length === 0 ? (
              <div className="text-muted-foreground">No recent orders.</div>
            ) : (
              <ul className="divide-y divide-muted">
                {analytics.recentOrders.map((order: any) => (
                  <li key={order.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                    <span>Order <Link href={`/admin/orders/${order.id}`} className="text-primary underline">#{order.orderNumber}</Link> by {order.user?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardSection>
          {/* Low Stock Widget */}
          <div className="bg-card rounded-lg p-6 shadow border mt-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">Low Stock Products</h2>
              <Button size="sm" onClick={handleSuggestPOs} disabled={suggestingPOs} aria-busy={suggestingPOs}>
                {suggestingPOs ? "Suggesting..." : "Suggest POs"}
              </Button>
            </div>
            {lowStockProducts.length === 0 ? (
              <div className="text-muted-foreground">No products are low in stock.</div>
            ) : (
              <table className="min-w-full border mb-2">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left">Product</th>
                    <th className="p-2 text-left">Stock</th>
                    <th className="p-2 text-left">Threshold</th>
                    <th className="p-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id} className="border-b">
                      <td className="p-2">{p.name}</td>
                      <td className="p-2">{p.stockQuantity}</td>
                      <td className="p-2">{p.effectiveLowStockThreshold}</td>
                      <td className="p-2">
                        <Link href={`/admin/purchase-orders/new?productId=${p.id}&quantity=${Math.max(1, p.effectiveLowStockThreshold - p.stockQuantity + 1)}`}>
                          <Button size="sm">Create PO</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function WelcomeAdminMessage({ name, role }: { name: string; role: string }) {
  return (
    <div className="bg-green-100 border border-green-300 text-green-900 rounded-lg p-4 mb-6 flex items-center justify-between">
      <div>
        <div className="font-bold text-lg mb-1">Welcome, {name}!</div>
        <div className="text-sm">
          You are logged in as <span className="font-semibold uppercase">{role}</span>.<br />
          <ul className="list-disc ml-6 mt-2">
            <li>Use the tabs on the left to manage products, customers, orders, and import/export data.</li>
            <li>Check analytics and recent activity in the Overview tab.</li>
            <li>Need help? See the admin guide or contact support.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
