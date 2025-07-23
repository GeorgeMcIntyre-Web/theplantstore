import { ShippingProvider, ShippingRate, ShippingAddress, ShipmentDetails, TrackingInfo } from '../shipping-service';

export class AramexProvider extends ShippingProvider {
  name = 'Aramex';
  private baseUrl = 'https://ws.aramex.net';
  private credentials = {
    username: process.env.ARAMEX_USERNAME!,
    password: process.env.ARAMEX_PASSWORD!,
    accountNumber: process.env.ARAMEX_ACCOUNT_NUMBER!,
    accountPin: process.env.ARAMEX_ACCOUNT_PIN!,
    countryCode: process.env.ARAMEX_COUNTRY_CODE!,
    version: process.env.ARAMEX_VERSION!,
  };

  async getRate(
    from: ShippingAddress,
    to: ShippingAddress,
    shipment: ShipmentDetails
  ): Promise<ShippingRate[]> {
    try {
      const payload = {
        ClientInfo: this.credentials,
        Transaction: {
          Reference1: 'RATE_QUOTE',
          Reference2: '',
          Reference3: '',
          Reference4: '',
          Reference5: '',
        },
        OriginAddress: this.formatAddress(from),
        DestinationAddress: this.formatAddress(to),
        ShipmentDetails: {
          Dimensions: {
            Length: shipment.dimensions?.length || 30,
            Width: shipment.dimensions?.width || 30,
            Height: shipment.dimensions?.height || 30,
            Unit: 'CM',
          },
          ActualWeight: {
            Value: shipment.weight,
            Unit: 'KG',
          },
          ChargeableWeight: {
            Value: shipment.weight,
            Unit: 'KG',
          },
          ProductGroup: 'DOM',
          ProductType: 'PPX',
          PaymentType: 'P',
          PaymentOptions: '',
          Services: '',
          NumberOfPieces: shipment.items.length,
          DescriptionOfGoods: 'Plants and accessories',
          GoodsOriginCountry: 'ZA',
        },
        PreferredCurrencyCode: 'ZAR',
      };

      const response = await fetch(`${this.baseUrl}/ShippingAPI.V2/RateCalculator/Service_1_0.svc/json/CalculateRate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.HasErrors && data.TotalAmount) {
        return [
          {
            courier: 'Aramex',
            service: 'Standard Delivery',
            price: parseFloat(data.TotalAmount.Value),
            estimatedDays: '2-4 business days',
            trackingAvailable: true,
          },
        ];
      }

      // Fallback rates based on province
      return this.getFallbackRates(to.province);
    } catch (error) {
      console.error('Aramex rate calculation error:', error);
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
      ClientInfo: this.credentials,
      Transaction: {
        Reference1: reference,
        Reference2: '',
        Reference3: '',
        Reference4: '',
        Reference5: '',
      },
      Shipments: [
        {
          Reference1: reference,
          Reference2: '',
          Reference3: '',
          Shipper: this.formatAddress(from),
          Consignee: this.formatAddress(to),
          ThirdParty: {
            Reference1: '',
            Reference2: '',
            AccountNumber: '',
          },
          ShippingDateTime: `/Date(${Date.now()})/`,
          DueDate: `/Date(${Date.now() + 7 * 24 * 60 * 60 * 1000})/`,
          Comments: 'Plant delivery - handle with care',
          PickupLocation: 'Reception',
          OperationsInstructions: 'Fragile - Live plants',
          AccountingInstrcutions: '',
          Details: {
            Dimensions: {
              Length: shipment.dimensions?.length || 30,
              Width: shipment.dimensions?.width || 30,
              Height: shipment.dimensions?.height || 30,
              Unit: 'CM',
            },
            ActualWeight: {
              Value: shipment.weight,
              Unit: 'KG',
            },
            ChargeableWeight: {
              Value: shipment.weight,
              Unit: 'KG',
            },
            ProductGroup: 'DOM',
            ProductType: 'PPX',
            PaymentType: 'P',
            PaymentOptions: '',
            Services: '',
            NumberOfPieces: shipment.items.length,
            DescriptionOfGoods: 'Plants and accessories',
            GoodsOriginCountry: 'ZA',
            CashOnDeliveryAmount: {
              Value: 0,
              CurrencyCode: 'ZAR',
            },
            InsuranceAmount: {
              Value: shipment.value,
              CurrencyCode: 'ZAR',
            },
            CollectAmount: {
              Value: 0,
              CurrencyCode: 'ZAR',
            },
            CashAdditionalAmount: {
              Value: 0,
              CurrencyCode: 'ZAR',
            },
            CashAdditionalAmountDescription: '',
            Items: shipment.items.map(item => ({
              PackageType: 'Box',
              Quantity: item.quantity,
              Weight: {
                Value: item.weight,
                Unit: 'KG',
              },
              Comments: item.name,
              Reference: '',
            })),
          },
        },
      ],
      LabelInfo: {
        ReportID: 9729,
        ReportType: 'URL',
      },
    };

    const response = await fetch(`${this.baseUrl}/ShippingAPI.V2/Shipping/Service_1_0.svc/json/CreateShipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.HasErrors && data.Shipments && data.Shipments.length > 0) {
      const shipment = data.Shipments[0];
      return {
        trackingNumber: shipment.ID,
        label: data.HasErrors ? undefined : shipment.ShipmentLabel?.LabelURL,
        cost: parseFloat(shipment.TotalAmount?.Value || '0'),
      };
    }

    throw new Error('Failed to create Aramex shipment');
  }

  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    const payload = {
      ClientInfo: this.credentials,
      Transaction: {
        Reference1: 'TRACK',
        Reference2: '',
        Reference3: '',
        Reference4: '',
        Reference5: '',
      },
      Shipments: [trackingNumber],
      GetLastTrackingUpdateOnly: false,
    };

    const response = await fetch(`${this.baseUrl}/ShippingAPI.V2/Tracking/Service_1_0.svc/json/TrackShipments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.HasErrors && data.TrackingResults && data.TrackingResults.length > 0) {
      const result = data.TrackingResults[0];
      return {
        trackingNumber,
        status: result.UpdateCode,
        statusDescription: result.UpdateDescription,
        estimatedDelivery: result.DeliveryDate,
        events: result.TrackingUpdates?.map((update: any) => ({
          date: update.UpdateDateTime,
          status: update.UpdateCode,
          location: update.UpdateLocation,
          description: update.UpdateDescription,
        })) || [],
      };
    }

    throw new Error('Failed to track Aramex shipment');
  }

  private formatAddress(address: ShippingAddress) {
    return {
      Line1: address.addressLine1,
      Line2: address.addressLine2 || '',
      Line3: '',
      City: address.city,
      StateOrProvinceCode: address.province,
      PostCode: address.postalCode,
      CountryCode: 'ZA',
      Longitude: 0,
      Latitude: 0,
      BuildingNumber: '',
      BuildingName: '',
      Floor: '',
      Apartment: '',
      POBox: '',
      Description: '',
    };
  }

  private getFallbackRates(province: string): ShippingRate[] {
    const rates: { [key: string]: number } = {
      GAUTENG: 85,
      WESTERN_CAPE: 120,
      KWAZULU_NATAL: 110,
      EASTERN_CAPE: 130,
      LIMPOPO: 140,
      MPUMALANGA: 125,
      NORTH_WEST: 115,
      NORTHERN_CAPE: 150,
      FREE_STATE: 105,
    };

    return [
      {
        courier: 'Aramex',
        service: 'Standard Delivery',
        price: rates[province] || 120,
        estimatedDays: province === 'GAUTENG' ? '1-2 business days' : '2-4 business days',
        trackingAvailable: true,
      },
    ];
  }
} 