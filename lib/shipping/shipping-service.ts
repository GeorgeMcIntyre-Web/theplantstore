export interface ShippingRate {
  courier: string;
  service: string;
  price: number;
  estimatedDays: string;
  trackingAvailable: boolean;
  serviceCode?: string;
  collectionDate?: string;
  deliveryDate?: string;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
}

export interface ShipmentDetails {
  weight: number; // in kg
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  value: number;
  items: Array<{
    name: string;
    quantity: number;
    weight: number;
  }>;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  estimatedDelivery?: string;
  events: Array<{
    date: string;
    status: string;
    location: string;
    description: string;
  }>;
}

export abstract class ShippingProvider {
  abstract name: string;
  abstract getRate(
    from: ShippingAddress,
    to: ShippingAddress,
    shipment: ShipmentDetails
  ): Promise<ShippingRate[]>;
  
  abstract createShipment(
    from: ShippingAddress,
    to: ShippingAddress,
    shipment: ShipmentDetails,
    reference: string
  ): Promise<{
    trackingNumber: string;
    label?: string;
    cost: number;
  }>;
  
  abstract trackShipment(trackingNumber: string): Promise<TrackingInfo>;
} 