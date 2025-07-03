import crypto from 'crypto';

export interface PaystackTransaction {
  id: string;
  amount: number;
  currency: string;
  email: string;
  reference: string;
  status: string;
  gateway_response: string;
  channel: string;
  paid_at: string;
  created_at: string;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: PaystackTransaction;
}

class PaystackService {
  private secretKey: string;
  private publicKey: string;
  private baseUrl: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY!;
    this.publicKey = process.env.PAYSTACK_PUBLIC_KEY!;
    this.baseUrl = 'https://api.paystack.co';
  }

  /**
   * Initialize a new transaction
   */
  async initializeTransaction(data: {
    amount: number;
    email: string;
    reference?: string;
    callback_url?: string;
    currency?: string;
  }): Promise<PaystackInitializeResponse> {
    const payload = {
      amount: data.amount * 100, // Convert to kobo
      email: data.email,
      reference: data.reference || this.generateReference(),
      callback_url: data.callback_url || `${process.env.NEXTAUTH_URL}/payment/verify`,
      currency: data.currency || 'ZAR',
    };

    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Paystack initialization error:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  /**
   * Verify a transaction
   */
  async verifyTransaction(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Paystack verification error:', error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * List transactions
   */
  async listTransactions(params: {
    page?: number;
    perPage?: number;
    customer?: string;
    status?: string;
    from?: string;
    to?: string;
  } = {}): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.perPage) queryParams.append('perPage', params.perPage.toString());
    if (params.customer) queryParams.append('customer', params.customer);
    if (params.status) queryParams.append('status', params.status);
    if (params.from) queryParams.append('from', params.from);
    if (params.to) queryParams.append('to', params.to);

    try {
      const response = await fetch(`${this.baseUrl}/transaction?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Paystack list transactions error:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(data: {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
  }): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/customer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Paystack create customer error:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(payload)
      .digest('hex');
    
    return hash === signature;
  }

  /**
   * Generate unique reference
   */
  private generateReference(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `TXN_${timestamp}_${random}`.toUpperCase();
  }

  /**
   * Get public key for client-side use
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(amount);
  }

  /**
   * Parse amount from kobo to rand
   */
  parseAmount(amountInKobo: number): number {
    return amountInKobo / 100;
  }
}

export const paystackService = new PaystackService(); 