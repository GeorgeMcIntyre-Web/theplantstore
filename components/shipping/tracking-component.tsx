"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Package, MapPin, Clock, CheckCircle } from 'lucide-react';
import { TrackingInfo } from '@/lib/shipping/shipping-service';

export function TrackingComponent() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const trackShipment = async () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingInfo(null);

    try {
      const response = await fetch(`/api/shipping/track/${encodeURIComponent(trackingNumber.trim())}`);
      const data = await response.json();

      if (response.ok) {
        setTrackingInfo(data);
      } else {
        setError(data.error || 'Failed to track shipment');
      }
    } catch (err) {
      setError('Failed to track shipment');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
      case 'COLLECTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXCEPTION':
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'DELIVERED':
        return <CheckCircle className="h-4 w-4" />;
      case 'IN_TRANSIT':
      case 'OUT_FOR_DELIVERY':
        return <Package className="h-4 w-4" />;
      case 'COLLECTED':
        return <MapPin className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Track Your Order
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="trackingNumber">Tracking Number</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="trackingNumber"
                placeholder="Enter your tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && trackShipment()}
              />
              <Button onClick={trackShipment} disabled={loading}>
                {loading ? 'Tracking...' : 'Track'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm p-3 bg-red-50 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {trackingInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Tracking Number</h4>
                <p className="font-mono text-sm">{trackingInfo.trackingNumber}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Current Status</h4>
                <Badge className={getStatusColor(trackingInfo.status)}>
                  {getStatusIcon(trackingInfo.status)}
                  <span className="ml-1">{trackingInfo.statusDescription}</span>
                </Badge>
              </div>
            </div>

            {trackingInfo.estimatedDelivery && (
              <div>
                <h4 className="font-semibold mb-2">Estimated Delivery</h4>
                <p className="text-sm">
                  {new Date(trackingInfo.estimatedDelivery).toLocaleDateString('en-ZA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {trackingInfo.events && trackingInfo.events.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4">Tracking History</h4>
                <div className="space-y-3">
                  {trackingInfo.events.map((event, index) => (
                    <div key={index} className="flex gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(event.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">{event.description}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString('en-ZA')} {new Date(event.date).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 