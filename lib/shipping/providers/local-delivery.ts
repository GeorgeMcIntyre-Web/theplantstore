import { ShippingProvider, ShippingRate, ShippingAddress, ShipmentDetails, TrackingInfo } from '../shipping-service';

export class LocalDeliveryProvider extends ShippingProvider {
  name = 'Local Delivery';

  async getRate(
    from: ShippingAddress,
    to: ShippingAddress,
    shipment: ShipmentDetails
  ): Promise<ShippingRate[]> {
    // Check if delivery is in Johannesburg area
    const isLocalDelivery = this.isLocalDelivery(to);
    
    if (!isLocalDelivery) {
      return [];
    }

    return [
      {
        courier: 'Local Delivery',
        service: 'Same Day Delivery',
        price: 150,
        estimatedDays: 'Same day (orders before 2 PM)',
        trackingAvailable: true,
      },
      {
        courier: 'Local Delivery',
        service: 'Next Day Delivery',
        price: 100,
        estimatedDays: 'Next business day',
        trackingAvailable: true,
      },
    ];
  }

  async createShipment(
    from: ShippingAddress,
    to: ShippingAddress,
    shipment: ShipmentDetails,
    reference: string
  ): Promise<{ trackingNumber: string; label?: string; cost: number }> {
    // Generate local tracking number
    const trackingNumber = `LOCAL${Date.now()}`;
    
    // Store delivery details in database
    // This would integrate with your local delivery management system
    
    return {
      trackingNumber,
      cost: 100, // Default to next day delivery
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    // This would query your local delivery database
    return {
      trackingNumber,
      status: 'IN_TRANSIT',
      statusDescription: 'Out for delivery',
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      events: [
        {
          date: new Date().toISOString(),
          status: 'COLLECTED',
          location: 'Johannesburg Warehouse',
          description: 'Package collected for delivery',
        },
      ],
    };
  }

  private isLocalDelivery(address: ShippingAddress): boolean {
    const localAreas = [
      'johannesburg', 'sandton', 'rosebank', 'randburg', 'midrand',
      'fourways', 'roodepoort', 'soweto', 'alexandra', 'kempton park'
    ];
    
    const city = address.city.toLowerCase();
    return localAreas.some(area => city.includes(area));
  }
} 