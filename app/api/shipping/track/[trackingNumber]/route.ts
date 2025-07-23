import { NextRequest, NextResponse } from 'next/server';
import { shippingManager } from '@/lib/shipping/shipping-manager';

export async function GET(
  request: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const { trackingNumber } = params;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    const trackingInfo = await shippingManager.trackShipment(trackingNumber);

    if (!trackingInfo) {
      return NextResponse.json(
        { error: 'Tracking information not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(trackingInfo);
  } catch (error) {
    console.error('Track shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to track shipment' },
      { status: 500 }
    );
  }
} 