import sgMail from '@sendgrid/mail';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export interface EmailData {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: {
    email: string;
    name: string;
  };
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
}

class SendGridService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY!;
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@theplantstore.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'The House Plant Store';
    
    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    }
  }

  /**
   * Send a simple email
   */
  async sendEmail(data: EmailData): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('SendGrid API key not configured');
      return false;
    }

    const msg = {
      to: data.to,
      from: data.from || {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: data.subject,
      html: data.html,
      text: data.text,
      attachments: data.attachments,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent successfully to:', data.to);
      return true;
    } catch (error) {
      console.error('SendGrid email error:', error);
      return false;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(order: any, customer: any): Promise<boolean> {
    const subject = `Order Confirmation - #${order.orderNumber}`;
    const html = this.generateOrderConfirmationTemplate(order, customer);
    
    return this.sendEmail({
      to: customer.email,
      subject,
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetToken: string): Promise<boolean> {
    const subject = 'Password Reset Request';
    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const subject = 'Welcome to The House Plant Store!';
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to The House Plant Store!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for joining our community of plant lovers!</p>
        <p>We're excited to help you find the perfect plants for your home.</p>
        <a href="${process.env.NEXTAUTH_URL}/collections" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Browse Our Collection
        </a>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Send newsletter
   */
  async sendNewsletter(subscribers: string[], subject: string, content: string): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${subject}</h2>
        <div>${content}</div>
        <hr>
        <p style="font-size: 12px; color: #666;">
          You're receiving this because you subscribed to our newsletter.
          <a href="${process.env.NEXTAUTH_URL}/unsubscribe">Unsubscribe</a>
        </p>
      </div>
    `;

    return this.sendEmail({
      to: subscribers,
      subject,
      html,
    });
  }

  /**
   * Send expense approval notification
   */
  async sendExpenseApprovalNotification(expense: any, approver: any): Promise<boolean> {
    const subject = `Expense Approval Required - ${expense.vendorName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Expense Approval Required</h2>
        <p>Hi ${approver.name},</p>
        <p>A new expense requires your approval:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px;">
          <p><strong>Vendor:</strong> ${expense.vendorName}</p>
          <p><strong>Amount:</strong> R${expense.amount.toFixed(2)}</p>
          <p><strong>Category:</strong> ${expense.category?.name}</p>
          <p><strong>Date:</strong> ${new Date(expense.expenseDate).toLocaleDateString()}</p>
        </div>
        <a href="${process.env.NEXTAUTH_URL}/admin/accounting/expenses" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Review Expense
        </a>
      </div>
    `;

    return this.sendEmail({
      to: approver.email,
      subject,
      html,
    });
  }

  /**
   * Generate order confirmation email template
   */
  private generateOrderConfirmationTemplate(order: any, customer: any): string {
    const items = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.product.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">R${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">R${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Confirmation</h2>
        <p>Hi ${customer.name},</p>
        <p>Thank you for your order! Here are the details:</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
          <p><strong>Status:</strong> ${order.status}</p>
        </div>

        <h3>Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f0f0f0;">
              <th style="padding: 10px; text-align: left;">Product</th>
              <th style="padding: 10px; text-align: left;">Quantity</th>
              <th style="padding: 10px; text-align: left;">Price</th>
              <th style="padding: 10px; text-align: left;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items}
          </tbody>
        </table>

        <div style="margin-top: 20px; text-align: right;">
          <p><strong>Subtotal:</strong> R${order.subtotal.toFixed(2)}</p>
          <p><strong>Shipping:</strong> R${order.shippingCost.toFixed(2)}</p>
          <p><strong>Total:</strong> R${order.total.toFixed(2)}</p>
        </div>

        <a href="${process.env.NEXTAUTH_URL}/account/orders/${order.id}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 20px;">
          View Order Details
        </a>
      </div>
    `;
  }

  /**
   * Check if service is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

export const sendGridService = new SendGridService(); 