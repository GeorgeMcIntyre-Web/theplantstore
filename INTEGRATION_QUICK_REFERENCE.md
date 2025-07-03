# 🔗 Integration Quick Reference

## 📋 Service Overview

| Service | Purpose | Cost | Status |
|---------|---------|------|--------|
| **Google OAuth** | Customer authentication | Free | ✅ Ready |
| **Paystack** | Payment processing | 3.5% + R2.00 | ✅ Ready |
| **SendGrid** | Email delivery | $14.95/month | ✅ Ready |
| **Cloudinary** | Image storage | Free tier | ✅ Ready |
| **Azure AD** | Enterprise auth | $6/user/month | ⚠️ Optional |

---

## 🔐 Authentication

### Google OAuth
- **URL**: https://console.cloud.google.com
- **Setup**: Create project → Enable OAuth → Get credentials
- **Keys**: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Redirect**: `https://yourdomain.com/api/auth/callback/google`

### Azure AD (Optional)
- **URL**: https://portal.azure.com
- **Setup**: Register app → Configure permissions → Get credentials
- **Keys**: `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`
- **Redirect**: `https://yourdomain.com/api/auth/callback/azure-ad`

---

## 💳 Payments

### Paystack
- **URL**: https://paystack.com
- **Setup**: Business account → KYC → API keys
- **Keys**: `PAYSTACK_SECRET_KEY`, `PAYSTACK_PUBLIC_KEY`
- **Webhook**: `https://yourdomain.com/api/payment/webhook`
- **Pricing**: 3.5% + R2.00 per transaction

### Alternatives
- **Yoco**: 2.95% + R0.75 (South Africa)
- **PayGate**: 3.5% + R1.50 (South Africa)
- **Stripe**: 2.9% + 30¢ (International)

---

## 📧 Email

### SendGrid
- **URL**: https://sendgrid.com
- **Setup**: Free account → API key → Domain verification
- **Keys**: `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `SENDGRID_FROM_NAME`
- **Pricing**: Free (100/day) → $14.95/month (50k emails)

### Email Templates Available
- ✅ Order confirmations
- ✅ Password resets
- ✅ Welcome emails
- ✅ Newsletter
- ✅ Expense approvals

### Alternatives
- **Mailgun**: $35/month (50k emails)
- **Amazon SES**: $0.10 per 1k emails
- **Resend**: $20/month (50k emails)

---

## ☁️ File Storage

### Cloudinary
- **URL**: https://cloudinary.com
- **Setup**: Free account → Get credentials
- **Keys**: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- **Pricing**: Free (25GB storage, 25GB bandwidth)

### Features
- ✅ Image optimization
- ✅ Multiple sizes (thumbnail, small, medium, large)
- ✅ Receipt storage for OCR
- ✅ Product images
- ✅ Category images

### Alternatives
- **AWS S3**: $0.023 per GB
- **Google Cloud Storage**: $0.020 per GB
- **Azure Blob**: $0.0184 per GB

---

## 🚀 Quick Setup

### 1. Run Setup Script
```bash
node scripts/setup-integrations.js
```

### 2. Manual Setup
```bash
# Copy environment variables
cp env.example .env

# Edit .env with your keys
nano .env
```

### 3. Test Integrations
```bash
# Start development server
npm run dev

# Test each service
curl http://localhost:3000/api/health
```

---

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signup` - Sign up
- `GET /api/auth/session` - Get session

### Payments
- `POST /api/payment/initialize` - Initialize payment
- `POST /api/payment/verify` - Verify payment
- `POST /api/payment/webhook` - Paystack webhook

### File Upload
- `POST /api/upload/image` - Upload image
- `GET /api/upload/urls/:id` - Get image URLs

### Bank Feed
- `GET /api/accounting/bank-feed` - List accounts
- `POST /api/accounting/bank-feed` - Add account

---

## 📊 Cost Calculator

### Monthly Costs (Estimated)

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Google OAuth | Free | $0 |
| Paystack | Pay-per-use | $50-200 |
| SendGrid | Essentials | $14.95 |
| Cloudinary | Free | $0 |
| **Total** | | **$65-215** |

### Annual Costs
- **Minimum**: ~$780/year
- **Expected**: ~$1,500/year
- **High Volume**: ~$2,500/year

---

## 🛠️ Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check API keys in `.env`
   - Verify redirect URIs
   - Ensure HTTPS in production

2. **Payment Failures**
   - Use test keys for development
   - Check webhook configuration
   - Verify currency settings (ZAR)

3. **Email Not Sending**
   - Check SendGrid API key
   - Verify sender authentication
   - Check spam filters

4. **Image Upload Issues**
   - Check Cloudinary credentials
   - Verify file size limits
   - Check CORS settings

### Support Contacts
- **Paystack**: support@paystack.com
- **SendGrid**: support@sendgrid.com
- **Cloudinary**: support@cloudinary.com
- **Google Cloud**: https://cloud.google.com/support

---

## 📚 Documentation

- **Complete Guide**: `EXTERNAL_INTEGRATIONS_GUIDE.md`
- **OCR & Bank Feed**: `OCR_BANK_FEED_GUIDE.md`
- **Deployment**: `DEPLOYMENT_GUIDE.md`
- **API Reference**: Check individual service files

---

## 🔄 Updates

### Recent Changes
- ✅ Added Paystack payment integration
- ✅ Added SendGrid email service
- ✅ Added Cloudinary file storage
- ✅ Added Google OAuth
- ✅ Added Azure AD (optional)

### Planned Features
- 🔄 Real-time payment notifications
- 🔄 Advanced email templates
- 🔄 Image optimization pipeline
- 🔄 Multi-language support

---

*Last updated: $(date)*
*Version: 1.0.0* 