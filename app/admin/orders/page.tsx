// app/admin/orders/[id]/page.tsx - MISSING ORDER DETAILS PAGE
export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

async function getOrders(page: number, pageSize: number, status?: string, customer?: string) {
  const where: any = {};
  if (status) where.status = status;
  if (customer) {
    where.user = {
      OR: [
        { name: { contains: customer, mode: "insensitive" } },
        { email: { contains: customer, mode: "insensitive" } },
      ],
    };
  }
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total };
}

export default async function OrdersListPage({ searchParams }: { searchParams: { page?: string, pageSize?: string, status?: string, customer?: string } }) {
  const page = Number(searchParams?.page) || 1;
  const pageSize = Number(searchParams?.pageSize) || 10;
  const status = searchParams?.status || "";
  const customer = searchParams?.customer || "";
  let orders: any[] = [];
  let total = 0;
  let error = null;
  try {
    const result = await getOrders(page, pageSize, status, customer);
    orders = result.orders;
    total = result.total;
  } catch (e) {
    error = "Failed to load orders.";
  }
  const totalPages = Math.ceil(total / pageSize);

  function buildQuery(newParams: Record<string, string | number>) {
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
      status,
      customer,
      ...newParams,
    });
    return `?${params.toString()}`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <form
        className="flex flex-wrap gap-4 mb-4"
        action="/admin/orders"
        method="get"
        suppressHydrationWarning
      >
        <select
          name="status"
          defaultValue={status}
          className="border rounded px-2 py-1"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
          ))}
        </select>
        <input
          type="text"
          name="customer"
          placeholder="Customer name or email"
          defaultValue={customer}
          className="border rounded px-2 py-1"
        />
        <button type="submit" className="px-4 py-1 bg-primary text-white rounded">Filter</button>
      </form>
      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-500">{error}</div>
          ) : orders.length === 0 ? (
            <div>No orders found.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left">Order #</th>
                      <th className="px-4 py-2 text-left">Customer</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Total</th>
                      <th className="px-4 py-2 text-left">Created</th>
                      <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="px-4 py-2">{order.orderNumber}</td>
                        <td className="px-4 py-2">{order.user?.name || "-"}</td>
                        <td className="px-4 py-2">
                          <Badge>{order.status}</Badge>
                        </td>
                        <td className="px-4 py-2">R{Number(order.totalAmount).toFixed(2)}</td>
                        <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2">
                          <Link href={`/admin/orders/${order.id}`} className="text-primary underline">
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <a
                  href={buildQuery({ page: page - 1 })}
                  className={`px-4 py-2 bg-gray-200 rounded ${page <= 1 ? "opacity-50 pointer-events-none" : ""}`}
                  aria-disabled={page <= 1}
                >
                  Previous
                </a>
                <span>Page {page} of {totalPages}</span>
                <a
                  href={buildQuery({ page: page + 1 })}
                  className={`px-4 py-2 bg-gray-200 rounded ${page >= totalPages ? "opacity-50 pointer-events-none" : ""}`}
                  aria-disabled={page >= totalPages}
                >
                  Next
                </a>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
