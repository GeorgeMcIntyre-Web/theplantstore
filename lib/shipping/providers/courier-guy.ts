import { ShippingProvider, ShippingRate, ShippingAddress, ShipmentDetails, TrackingInfo } from '../shipping-service';

interface CourierGuyAuth {
  username: string;
  password: string;
  apiKey: string;
  apiSecret: string;
  customerCode: string;
}

interface CourierGuyRate {
  service_code: string;
  service_name: string;
  total_cost: number;
  delivery_days: string;
  collection_date: string;
  delivery_date: string;
}

interface CourierGuyShipment {
  waybill_number: string;
  service_code: string;
  total_cost: number;
  collection_date: string;
  delivery_date: string;
  tracking_url: string;
}

export class CourierGuyProvider extends ShippingProvider {
  name = 'The Courier Guy';
  private baseUrl = process.env.COURIER_GUY_BASE_URL!;
  private auth: CourierGuyAuth;

  constructor() {
    super();
    this.auth = {
      username: process.env.COURIER_GUY_USERNAME!,
      password: process.env.COURIER_GUY_PASSWORD!,
      apiKey: process.env.COURIER_GUY_API_KEY!,
      apiSecret: process.env.COURIER_GUY_API_SECRET!,
      customerCode: process.env.COURIER_GUY_CUSTOMER_CODE!,
    };
  }

