import { NextRequest, NextResponse } from 'next/server';
import { shippingManager } from '@/lib/shipping/shipping-manager';
import { ShippingAddress, ShipmentDetails } from '@/lib/shipping/shipping-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, items, totalValue } = body;

    if (!address || !items || !totalValue) {
      return NextResponse.json(
        { error: 'Missing required shipping data' },
        { status: 400 }
      );
    }

    const shippingAddress: ShippingAddress = {
      firstName: address.firstName || '',
      lastName: address.lastName || '',
      company: address.company || '',
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      phone: address.phone || '',
    };

    const shipmentDetails: ShipmentDetails = {
      weight: items.reduce((total: number, item: any) => total + (item.weight || 1.5) * item.quantity, 0),
      value: totalValue,
      items: items.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        weight: item.weight || 1.5,
      })),
    };

    const rates = await shippingManager.getShippingRates(shippingAddress, shipmentDetails);

    return NextResponse.json({ rates });
  } catch (error) {
    console.error('Shipping rates error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate shipping rates' },
      { status: 500 }
    );
  }
} 