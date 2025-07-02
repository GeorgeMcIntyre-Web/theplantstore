"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DashboardControls from "@/components/admin/DashboardControls";
import SalesChart from "@/components/admin/SalesChart";
import CustomerGrowthChart from "@/components/admin/CustomerGrowthChart";
import TopProductsChart from "@/components/admin/TopProductsChart";
import RevenueBreakdownChart from "@/components/admin/RevenueBreakdownChart";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Activity, LineChart, ShieldAlert, Box, ShoppingCart, Users, Upload, Mail } from "lucide-react";
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

export default function AdminDashboard() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const [tab, setTab] = useState("overview");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 29),
    to: new Date(),
  });
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [suggestingPOs, setSuggestingPOs] = useState(false);

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
        if (data.products) {
          setLowStockProducts(
            data.products.filter((p: any) =>
              typeof p.stockQuantity === 'number' && typeof p.lowStockThreshold === 'number' && p.stockQuantity <= p.lowStockThreshold
            )
          );
        }
      });
  }, [dateRange]);

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
    <Tabs value={tab} onValueChange={setTab} className="flex flex-1 min-h-screen bg-background">
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
        <TabsList className="flex flex-col gap-2 bg-transparent p-0 shadow-none">
          <TabsTrigger value="overview" className="justify-start px-4 py-3 text-base gap-3"><LineChart className="w-5 h-5" /> Overview</TabsTrigger>
          <TabsTrigger value="products" className="justify-start px-4 py-3 text-base gap-3"><Box className="w-5 h-5" /> Products</TabsTrigger>
          <TabsTrigger value="categories" className="justify-start px-4 py-3 text-base gap-3"><Box className="w-5 h-5" /> Categories</TabsTrigger>
          <TabsTrigger value="orders" className="justify-start px-4 py-3 text-base gap-3"><ShoppingCart className="w-5 h-5" /> Orders</TabsTrigger>
          <TabsTrigger value="customers" className="justify-start px-4 py-3 text-base gap-3"><Users className="w-5 h-5" /> Customers</TabsTrigger>
          <TabsTrigger value="email" className="justify-start px-4 py-3 text-base gap-3"><Mail className="w-5 h-5" /> Email</TabsTrigger>
          <TabsTrigger value="importexport" className="justify-start px-4 py-3 text-base gap-3"><Upload className="w-5 h-5" /> Import/Export</TabsTrigger>
        </TabsList>
      </aside>
      <main className="flex-1 p-8">
        <div className="w-full">
          <TabsContent value="overview">
            {/* Onboarding/Welcome Message */}
            {session?.user && (
              <WelcomeAdminMessage name={session.user.name || "Admin"} role={userRole} />
            )}
            <DashboardControls dateRange={dateRange} onDateRangeChange={setDateRange} />
            {loading && <div className="p-4 text-center">Loading analytics...</div>}
            {error && <div className="p-4 text-center text-destructive">{error}</div>}
            {analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card rounded-lg p-6 shadow border">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><LineChart className="h-5 w-5" /> Sales & Orders</h2>
                  <SalesChart data={analytics.salesData} />
                </div>
                <div className="bg-card rounded-lg p-6 shadow border">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">Customer Growth</h2>
                  <CustomerGrowthChart data={analytics.customerGrowthData} />
                </div>
                <div className="bg-card rounded-lg p-6 shadow border">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">Top Products</h2>
                  <TopProductsChart data={analytics.topProductsData} />
                </div>
                <div className="bg-card rounded-lg p-6 shadow border">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">Revenue Breakdown</h2>
                  <RevenueBreakdownChart data={analytics.revenueByCategoryData} />
                </div>
                <div className="bg-card rounded-lg p-6 shadow border lg:col-span-2">
                  <h2 className="text-lg font-semibold mb-2 flex items-center gap-2"><Activity className="h-5 w-5" /> Recent Activity</h2>
                  <ul className="divide-y divide-muted">
                    {analytics.recentOrders.map((order: any) => (
                      <li key={order.id} className="py-2 flex flex-col md:flex-row md:items-center md:justify-between">
                        <span>Order <Link href={`/admin/orders/${order.id}`} className="text-primary underline">#{order.orderNumber}</Link> by {order.user?.name || "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Low Stock Widget */}
                <div className="bg-card rounded-lg p-6 shadow border mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold flex items-center gap-2">Low Stock Products</h2>
                    <Button size="sm" onClick={handleSuggestPOs} disabled={suggestingPOs}>
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
                            <td className="p-2">{p.lowStockThreshold}</td>
                            <td className="p-2">
                              <Link href={`/admin/purchase-orders/new?productId=${p.id}&quantity=${Math.max(1, p.lowStockThreshold - p.stockQuantity + 1)}`}>
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
          </TabsContent>

          <TabsContent value="products">
            <div className="bg-card rounded-lg p-6 shadow border">
              <h2 className="text-lg font-semibold mb-4">Product Management</h2>
              <ProductsPage />
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="bg-card rounded-lg p-6 shadow border">
              <h2 className="text-lg font-semibold mb-4">Category Management</h2>
              <CategoryManagement />
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-card rounded-lg p-6 shadow border">
              <h2 className="text-lg font-semibold mb-4">Order Management</h2>
              {/* Order management UI here */}
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <div className="bg-card rounded-lg p-6 shadow border">
              <h2 className="text-lg font-semibold mb-4">Customer Management</h2>
              <CustomerManagement />
            </div>
          </TabsContent>

          <TabsContent value="email">
            <EmailManagement />
          </TabsContent>

          <TabsContent value="importexport">
            <div className="bg-card rounded-lg p-6 shadow border">
              <h2 className="text-lg font-semibold mb-4">Import / Export</h2>
              {/* Import/Export actions and UI start */}
              <ImportExportActions />
              {/* Import/Export actions and UI end */}
            </div>
          </TabsContent>
        </div>
      </main>
    </Tabs>
  );
}

function WelcomeAdminMessage({ name, role }: { name: string; role: string }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="mb-6 p-4 rounded-lg bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 flex items-start gap-4 relative shadow">
      <ShieldAlert className="w-6 h-6 text-green-600 dark:text-green-300 mt-1" />
      <div>
        <div className="font-semibold text-lg mb-1">Welcome, {name}!</div>
        <div className="text-sm text-muted-foreground mb-1">You are logged in as <span className="font-medium text-green-700 dark:text-green-200">{role}</span>.</div>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          <li>Use the tabs on the left to manage products, customers, orders, and import/export data.</li>
          <li>Check analytics and recent activity in the Overview tab.</li>
          <li>Need help? See the admin guide or contact support.</li>
        </ul>
      </div>
      <button
        className="absolute top-2 right-2 text-green-700 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100 text-lg"
        aria-label="Dismiss welcome message"
        onClick={() => setDismissed(true)}
      >
        ×
      </button>
    </div>
  );
}
