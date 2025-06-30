import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  totalAmount: number;
  items: { product: { name: string }; quantity: number }[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <h1 className="text-3xl font-bold mb-8">My Orders</h1>
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : orders.length === 0 ? (
                <p>You have no orders yet.</p>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr>
                      <th className="py-2">Order #</th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t">
                        <td className="py-2">{order.orderNumber}</td>
                        <td className="py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-2">{order.status}</td>
                        <td className="py-2">R{order.totalAmount.toFixed(2)}</td>
                        <td className="py-2">
                          {order.items.map((item, idx) => (
                            <span key={idx}>{item.product.name} x {item.quantity}{idx < order.items.length - 1 ? ", " : ""}</span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
} 