  async getRate(
    from: ShippingAddress,
    to: ShippingAddress,
    shipment: ShipmentDetails
  ): Promise<ShippingRate[]> {
    try {
      const token = await this.authenticate();
      
      const payload = {
        collection_address: this.formatAddress(from),
        delivery_address: this.formatAddress(to),
        parcel_details: {
          submitted_length_cm: shipment.dimensions?.length || 30,
          submitted_width_cm: shipment.dimensions?.width || 30,
          submitted_height_cm: shipment.dimensions?.height || 30,
          submitted_weight_kg: shipment.weight,
          declared_value: shipment.value,
          contents: shipment.items.map(item => item.name).join(', '),
          special_instructions: 'Fragile - Live plants. Handle with care.',
        },
        collection_date: this.getNextBusinessDay(),
        service_types: ['ECO', 'OVN', 'NBD'], // Economy, Overnight, Next Business Day
      };

      const response = await fetch(`${this.baseUrl}/v3/rates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-API-Key': this.auth.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Courier Guy API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.rates) {
        return data.rates.map((rate: CourierGuyRate) => ({
          courier: this.name,
          service: this.getServiceName(rate.service_code),
          price: parseFloat(rate.total_cost.toString()),
          estimatedDays: rate.delivery_days,
          trackingAvailable: true,
          serviceCode: rate.service_code,
          collectionDate: rate.collection_date,
          deliveryDate: rate.delivery_date,
        }));
      }

      // Fallback to standard rates if API fails
      return this.getFallbackRates(to.province);
    } catch (error) {
      console.error('Courier Guy rate calculation error:', error);
      return this.getFallbackRates(to.province);
    }
  }

  async createShipment(
    from: ShippingAddress,
    to: ShippingAddress,
    shipment: ShipmentDetails,
    reference: string
  ): Promise<{ trackingNumber: string; label?: string; cost: number }> {
    try {
      const token = await this.authenticate();

      const payload = {
        customer_code: this.auth.customerCode,
        service_code: 'ECO', // Default to Economy service
        reference: reference,
        collection_address: this.formatAddress(from),
        delivery_address: this.formatAddress(to),
        parcel_details: {
          submitted_length_cm: shipment.dimensions?.length || 30,
          submitted_width_cm: shipment.dimensions?.width || 30,
          submitted_height_cm: shipment.dimensions?.height || 30,
          submitted_weight_kg: shipment.weight,
          declared_value: shipment.value,
          contents: shipment.items.map(item => item.name).join(', '),
          special_instructions: 'Fragile - Live plants. Handle with care. Keep upright.',
        },
        collection_details: {
          collection_date: this.getNextBusinessDay(),
          collection_time: process.env.DEFAULT_COLLECTION_TIME || '09:00',
          special_instructions: 'Plants require careful handling',
        },
        delivery_details: {
          special_instructions: 'Deliver to recipient only. Plants are fragile.',
        },
        options: {
          email_notifications: true,
          sms_notifications: true,
          signature_required: true,
          insurance: shipment.value > 500,
        },
      };

      const response = await fetch(`${this.baseUrl}/v3/shipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-API-Key': this.auth.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create Courier Guy shipment: ${errorData}`);
      }

      const data = await response.json();

      if (data.success && data.shipment) {
        const shipmentData: CourierGuyShipment = data.shipment;
        return {
          trackingNumber: shipmentData.waybill_number,
          label: data.label_url || shipmentData.tracking_url,
          cost: parseFloat(shipmentData.total_cost.toString()),
        };
      }

      throw new Error('Invalid response from Courier Guy API');
    } catch (error) {
      console.error('Courier Guy shipment creation error:', error);
      throw error;
    }
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    try {
      const token = await this.authenticate();

      const response = await fetch(`${this.baseUrl}/v3/tracking/${trackingNumber}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': this.auth.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to track shipment: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.tracking) {
        const tracking = data.tracking;
        return {
          trackingNumber,
          status: this.mapStatusToStandard(tracking.status_code),
          statusDescription: tracking.status_description,
          estimatedDelivery: tracking.estimated_delivery_date,
          events: tracking.events?.map((event: any) => ({
            date: event.event_datetime,
            status: this.mapStatusToStandard(event.status_code),
            location: event.location,
            description: event.description,
          })) || [],
        };
      }

      throw new Error('No tracking data available');
    } catch (error) {
      console.error('Courier Guy tracking error:', error);
      throw error;
    }
  }

  private async authenticate(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/v3/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.auth.apiKey,
        },
        body: JSON.stringify({
          username: this.auth.username,
          password: this.auth.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.token) {
        return data.token;
      }

      throw new Error('Invalid authentication response');
    } catch (error) {
      console.error('Courier Guy authentication error:', error);
      throw error;
    }
  }

  private formatAddress(address: ShippingAddress) {
    return {
      company: address.company || '',
      contact_person: `${address.firstName} ${address.lastName}`,
      phone: address.phone,
      email: '', // Will be filled from order details
      address_line_1: address.addressLine1,
      address_line_2: address.addressLine2 || '',
      suburb: '',
      city: address.city,
      province: this.mapProvinceToCode(address.province),
      postal_code: address.postalCode,
      country: 'ZA',
    };
  }

  private mapProvinceToCode(province: string): string {
    const provinceMap: { [key: string]: string } = {
      'GAUTENG': 'GP',
      'WESTERN_CAPE': 'WC',
      'KWAZULU_NATAL': 'KZN',
      'EASTERN_CAPE': 'EC',
      'LIMPOPO': 'LP',
      'MPUMALANGA': 'MP',
      'NORTH_WEST': 'NW',
      'NORTHERN_CAPE': 'NC',
      'FREE_STATE': 'FS',
    };
    return provinceMap[province] || 'GP';
  }

  private getServiceName(serviceCode: string): string {
    const serviceNames: { [key: string]: string } = {
      'ECO': 'Economy (3-5 business days)',
      'OVN': 'Overnight (next business day)',
      'NBD': 'Next Business Day',
      'SDD': 'Same Day Delivery',
      'MSN': 'Morning Service',
      'AFN': 'Afternoon Service',
    };
    return serviceNames[serviceCode] || 'Standard Delivery';
  }

  private mapStatusToStandard(courierGuyStatus: string): string {
    const statusMap: { [key: string]: string } = {
      'COLLECTED': 'COLLECTED',
      'IN_TRANSIT': 'IN_TRANSIT',
      'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
      'DELIVERED': 'DELIVERED',
      'DELIVERY_FAILED': 'EXCEPTION',
      'RETURNED': 'RETURNED',
      'CANCELLED': 'CANCELLED',
    };
    return statusMap[courierGuyStatus] || 'PENDING';
  }

  private getNextBusinessDay(): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Skip weekends
    while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
      tomorrow.setDate(tomorrow.getDate() + 1);
    }

    return tomorrow.toISOString().split('T')[0];
  }

  private getFallbackRates(province: string): ShippingRate[] {
    // The Courier Guy's standard rates for different provinces
    const rates: { [key: string]: { economy: number; overnight: number; days: string } } = {
      'GAUTENG': { economy: 75, overnight: 120, days: '1-2 business days' },
      'WESTERN_CAPE': { economy: 95, overnight: 150, days: '2-3 business days' },
      'KWAZULU_NATAL': { economy: 85, overnight: 140, days: '2-3 business days' },
      'EASTERN_CAPE': { economy: 105, overnight: 160, days: '3-4 business days' },
      'LIMPOPO': { economy: 115, overnight: 170, days: '3-4 business days' },
      'MPUMALANGA': { economy: 95, overnight: 150, days: '2-3 business days' },
      'NORTH_WEST': { economy: 90, overnight: 145, days: '2-3 business days' },
      'NORTHERN_CAPE': { economy: 120, overnight: 180, days: '3-5 business days' },
      'FREE_STATE': { economy: 85, overnight: 140, days: '2-3 business days' },
    };

    const provinceRates = rates[province] || { economy: 90, overnight: 150, days: '2-4 business days' };

    return [
      {
        courier: this.name,
        service: 'Economy Service',
        price: provinceRates.economy,
        estimatedDays: provinceRates.days,
        trackingAvailable: true,
        serviceCode: 'ECO',
      },
      {
        courier: this.name,
        service: 'Overnight Service',
        price: provinceRates.overnight,
        estimatedDays: 'Next business day',
        trackingAvailable: true,
        serviceCode: 'OVN',
      },
    ];
  }
} 