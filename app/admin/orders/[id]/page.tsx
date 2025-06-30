import { notFound } from "next/navigation";
import { UpdateOrderForm } from "@/components/admin/UpdateOrderForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

async function getOrder(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/admin/orders/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);
  if (!order) return notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order #{order.orderNumber}</CardTitle>
          <div className="text-sm text-muted-foreground">Placed on {new Date(order.createdAt).toLocaleString()}</div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <span className="font-semibold">Customer:</span> {order.user?.name || "-"} ({order.user?.email || "-"})
          </div>
          <div className="mb-4">
            <span className="font-semibold">Status:</span> <Badge>{order.status}</Badge>
          </div>
          <div className="mb-4">
            <span className="font-semibold">Total:</span> R{Number(order.totalAmount).toFixed(2)}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Tracking Number:</span> {order.trackingNumber || "-"}
          </div>
          <div className="mb-4">
            <span className="font-semibold">Order Items:</span>
            <ul className="list-disc ml-6">
              {order.items.map((item: any) => (
                <li key={item.id}>
                  {item.product?.name || "Unknown Product"} x {item.quantity} (R{Number(item.price).toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
          <UpdateOrderForm order={{ id: order.id, status: order.status, trackingNumber: order.trackingNumber }} />
        </CardContent>
      </Card>
    </div>
  );
} 