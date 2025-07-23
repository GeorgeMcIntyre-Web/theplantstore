"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaymentForm } from '@/components/checkout/payment-form';
import { useCart } from '@/hooks/use-cart';
import { useSession } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';

const SA_PROVINCES = [
  'GAUTENG',
  'WESTERN_CAPE', 
  'KWAZULU_NATAL',
  'EASTERN_CAPE',
  'LIMPOPO',
  'MPUMALANGA',
  'NORTH_WEST',
  'NORTHERN_CAPE',
  'FREE_STATE'
];

export default function CheckoutPage() {
  const { data: session } = useSession();
  const { items, totalAmount } = useCart();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [customerDetails, setCustomerDetails] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
  });
  const [shippingDetails, setShippingDetails] = useState({
    address: '',
    city: '',
    province: '',
    postalCode: '',
  });

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all customer details',
        variant: 'destructive',
      });
      return;
    }
    setStep(2);
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingDetails.address || !shippingDetails.city || !shippingDetails.province || !shippingDetails.postalCode) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all shipping details',
        variant: 'destructive',
      });
      return;
    }
    setStep(3);
  };

  const handlePaymentSuccess = (paymentData: any) => {
    toast({
      title: 'Payment Successful!',
      description: `Order ${paymentData.orderNumber} has been placed successfully.`,
    });
    router.push(`/order-confirmation/${paymentData.orderNumber}`);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: 'Payment Failed',
      description: error,
      variant: 'destructive',
    });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md">
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-4">Add some plants to your cart to proceed with checkout.</p>
              <Button onClick={() => router.push('/collections')}>
                Shop Plants
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>
          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                3
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Step 1: Customer Details */}
              {step === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCustomerSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={customerDetails.name}
                          onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={customerDetails.email}
                          onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+27 XX XXX XXXX"
                          value={customerDetails.phone}
                          onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Continue to Shipping
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Shipping Details */}
              {step === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleShippingSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          value={shippingDetails.address}
                          onChange={(e) => setShippingDetails({...shippingDetails, address: e.target.value})}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={shippingDetails.city}
                            onChange={(e) => setShippingDetails({...shippingDetails, city: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            value={shippingDetails.postalCode}
                            onChange={(e) => setShippingDetails({...shippingDetails, postalCode: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="province">Province</Label>
                        <Select value={shippingDetails.province} onValueChange={(value) => setShippingDetails({...shippingDetails, province: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                          <SelectContent>
                            {SA_PROVINCES.map((province) => (
                              <SelectItem key={province} value={province}>
                                {province.replace('_', ' ')}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-4">
                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-full">
                          Back
                        </Button>
                        <Button type="submit" className="w-full">
                          Continue to Payment
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment */}
              {step === 3 && (
                <div className="space-y-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep(2)}
                    className="mb-4"
                  >
                    ← Back to Shipping
                  </Button>
                  <PaymentForm
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                    customerDetails={customerDetails}
                    shippingDetails={shippingDetails}
                  />
                </div>
              )}
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                        🌱
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">R{(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>R{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{totalAmount >= 500 ? 'Free' : 'R85.00'}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>R{(totalAmount + (totalAmount >= 500 ? 0 : 85)).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {totalAmount < 500 && (
                    <p className="text-sm text-muted-foreground">
                      Add R{(500 - totalAmount).toFixed(2)} more for free shipping!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 