import { ShippingProvider, ShippingRate, ShippingAddress, ShipmentDetails, TrackingInfo } from './shipping-service';
import { CourierGuyProvider } from './providers/courier-guy';
import { AramexProvider } from './providers/aramex';
import { PostNetProvider } from './providers/postnet';
import { LocalDeliveryProvider } from './providers/local-delivery';
import { prisma } from '@/lib/db';

export class ShippingManager {
  private providers: ShippingProvider[] = [
    new CourierGuyProvider(), // Primary courier - The Courier Guy
    new LocalDeliveryProvider(), // Backup local delivery
    new AramexProvider(), // Backup international
    new PostNetProvider(), // Additional backup
  ];

  async getShippingRates(
    to: ShippingAddress,
    shipment: ShipmentDetails
  ): Promise<ShippingRate[]> {
    const from = this.getWarehouseAddress();
    const allRates: ShippingRate[] = [];

    // Get rates from all providers
    for (const provider of this.providers) {
      try {
        const rates = await provider.getRate(from, to, shipment);
        allRates.push(...rates);
      } catch (error) {
        console.error(`Error getting rates from ${provider.name}:`, error);
      }
    }

    // Add free shipping option if applicable
    const subtotal = shipment.value;
    const freeShippingThreshold = parseFloat(process.env.FREE_SHIPPING_THRESHOLD || '500');
    
    if (subtotal >= freeShippingThreshold) {
      allRates.unshift({
        courier: 'Free Shipping',
        service: 'Standard Delivery (Free)',
        price: 0,
        estimatedDays: '3-5 business days',
        trackingAvailable: true,
      });
    }

    // Sort by price
    return allRates.sort((a, b) => a.price - b.price);
  }

  async createShipment(
    orderId: string,
    selectedCourier: string,
    selectedService: string
  ): Promise<{ trackingNumber: string; cost: number }> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
      },
    });

    if (!order || !order.shippingAddress) {
      throw new Error('Order or shipping address not found');
    }

    const provider = this.providers.find(p => p.name === selectedCourier);
    if (!provider) {
      throw new Error(`Shipping provider ${selectedCourier} not found`);
    }

    const from = this.getWarehouseAddress();
    const to = {
      firstName: order.shippingAddress.firstName,
      lastName: order.shippingAddress.lastName,
      company: order.shippingAddress.company || '',
      addressLine1: order.shippingAddress.addressLine1,
      addressLine2: order.shippingAddress.addressLine2 || '',
      city: order.shippingAddress.city,
      province: order.shippingAddress.province,
      postalCode: order.shippingAddress.postalCode,
      phone: order.shippingAddress.phone,
    };

    const shipment: ShipmentDetails = {
      weight: this.calculateWeight(order.items),
      dimensions: this.calculateDimensions(order.items),
      value: Number(order.subtotal),
      items: order.items.map((item: any) => ({
        name: item.productName,
        quantity: item.quantity,
        weight: this.getProductWeight(item.product),
      })),
    };

    const result = await provider.createShipment(from, to, shipment, order.orderNumber);

    // Update order with tracking information
    await prisma.order.update({
      where: { id: orderId },
      data: {
        trackingNumber: result.trackingNumber,
        status: 'PROCESSING',
        shippedAt: new Date(),
      },
    });

    return {
      trackingNumber: result.trackingNumber,
      cost: result.cost,
    };
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo | null> {
    // Try to find which provider handles this tracking number
    for (const provider of this.providers) {
      try {
        return await provider.trackShipment(trackingNumber);
      } catch (error) {
        // Continue to next provider
        continue;
      }
    }
    return null;
  }

  private getWarehouseAddress(): ShippingAddress {
    return {
      firstName: 'The House',
      lastName: 'Plant Store',
      company: 'The House Plant Store',
      addressLine1: process.env.DEFAULT_SHIPPING_ORIGIN_ADDRESS || '123 Warehouse St',
      city: 'Johannesburg',
      province: 'GAUTENG',
      postalCode: '2001',
      phone: '+27 11 123 4567',
    };
  }

  private calculateWeight(items: any[]): number {
    // Default weight calculation - you can make this more sophisticated
    return items.reduce((total, item) => {
      const itemWeight = this.getProductWeight(item.product) * item.quantity;
      return total + itemWeight;
    }, 0);
  }

  private calculateDimensions(items: any[]): { length: number; width: number; height: number } {
    // Simple box size calculation based on number of items
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    
    if (itemCount <= 2) {
      return { length: 30, width: 30, height: 20 };
    } else if (itemCount <= 5) {
      return { length: 40, width: 30, height: 30 };
    } else {
      return { length: 50, width: 40, height: 40 };
    }
  }

  private getProductWeight(product: any): number {
    // Return product weight or default based on category
    if (product?.weight) {
      return Number(product.weight);
    }
    
    // Default weights by category (in kg)
    const categoryWeights: { [key: string]: number } = {
      'Indoor Plants': 2.0,
      'Outdoor Plants': 3.0,
      'Succulents': 0.5,
      'Accessories': 1.0,
    };
    
    return categoryWeights[product?.category?.name] || 1.5;
  }
}

export const shippingManager = new ShippingManager(); 