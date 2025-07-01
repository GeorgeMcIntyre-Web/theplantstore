"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck, Clock, Star } from 'lucide-react';
import { ShippingRate } from '@/lib/shipping/shipping-service';

interface ShippingCalculatorProps {
  cartItems: any[];
  cartTotal: number;
  onShippingSelected: (rate: ShippingRate) => void;
  selectedRate?: ShippingRate;
}

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

export function ShippingCalculator({ 
  cartItems, 
  cartTotal, 
  onShippingSelected, 
  selectedRate 
}: ShippingCalculatorProps) {
  const [address, setAddress] = useState({
    city: '',
    province: '',
    postalCode: '',
  });
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const calculateRates = async () => {
    if (!address.city || !address.province || !address.postalCode) {
      setError('Please fill in all address fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: {
            ...address,
            firstName: '',
            lastName: '',
            addressLine1: 'Address for calculation',
          },
          items: cartItems.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            weight: item.product.weight || 1.5,
          })),
          totalValue: cartTotal,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRates(data.rates);
      } else {
        setError(data.error || 'Failed to calculate shipping rates');
      }
    } catch (err) {
      setError('Failed to calculate shipping rates');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Calculate Shipping
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="e.g. Johannesburg"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="province">Province</Label>
            <Select value={address.province} onValueChange={(value) => setAddress({ ...address, province: value })}>
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
          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              placeholder="e.g. 2001"
              value={address.postalCode}
              onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
            />
          </div>
        </div>

        <Button onClick={calculateRates} disabled={loading} className="w-full">
          {loading ? 'Calculating...' : 'Calculate Shipping Rates'}
        </Button>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {rates.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Available Shipping Options:</h4>
            {rates.map((rate, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedRate?.courier === rate.courier && selectedRate?.service === rate.service
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => onShippingSelected(rate)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{rate.courier}</span>
                      {rate.courier === 'Free Shipping' && (
                        <Star className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{rate.service}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{rate.estimatedDays}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {rate.price === 0 ? 'FREE' : `R${rate.price.toFixed(2)}`}
                    </div>
                    {rate.trackingAvailable && (
                      <div className="text-xs text-green-600">Tracking included</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 