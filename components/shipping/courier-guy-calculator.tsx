"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Clock, Shield, Star } from 'lucide-react';
import { ShippingRate } from '@/lib/shipping/shipping-service';

interface CourierGuyCalculatorProps {
  cartItems: any[];
  cartTotal: number;
  onShippingSelected: (rate: ShippingRate) => void;
  selectedRate?: ShippingRate;
  deliveryAddress: any;
}

export function CourierGuyCalculator({ 
  cartItems, 
  cartTotal, 
  onShippingSelected, 
  selectedRate,
  deliveryAddress 
}: CourierGuyCalculatorProps) {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (deliveryAddress && cartItems && cartItems.length > 0) {
      calculateRates();
    }
  }, [deliveryAddress, cartItems]);

  const calculateRates = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: deliveryAddress,
          items: cartItems.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            weight: item.product.weight || 1.5,
          })),
          totalValue: cartTotal,
          preferredServices: ['ECO', 'OVN', 'NBD'], // Courier Guy services
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRates(data.rates.filter((rate: ShippingRate) => rate.courier === 'The Courier Guy'));
      } else {
        setError(data.error || 'Failed to calculate shipping rates');
      }
    } catch (err) {
      setError('Failed to calculate shipping rates');
    } finally {
      setLoading(false);
    }
  };

  const getServiceIcon = (service: string) => {
    if (service.includes('Overnight') || service.includes('Next Business Day')) {
      return <Star className="h-4 w-4 text-yellow-500" />;
    }
    if (service.includes('Economy')) {
      return <Truck className="h-4 w-4 text-green-500" />;
    }
    return <Truck className="h-4 w-4 text-blue-500" />;
  };

  const getServiceBadge = (service: string) => {
    if (service.includes('Overnight')) return 'Premium';
    if (service.includes('Economy')) return 'Economy';
    return 'Standard';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Calculating shipping rates...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-600">{error}</div>
          <Button onClick={calculateRates} className="w-full mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          The Courier Guy - Shipping Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rates.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No shipping options available for this address
          </div>
        ) : (
          rates.map((rate, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedRate?.service === rate.service
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-gray-200'
              }`}
              onClick={() => onShippingSelected(rate)}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {getServiceIcon(rate.service)}
                  <span className="font-semibold">{rate.service}</span>
                  <Badge variant="outline" className="text-xs">
                    {getServiceBadge(rate.service)}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">
                    R{rate.price.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{rate.estimatedDays}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  <span>Tracking included</span>
                </div>
                {rate.service.includes('Overnight') && (
                  <Badge variant="secondary" className="text-xs">
                    Express
                  </Badge>
                )}
              </div>

              {rate.collectionDate && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Collection: {new Date(rate.collectionDate).toLocaleDateString()}
                  {rate.deliveryDate && ` • Delivery: ${new Date(rate.deliveryDate).toLocaleDateString()}`}
                </div>
              )}
            </div>
          ))
        )}

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Shield className="h-4 w-4" />
            <span>The Courier Guy - South Africa's trusted courier service</span>
          </div>
          <ul className="text-xs text-blue-700 mt-2 space-y-1">
            <li>• Real-time tracking on all shipments</li>
            <li>• Signature on delivery for security</li>
            <li>• Special handling for fragile plants</li>
            <li>• SMS and email notifications</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 