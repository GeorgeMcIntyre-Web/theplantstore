"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Lock } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

declare global {
  interface Window {
    YocoSDK: any;
  }
}

interface PaymentFormProps {
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  shippingDetails: {
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
}

export function PaymentForm({ 
  onPaymentSuccess, 
  onPaymentError, 
  customerDetails, 
  shippingDetails 
}: PaymentFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [yocoSDK, setYocoSDK] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const { items, totalAmount } = useCart();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://js.yoco.com/sdk/v1/yoco-sdk-web.js';
    script.async = true;
    script.onload = () => {
      const sdk = new window.YocoSDK({
        publicKey: process.env.NEXT_PUBLIC_YOCO_PUBLIC_KEY,
      });
      setYocoSDK(sdk);
    };
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async () => {
    if (!yocoSDK) {
      setError('Payment system not ready. Please try again.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create payment token with Yoco
      const { error: tokenError, token } = await yocoSDK.showPopup({
        amountInCents: Math.round(totalAmount * 100), // Convert to cents
        currency: 'ZAR',
        name: 'The House Plant Store',
        description: `Order for ${items.length} item(s)`,
        metadata: {
          customerEmail: customerDetails.email,
          customerName: customerDetails.name,
          orderItems: items.length,
        },
      });

      if (tokenError) {
        throw new Error(tokenError.message);
      }

      if (!token) {
        setIsLoading(false);
        return; // User cancelled
      }

      // Process payment on backend
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token.id,
          amount: totalAmount,
          customerDetails,
          shippingDetails,
          items: items.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Payment failed');
      }

      onPaymentSuccess(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Summary */}
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-semibold mb-2">Order Summary</h4>
          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.product.name} x {item.quantity}</span>
                <span>R{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 font-semibold flex justify-between">
              <span>Total:</span>
              <span>R{totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Details Review */}
        <div className="space-y-3">
          <h4 className="font-semibold">Customer Details</h4>
          <div className="text-sm space-y-1">
            <p><strong>Name:</strong> {customerDetails.name}</p>
            <p><strong>Email:</strong> {customerDetails.email}</p>
            <p><strong>Phone:</strong> {customerDetails.phone}</p>
          </div>
        </div>

        {/* Shipping Details Review */}
        <div className="space-y-3">
          <h4 className="font-semibold">Shipping Address</h4>
          <div className="text-sm space-y-1">
            <p>{shippingDetails.address}</p>
            <p>{shippingDetails.city}, {shippingDetails.province}</p>
            <p>{shippingDetails.postalCode}</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Security Notice */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Your payment is secured by Yoco with 256-bit SSL encryption</span>
        </div>

        {/* Payment Button */}
        <Button 
          onClick={handlePayment} 
          disabled={isLoading || !yocoSDK}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="spinner mr-2" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay R{totalAmount.toFixed(2)} with Card
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By completing your purchase, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardContent>
    </Card>
  );
} 