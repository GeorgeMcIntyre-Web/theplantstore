"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, Truck } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  trackingNumber?: string;
  user: { name: string; email: string };
  shippingAddress: ShippingAddress | null;
}

export function ShippingManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingShipment, setCreatingShipment] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders?status=CONFIRMED,PROCESSING');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const createShipment = async (orderId: string, courier: string, service: string) => {
    setCreatingShipment(orderId);

    try {
      const response = await fetch('/api/shipping/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          courier,
          service,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Shipment Created',
          description: `Tracking number: ${data.trackingNumber}`,
        });
        fetchOrders(); // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to create shipment');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create shipment',
        variant: 'destructive',
      });
    } finally {
      setCreatingShipment(null);
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders ready for shipping
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-muted-foreground">
                        {order.user.name} - {order.user.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={order.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {order.status}
                      </Badge>
                      <p className="font-semibold mt-1">R{Number(order.totalAmount).toFixed(2)}</p>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="mb-4 p-3 bg-muted rounded-md">
                      <h4 className="font-medium mb-1">Shipping Address:</h4>
                      <p className="text-sm">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p className="text-sm">{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && (
                        <p className="text-sm">{order.shippingAddress.addressLine2}</p>
                      )}
                      <p className="text-sm">
                        {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm">{order.shippingAddress.phone}</p>
                    </div>
                  )}

                  {order.trackingNumber ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-md">
                      <Package className="h-4 w-4 text-green-600" />
                      <span className="text-sm">
                        Tracking: <span className="font-mono">{order.trackingNumber}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Select
                        onValueChange={(value) => {
                          const [courier, service] = value.split('|');
                          createShipment(order.id, courier, service);
                        }}
                        disabled={creatingShipment === order.id}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select shipping option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="The Courier Guy|Economy Service">
                            The Courier Guy - Economy Service
                          </SelectItem>
                          <SelectItem value="The Courier Guy|Overnight Service">
                            The Courier Guy - Overnight Service
                          </SelectItem>
                          <SelectItem value="Aramex|Standard Delivery">
                            Aramex - Standard Delivery
                          </SelectItem>
                          <SelectItem value="PostNet|Standard Delivery">
                            PostNet - Standard Delivery
                          </SelectItem>
                          <SelectItem value="Local Delivery|Next Day Delivery">
                            Local Delivery - Next Day
                          </SelectItem>
                          <SelectItem value="Local Delivery|Same Day Delivery">
                            Local Delivery - Same Day
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {creatingShipment === order.id && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          Creating shipment...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 