import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private resend: Resend | null;
  private nodemailerTransporter: nodemailer.Transporter;
  private defaultFrom: string;

  constructor() {
    // Initialize Resend (primary provider) - only if API key is provided
    if (process.env.RESEND_API_KEY) {
      this.resend = new Resend(process.env.RESEND_API_KEY);
    } else {
      console.warn('RESEND_API_KEY not provided - email service will use Nodemailer fallback only');
      this.resend = null as any;
    }
    
    // Initialize Nodemailer (fallback provider)
    this.nodemailerTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    this.defaultFrom = process.env.EMAIL_FROM || 'noreply@theplantstore.co.za';
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Try Resend first (modern, reliable)
      const success = await this.sendWithResend(options);
      if (success) return true;

      // Fallback to Nodemailer
      return await this.sendWithNodemailer(options);
    } catch (error) {
      console.error('Email sending failed:', error);
      return false;
    }
  }

  private async sendWithResend(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.resend) {
        return false;
      }
      
      const { data, error } = await this.resend.emails.send({
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: options.attachments?.map(att => ({
          filename: att.filename,
          content: att.content,
          contentType: att.contentType,
        })),
      });

      if (error) {
        console.error('Resend error:', error);
        return false;
      }

      console.log('Email sent via Resend:', data?.id);
      return true;
    } catch (error) {
      console.error('Resend sending failed:', error);
      return false;
    }
  }

  private async sendWithNodemailer(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        attachments: options.attachments,
      };

      const info = await this.nodemailerTransporter.sendMail(mailOptions);
      console.log('Email sent via Nodemailer:', info.messageId);
      return true;
    } catch (error) {
      console.error('Nodemailer sending failed:', error);
      return false;
    }
  }

  // Template-based email sending
  async sendTemplate(
    template: EmailTemplate,
    to: string | string[],
    data: Record<string, any> = {},
    options: Partial<EmailOptions> = {}
  ): Promise<boolean> {
    const processedTemplate = this.processTemplate(template, data);
    
    return this.sendEmail({
      to,
      subject: processedTemplate.subject,
      html: processedTemplate.html,
      text: processedTemplate.text,
      ...options,
    });
  }

  private processTemplate(template: EmailTemplate, data: Record<string, any>): EmailTemplate {
    const processString = (str: string): string => {
      return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] || match;
      });
    };

    return {
      subject: processString(template.subject),
      html: processString(template.html),
      text: template.text ? processString(template.text) : undefined,
    };
  }

  // Email verification
  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${token}`;
    
    return this.sendTemplate(
      {
        subject: 'Verify your email - The House Plant Store',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d3748;">Welcome to The House Plant Store! 🌱</h2>
            <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #718096;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 14px;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        `,
      },
      email
    );
  }

  // Order confirmation
  async sendOrderConfirmation(order: any, user: any): Promise<boolean> {
    const orderItems = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${item.productName}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">R${Number(item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    return this.sendTemplate(
      {
        subject: `Order Confirmation #${order.orderNumber} - The House Plant Store`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d3748;">Thank you for your order! 🌿</h2>
            <p>Hi ${user.name},</p>
            <p>We've received your order and are preparing it for shipment. Here are your order details:</p>
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Order #${order.orderNumber}</h3>
              <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-ZA')}</p>
              <p><strong>Status:</strong> ${order.status}</p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background-color: #48bb78; color: white;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${orderItems}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                  <td style="padding: 10px; text-align: right;">R${Number(order.subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Shipping:</td>
                  <td style="padding: 10px; text-align: right;">R${Number(order.shippingCost || 0).toFixed(2)}</td>
                </tr>
                <tr style="background-color: #f7fafc;">
                  <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 10px; text-align: right; font-weight: bold;">R${Number(order.totalAmount).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0;">Shipping Address</h4>
              <p>${order.shippingAddress?.firstName} ${order.shippingAddress?.lastName}</p>
              <p>${order.shippingAddress?.addressLine1}</p>
              ${order.shippingAddress?.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
              <p>${order.shippingAddress?.city}, ${order.shippingAddress?.province} ${order.shippingAddress?.postalCode}</p>
              <p>${order.shippingAddress?.phone}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/account/orders/${order.id}" 
                 style="background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Order Details
              </a>
            </div>

            <p>We'll send you a tracking number once your order ships.</p>
            <p>Thank you for choosing The House Plant Store!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 14px;">
              Questions? Contact us at support@theplantstore.co.za
            </p>
          </div>
        `,
      },
      user.email
    );
  }

  // Shipping notification
  async sendShippingNotification(order: any, user: any, trackingNumber: string): Promise<boolean> {
    return this.sendTemplate(
      {
        subject: `Your order #${order.orderNumber} has shipped! 🚚`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d3748;">Your plants are on the way! 🌱</h2>
            <p>Hi ${user.name},</p>
            <p>Great news! Your order #${order.orderNumber} has been shipped and is on its way to you.</p>
            
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin-top: 0;">Tracking Information</h4>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p><strong>Courier:</strong> ${order.shippingProvider || 'The Courier Guy'}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/track-order" 
                 style="background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Track Your Order
              </a>
            </div>

            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #856404;">🌿 Plant Care Tips</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Unpack your plants immediately upon delivery</li>
                <li>Water them according to the care instructions provided</li>
                <li>Place them in appropriate lighting conditions</li>
                <li>Contact us if you have any questions about plant care</li>
              </ul>
            </div>

            <p>We hope you love your new plants!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 14px;">
              Questions? Contact us at support@theplantstore.co.za
            </p>
          </div>
        `,
      },
      user.email
    );
  }

  // Password reset
  async sendPasswordReset(email: string, token: string): Promise<boolean> {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`;
    
    return this.sendTemplate(
      {
        subject: 'Reset your password - The House Plant Store',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d3748;">Password Reset Request 🌱</h2>
            <p>We received a request to reset your password for your The House Plant Store account.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #718096;">${resetUrl}</p>
            
            <p>This link will expire in 1 hour for security reasons.</p>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 14px;">
              Questions? Contact us at support@theplantstore.co.za
            </p>
          </div>
        `,
      },
      email
    );
  }

  // Newsletter subscription
  async sendNewsletter(email: string, content: string): Promise<boolean> {
    return this.sendTemplate(
      {
        subject: 'The House Plant Store Newsletter 🌿',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2d3748;">The House Plant Store Newsletter</h2>
            <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${content}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/collections" 
                 style="background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Shop Now
              </a>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;">
            <p style="color: #718096; font-size: 14px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe?email=${encodeURIComponent(email)}" 
                 style="color: #718096;">Unsubscribe</a> | 
              Contact us at support@theplantstore.co.za
            </p>
          </div>
        `,
      },
      email
    );
  }
}

export const emailService = new EmailService(); 