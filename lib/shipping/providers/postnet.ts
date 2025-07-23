import { ShippingProvider, ShippingRate, ShippingAddress, ShipmentDetails, TrackingInfo } from '../shipping-service';

export class PostNetProvider extends ShippingProvider {
  name = 'PostNet';
  private baseUrl = 'https://api.postnet.co.za';
  private apiKey = process.env.POSTNET_API_KEY!;
  private customerCode = process.env.POSTNET_CUSTOMER_CODE!;

  async getRate(
    from: ShippingAddress,
    to: ShippingAddress,
    shipment: ShipmentDetails
  ): Promise<ShippingRate[]> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/rates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_postal_code: this.extractPostalCode(from.postalCode),
          to_postal_code: this.extractPostalCode(to.postalCode),
          weight: shipment.weight,
          length: shipment.dimensions?.length || 30,
          width: shipment.dimensions?.width || 30,
          height: shipment.dimensions?.height || 30,
          declared_value: shipment.value,
        }),
      });

      const data = await response.json();

      if (data.success && data.rates) {
        return data.rates.map((rate: any) => ({
          courier: 'PostNet',
          service: rate.service_name,
          price: parseFloat(rate.total_cost),
          estimatedDays: rate.estimated_delivery_days,
          trackingAvailable: true,
        }));
      }

      return this.getFallbackRates(to.province);
    } catch (error) {
      console.error('PostNet rate calculation error:', error);
      return this.getFallbackRates(to.province);
    }
  }

  async createShipment(
    from: ShippingAddress,
    to: ShippingAddress,
    shipment: ShipmentDetails,
    reference: string
  ): Promise<{ trackingNumber: string; label?: string; cost: number }> {
    const payload = {
      customer_code: this.customerCode,
      service_code: 'STANDARD',
      reference: reference,
      sender: {
        name: `${from.firstName} ${from.lastName}`,
        company: from.company || 'The House Plant Store',
        address_line_1: from.addressLine1,
        address_line_2: from.addressLine2 || '',
        city: from.city,
        postal_code: from.postalCode,
        phone: from.phone,
      },
      recipient: {
        name: `${to.firstName} ${to.lastName}`,
        company: to.company || '',
        address_line_1: to.addressLine1,
        address_line_2: to.addressLine2 || '',
        city: to.city,
        postal_code: to.postalCode,
        phone: to.phone,
      },
      parcel: {
        weight: shipment.weight,
        length: shipment.dimensions?.length || 30,
        width: shipment.dimensions?.width || 30,
        height: shipment.dimensions?.height || 30,
        declared_value: shipment.value,
        contents: shipment.items.map(item => item.name).join(', '),
      },
      special_instructions: 'Fragile - Live plants. Handle with care.',
    };

    const response = await fetch(`${this.baseUrl}/v1/shipments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (data.success) {
      return {
        trackingNumber: data.tracking_number,
        label: data.label_url,
        cost: parseFloat(data.total_cost),
      };
    }

    throw new Error('Failed to create PostNet shipment');
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    const response = await fetch(`${this.baseUrl}/v1/tracking/${trackingNumber}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return {
        trackingNumber,
        status: data.status_code,
        statusDescription: data.status_description,
        estimatedDelivery: data.estimated_delivery,
        events: data.tracking_events?.map((event: any) => ({
          date: event.timestamp,
          status: event.status_code,
          location: event.location,
          description: event.description,
        })) || [],
      };
    }

    throw new Error('Failed to track PostNet shipment');
  }

  private extractPostalCode(postalCode: string): string {
    return postalCode.replace(/\D/g, '');
  }

  private getFallbackRates(province: string): ShippingRate[] {
    const rates: { [key: string]: number } = {
      GAUTENG: 75,
      WESTERN_CAPE: 110,
      KWAZULU_NATAL: 100,
      EASTERN_CAPE: 120,
      LIMPOPO: 130,
      MPUMALANGA: 115,
      NORTH_WEST: 105,
      NORTHERN_CAPE: 140,
      FREE_STATE: 95,
    };

    return [
      {
        courier: 'PostNet',
        service: 'Standard Delivery',
        price: rates[province] || 110,
        estimatedDays: province === 'GAUTENG' ? '1-2 business days' : '2-3 business days',
        trackingAvailable: true,
      },
    ];
  }
} 