interface YocoPaymentRequest {
  amountInCents: number;
  currency: string;
  metadata?: Record<string, any>;
}

interface YocoCharge {
  id: string;
  status: string;
  amount: number;
  currency: string;
  metadata: Record<string, any>;
}

export class YocoService {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.YOCO_SECRET_KEY!;
    if (!this.secretKey) {
      throw new Error('YOCO_SECRET_KEY is required');
    }
  }

  async createCharge(token: string, paymentRequest: YocoPaymentRequest): Promise<YocoCharge> {
    const response = await fetch('https://online.yoco.com/v1/charges/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        amount_in_cents: paymentRequest.amountInCents,
        currency: paymentRequest.currency,
        metadata: paymentRequest.metadata,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Yoco API error: ${error}`);
    }

    return response.json();
  }

  async getCharge(chargeId: string): Promise<YocoCharge> {
    const response = await fetch(`https://online.yoco.com/v1/charges/${chargeId}`, {
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch charge details');
    }

    return response.json();
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.YOCO_WEBHOOK_SECRET!)
      .update(payload)
      .digest('hex');
    
    return signature === expectedSignature;
  }
}

export const yocoService = new YocoService(); 