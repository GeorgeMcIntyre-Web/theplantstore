import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { shippingManager } from '@/lib/shipping/shipping-manager';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'PLANT_MANAGER' && userRole !== 'ORDER_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, courier, service } = body;

    if (!orderId || !courier || !service) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    const result = await shippingManager.createShipment(orderId, courier, service);

    return NextResponse.json({
      success: true,
      trackingNumber: result.trackingNumber,
      cost: result.cost,
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    return NextResponse.json(
      { error: 'Failed to create shipment' },
      { status: 500 }
    );
  }
} 