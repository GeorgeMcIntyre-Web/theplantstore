import { notFound } from 'next/navigation';
import { getPrismaClient } from '@/lib/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface OrderConfirmationPageProps {
  params: { orderNumber: string };
}

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const { orderNumber } = params;

  try {
    const prisma = getPrismaClient();
    
    // Fetch order details from the database
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      return notFound();
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <Card className="w-full max-w-xl">
          <CardHeader>
            <CardTitle>Thank you for your purchase!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold text-green-700">Your order <span className="font-mono">{order.orderNumber}</span> has been placed successfully.</p>
            <div>
              <h4 className="font-semibold mb-2">Order Summary</h4>
              <ul className="text-sm space-y-1">
                {order.items.map((item: any) => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.productName} x {item.quantity}</span>
                    <span>R{(Number(item.price) * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
                <li className="border-t pt-2 font-semibold flex justify-between">
                  <span>Total:</span>
                  <span>R{Number(order.totalAmount).toFixed(2)}</span>
                </li>
              </ul>
            </div>
            {order.shippingAddress && (
              <div>
                <h4 className="font-semibold mb-2">Shipping Address</h4>
                <p className="text-sm">
                  {order.shippingAddress.addressLine1}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.province}<br />
                  {order.shippingAddress.postalCode}
                </p>
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              You will receive an email confirmation with your order details. If you have any questions, please <Link href="/contact" className="underline">contact us</Link>.
            </div>
            <Button asChild className="w-full mt-2">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error('Error fetching order:', error);
    return notFound();
  }
} 