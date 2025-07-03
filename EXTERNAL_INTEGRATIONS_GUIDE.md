# External Integrations Setup Guide

## Overview

This guide covers all external service integrations required for The House Plant Store, including authentication, payments, email, and cloud services.

## 🔐 Authentication Services

### 1. Microsoft Azure Active Directory (Azure AD)

#### **What It Is**
- Enterprise-grade identity and access management
- Single Sign-On (SSO) for Microsoft 365 users
- Advanced security features and compliance

#### **Pricing**
- **Free Tier**: Up to 50,000 users, 10 applications
- **Premium P1**: $6/user/month - Advanced features
- **Premium P2**: $9/user/month - Identity protection

#### **Setup Process**

1. **Create Azure Account**
   ```bash
   # Visit: https://portal.azure.com
   # Sign up with Microsoft account
   # Verify email and phone
   ```

2. **Register Application**
   ```bash
   # Go to Azure Portal → Azure Active Directory → App registrations
   # Click "New registration"
   # Name: "The House Plant Store"
   # Supported account types: "Accounts in any organizational directory"
   # Redirect URI: "https://yourdomain.com/api/auth/callback/azure-ad"
   ```

3. **Configure Authentication**
   ```bash
   # Get Client ID and Tenant ID from Overview
   # Go to Certificates & secrets → New client secret
   # Copy the secret value (store securely)
   ```

4. **Environment Variables**
   ```env
   AZURE_AD_CLIENT_ID=your-client-id
   AZURE_AD_CLIENT_SECRET=your-client-secret
   AZURE_AD_TENANT_ID=your-tenant-id
   ```

#### **NextAuth.js Configuration**
```typescript
// lib/auth.ts
import AzureADProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
};
```

#### **Alternatives**
- **Auth0**: $23/month for 7,500 users
- **Okta**: $2/user/month
- **Cognito**: AWS service, pay-per-use

---

### 2. Google OAuth

#### **What It Is**
- Google Sign-In for customers
- Gmail integration for business users
- Google Workspace integration

#### **Pricing**
- **Free**: Up to 100 users
- **Google Workspace**: $6/user/month

#### **Setup Process**

1. **Create Google Cloud Project**
   ```bash
   # Visit: https://console.cloud.google.com
   # Create new project: "the-plant-store"
   # Enable billing (required for some APIs)
   ```

2. **Enable OAuth 2.0**
   ```bash
   # Go to APIs & Services → OAuth consent screen
   # User Type: External
   # App name: "The House Plant Store"
   # User support email: your-email@domain.com
   # Developer contact: your-email@domain.com
   ```

3. **Create OAuth Credentials**
   ```bash
   # Go to APIs & Services → Credentials
   # Create Credentials → OAuth 2.0 Client IDs
   # Application type: Web application
   # Authorized redirect URIs:
   # - https://yourdomain.com/api/auth/callback/google
   # - http://localhost:3000/api/auth/callback/google (development)
   ```

4. **Environment Variables**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

#### **NextAuth.js Configuration**
```typescript
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
};
```

---

## 💳 Payment Processing

### 3. Paystack Integration

#### **What It Is**
- Leading payment processor in Africa
- Supports cards, bank transfers, mobile money
- Excellent for South African market

#### **Pricing**
- **Transaction Fee**: 1.5% + ₦100 (Nigeria) / 3.5% (International)
- **South Africa**: 3.5% + R2.00 per transaction
- **No monthly fees**
- **No setup fees**

#### **Setup Process**

1. **Create Paystack Account**
   ```bash
   # Visit: https://paystack.com
   # Sign up for business account
   # Verify business details
   # Complete KYC requirements
   ```

2. **Get API Keys**
   ```bash
   # Go to Settings → API Keys & Webhooks
   # Copy Test Secret Key (for development)
   # Copy Live Secret Key (for production)
   # Copy Public Key
   ```

3. **Environment Variables**
   ```env
   PAYSTACK_SECRET_KEY=sk_test_... # or sk_live_...
   PAYSTACK_PUBLIC_KEY=pk_test_... # or pk_live_...
   PAYSTACK_WEBHOOK_SECRET=your-webhook-secret
   ```

4. **Install SDK**
   ```bash
   npm install paystack
   ```

#### **Implementation Example**
```typescript
// lib/paystack.ts
import Paystack from 'paystack';

const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY!);

export const createTransaction = async (amount: number, email: string) => {
  try {
    const transaction = await paystack.transaction.initialize({
      amount: amount * 100, // Convert to kobo
      email,
      currency: 'ZAR',
      callback_url: 'https://yourdomain.com/payment/verify',
    });
    return transaction;
  } catch (error) {
    console.error('Paystack error:', error);
    throw error;
  }
};
```

#### **Alternatives**
- **Stripe**: 2.9% + 30¢ per transaction
- **PayPal**: 2.9% + fixed fee
- **Yoco**: 2.95% + R0.75 (South Africa)
- **PayGate**: 3.5% + R1.50 (South Africa)

---

## 📧 Email Services

### 4. Email Service Setup

