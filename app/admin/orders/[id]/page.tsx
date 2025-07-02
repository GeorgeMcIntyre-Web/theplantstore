import { notFound, useRouter } from "next/navigation";
import { UpdateOrderForm } from "@/components/admin/UpdateOrderForm";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

async function getOrder(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/admin/orders/${id}`,
    { cache: "no-store" }
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function OrderDetailsPage({ params }: { params: unknown }) {
  const router = useRouter();
  const order = await getOrder(params as string);
  if (!order) return notFound();

  return (
    <div className="w-full h-full flex flex-col p-4">
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/admin/orders");
            }
          }}
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </button>
        <h1 className="text-2xl font-bold ml-2">Order Details</h1>
      </div>
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
              {order.items.map((item: unknown) => {
                const i = item as { id: string; product?: { name?: string }; quantity: number; price: number };
                return (
                  <li key={i.id}>
                    {i.product?.name || "Unknown Product"} x {i.quantity} (R{Number(i.price).toFixed(2)})
                  </li>
                );
              })}
            </ul>
          </div>
          <UpdateOrderForm order={{ id: order.id, status: order.status, trackingNumber: order.trackingNumber }} />
        </CardContent>
      </Card>
    </div>
  );
} 