#### **Current Status**
The current email setup uses basic SMTP. For production, we need a reliable email service.

#### **Recommended: SendGrid**

**Pricing**
- **Free**: 100 emails/day
- **Essentials**: $14.95/month for 50k emails
- **Pro**: $89.95/month for 100k emails

**Setup Process**

1. **Create SendGrid Account**
   ```bash
   # Visit: https://sendgrid.com
   # Sign up for free account
   # Verify email address
   ```

2. **Create API Key**
   ```bash
   # Go to Settings → API Keys
   # Create API Key → Full Access
   # Copy the API key
   ```

3. **Verify Domain**
   ```bash
   # Go to Settings → Sender Authentication
   # Domain Authentication → Add Domain
   # Follow DNS setup instructions
   ```

4. **Environment Variables**
   ```env
   SENDGRID_API_KEY=SG.your-api-key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=The House Plant Store
   ```

#### **Implementation**
```typescript
// lib/email/sendgrid.ts
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail = async (to: string, subject: string, html: string) => {
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: process.env.SENDGRID_FROM_NAME!,
    },
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email error:', error);
    throw error;
  }
};
```

#### **Alternatives**
- **Mailgun**: $35/month for 50k emails
- **Amazon SES**: $0.10 per 1k emails
- **Postmark**: $15/month for 10k emails
- **Resend**: $20/month for 50k emails

---

## ☁️ Cloud Services

### 5. File Storage (Images)

#### **Recommended: Cloudinary**

**Pricing**
- **Free**: 25 GB storage, 25 GB bandwidth
- **Plus**: $89/month for 225 GB storage
- **Advanced**: $224/month for 675 GB storage

**Setup Process**

1. **Create Cloudinary Account**
   ```bash
   # Visit: https://cloudinary.com
   # Sign up for free account
   # Get cloud name, API key, and secret
   ```

2. **Environment Variables**
   ```env
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

3. **Implementation**
```typescript
// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (file: Buffer, folder: string) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};
```

#### **Alternatives**
- **AWS S3**: $0.023 per GB
- **Google Cloud Storage**: $0.020 per GB
- **Azure Blob Storage**: $0.0184 per GB

---

## 🔧 Environment Configuration

### Complete `.env` File

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/theplantstore_dev"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Azure AD
AZURE_AD_CLIENT_ID="your-azure-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-client-secret"
AZURE_AD_TENANT_ID="your-azure-tenant-id"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Paystack
PAYSTACK_SECRET_KEY="sk_test_..."
PAYSTACK_PUBLIC_KEY="pk_test_..."
PAYSTACK_WEBHOOK_SECRET="your-webhook-secret"

# Email (SendGrid)
SENDGRID_API_KEY="SG.your-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
SENDGRID_FROM_NAME="The House Plant Store"

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Shipping (Courier Guy)
COURIER_GUY_API_KEY="your-courier-guy-key"
COURIER_GUY_USERNAME="your-username"
COURIER_GUY_PASSWORD="your-password"

# Yoco Payment (Alternative)
YOCO_SECRET_KEY="sk_test_..."
YOCO_PUBLIC_KEY="pk_test_..."
```

---

## 📋 Setup Checklist

### Phase 1: Essential Services
- [ ] Google OAuth setup
- [ ] Paystack account creation
- [ ] SendGrid email service
- [ ] Cloudinary file storage

### Phase 2: Enterprise Features
- [ ] Azure AD setup (if needed)
- [ ] Advanced email templates
- [ ] Payment webhook handling
- [ ] File upload optimization

### Phase 3: Monitoring & Analytics
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Performance monitoring
- [ ] Uptime monitoring

---

## 💰 Cost Summary

### Monthly Costs (Estimated)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Google OAuth | Free | $0 |
| Paystack | Pay-per-use | ~$50-200 |
| SendGrid | Essentials | $14.95 |
| Cloudinary | Free | $0 |
| **Total** | | **~$65-215** |

### Annual Costs
- **Minimum**: ~$780/year
- **Expected**: ~$1,500/year
- **High Volume**: ~$2,500/year

---

## 🚀 Deployment Checklist

### Pre-Deployment
1. [ ] All API keys configured
2. [ ] Domain verification completed
3. [ ] SSL certificates installed
4. [ ] Environment variables set
5. [ ] Database migrations run

### Post-Deployment
1. [ ] Test all integrations
2. [ ] Monitor error logs
3. [ ] Verify email delivery
4. [ ] Test payment processing
5. [ ] Check file uploads

---

## 🆘 Support & Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check API keys
   - Verify redirect URIs
   - Ensure HTTPS in production

2. **Payment Failures**
   - Test with Paystack test keys
   - Check webhook configuration
   - Verify currency settings

3. **Email Not Sending**
   - Check SendGrid API key
   - Verify sender authentication
   - Check spam filters

### Support Contacts
- **Paystack**: support@paystack.com
- **SendGrid**: support@sendgrid.com
- **Cloudinary**: support@cloudinary.com
- **Google Cloud**: https://cloud.google.com/support

---

*This guide covers all external integrations. Update as services are added or changed.* 