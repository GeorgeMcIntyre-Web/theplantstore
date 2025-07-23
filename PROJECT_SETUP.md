# Project Setup Guide - The Plant Store

## 🎯 Project Overview

This document provides step-by-step instructions for setting up and deploying The Plant Store website.

## 📋 Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** (for version control)
- **Code Editor** (VS Code recommended)

### Required Accounts
- **HOSTAFRICA** - Domain and hosting
- **Cloudflare** - CDN and Pages hosting (recommended)
- **GitHub/GitLab** - Code repository
- **Vercel/Netlify** - Deployment (optional)

## 🚀 Initial Setup

### 1. Environment Setup

```bash
# Check Node.js version
node --version  # Should be 18+

# Check npm version
npm --version

# Install global dependencies
npm install -g vercel
```

### 2. Project Installation

```bash
# Clone repository (replace with actual URL)
git clone <repository-url>
cd theplantstore

# Install dependencies
npm install

# Create environment file
cp env.example .env.local
```

### 3. Environment Configuration

Create `.env.local` file:

```env
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://thehouseplantstore.co.za
NEXT_PUBLIC_SITE_NAME=The Plant Store
NEXT_PUBLIC_SITE_DESCRIPTION=Beautiful plants for your home and garden

# Contact Information
NEXT_PUBLIC_CONTACT_EMAIL=info@theplantstore.com
NEXT_PUBLIC_PHONE=+27 11 123 4567
NEXT_PUBLIC_ADDRESS=Johannesburg, South Africa

# Social Media
NEXT_PUBLIC_FACEBOOK_URL=
NEXT_PUBLIC_INSTAGRAM_URL=
NEXT_PUBLIC_TWITTER_URL=

# Analytics
NEXT_PUBLIC_GA_TRACKING_ID=
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=

# Payment Gateway (for future e-commerce features)
PAYGATE_MERCHANT_ID=
PAYGATE_MERCHANT_KEY=
PAYGATE_ENVIRONMENT=test

# Database (for future features)
DATABASE_URL=

# Email Service (for future features)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Security
JWT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
```

## 🛠️ Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

The site will be available at: http://localhost:3000

### 2. Build for Production

```bash
npm run build
```

This creates a static export in the `out/` directory.

### 3. Test Production Build

```bash
npm run start
```

## 🌐 Domain Configuration

### Current Domain Setup

**Domain:** Thehouseplantstore.co.za  
**Provider:** HOSTAFRICA  
**Nameservers:**
- dan1.host-ww.net
- dan2.host-ww.net

### DNS Configuration Steps

1. **Log into HOSTAFRICA Client Area**
   - URL: https://my.hostafrica.com
   - Username: [Your Username]
   - Password: [Your Password]

2. **Navigate to Domain Management**
   - Go to "Domains" → "My Domains"
   - Click on "Thehouseplantstore.co.za"

3. **Configure Nameservers**
   - Click on "Nameservers" tab
   - Select "Use custom nameservers"
   - Enter the nameserver addresses

4. **SSL Certificate Setup**
   - Go to "SSL" section
   - Enable SSL certificate
   - Configure HTTPS redirects

## 📦 Deployment Options

### Option 1: Cloudflare Pages (Recommended)

#### Step 1: Prepare Git Repository
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Push to GitHub/GitLab
git remote add origin <your-repo-url>
git push -u origin main
```

#### Step 2: Connect to Cloudflare Pages
1. **Login to Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com
   - Go to "Pages" section

2. **Create New Project**
   - Click "Create a project"
   - Select "Connect to Git"
   - Choose your repository (GitHub/GitLab)

3. **Configure Build Settings**
   ```
   Project name: theplantstore
   Production branch: main
   Framework preset: None
   Build command: npm run build
   Build output directory: out
   Root directory: /
   ```

4. **Environment Variables**
   Add the following environment variables:
   ```
   NODE_VERSION: 18
   NPM_VERSION: 9
   ```

#### Step 3: Deploy
1. **Trigger First Deployment**
   - Click "Save and Deploy"
   - Cloudflare will build and deploy automatically

2. **Monitor Build Process**
   - Check build logs for any errors
   - Verify all files are generated correctly

#### Step 4: Configure Custom Domain
1. **Add Custom Domain**
   - Go to project settings
   - Click "Custom domains"
   - Add: thehouseplantstore.co.za

2. **Update DNS Records**
   - Go to Cloudflare DNS settings
   - Add CNAME record:
     - Name: @
     - Target: [your-project].pages.dev
     - Proxy status: Proxied (orange cloud)

3. **SSL Configuration**
   - Cloudflare automatically provides SSL
   - Enable "Always Use HTTPS" in SSL/TLS settings

#### Step 5: Performance Optimization
1. **Enable Cloudflare Features**
   - Auto Minify: JavaScript, CSS, HTML
   - Brotli compression
   - Image optimization
   - Cache optimization

2. **Configure Caching**
   - Set appropriate cache headers
   - Enable edge caching

### Option 2: HOSTAFRICA (Current)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload files to hosting**
   - Connect via FTP/SFTP
   - Upload contents of `out/` directory to `public_html/`

3. **Configure domain**
   - Point domain to hosting directory
   - Enable SSL certificate

### Option 3: Vercel (Alternative)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**
   ```bash
   vercel
   ```

3. **Configure custom domain**
   - Add domain in Vercel dashboard
   - Update DNS records

### Option 4: Netlify

1. **Connect repository**
   - Link GitHub/GitLab repository
   - Configure build settings

2. **Build settings**
   - Build command: `npm run build`
   - Publish directory: `out`

3. **Custom domain**
   - Add domain in Netlify dashboard
   - Update DNS records

## 🔧 Configuration Files

### next.config.js
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
```

### package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  }
}
```

## 📁 File Structure

```
theplantstore/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── favicon.ico         # Site icon
├── components/             # Reusable components
├── lib/                    # Utility functions
├── public/                 # Static assets
├── styles/                 # Additional styles
├── .env.local             # Environment variables
├── .gitignore             # Git ignore rules
├── next.config.js         # Next.js config
├── package.json           # Dependencies
├── README.md              # Project documentation
└── PROJECT_SETUP.md       # This file
```

## 🔒 Security Checklist

- [ ] SSL certificate enabled
- [ ] HTTPS redirects configured
- [ ] Environment variables secured
- [ ] API keys protected
- [ ] Regular backups scheduled
- [ ] Security headers configured

## 📊 Performance Optimization

### Build Optimization
- [ ] Image optimization enabled
- [ ] Code splitting implemented
- [ ] Bundle size minimized
- [ ] Static generation used

### Runtime Optimization
- [ ] CDN configured
- [ ] Caching headers set
- [ ] Gzip compression enabled
- [ ] Database queries optimized

### Cloudflare Optimization
- [ ] Auto minification enabled
- [ ] Edge caching configured
- [ ] Image optimization active
- [ ] Brotli compression enabled

## 🧪 Testing

### Manual Testing Checklist
- [ ] Home page loads correctly
- [ ] Responsive design works on mobile
- [ ] All links function properly
- [ ] Contact information is accurate
- [ ] Performance is acceptable

### Automated Testing
```bash
# Run linting
npm run lint

# Type checking
npm run type-check

# Build test
npm run build
```

## 📈 Analytics Setup

### Google Analytics 4
1. Create GA4 property
2. Add tracking ID to environment variables
3. Implement tracking code

### Google Search Console
1. Add domain to Search Console
2. Verify ownership
3. Submit sitemap

### Facebook Pixel
1. Create Facebook Pixel
2. Add pixel ID to environment variables
3. Implement tracking events

### Cloudflare Analytics
1. Built-in analytics with Cloudflare Pages
2. Real-time metrics
3. Performance insights

## 🛒 E-commerce Integration

### Payment Gateway Setup
1. **PayGate Integration**
   - Register merchant account
   - Configure API credentials
   - Implement payment flow

2. **PayFast Integration**
   - Create PayFast account
   - Configure merchant settings
   - Add payment buttons

### Shopping Cart
- [ ] Cart functionality
- [ ] Product catalog
- [ ] Checkout process
- [ ] Order management

## 📱 Mobile Optimization

### Responsive Design
- [ ] Mobile-first approach
- [ ] Touch-friendly buttons
- [ ] Optimized images
- [ ] Fast loading times

### PWA Features
- [ ] Service worker
- [ ] App manifest
- [ ] Offline functionality
- [ ] Push notifications

## 🔄 Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor performance metrics
- [ ] Backup database weekly
- [ ] Review security logs

### Monitoring
- [ ] Uptime monitoring
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] Security scanning

## 🆘 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear cache
   rm -rf .next
   npm run build
   ```

2. **Deployment Issues**
   - Check build logs
   - Verify environment variables
   - Test locally first

3. **Domain Issues**
   - Verify DNS settings
   - Check SSL certificate
   - Contact hosting provider support

### Cloudflare Specific Issues
1. **Build Failures**
   - Check build logs in Cloudflare dashboard
   - Verify Node.js version compatibility
   - Check for missing dependencies

2. **Domain Issues**
   - Verify DNS records are correct
   - Check domain is added to Cloudflare
   - Ensure SSL is enabled

### Support Contacts
- **Cloudflare Support:** https://support.cloudflare.com/
- **HOSTAFRICA Support:** support@hostafrica.com
- **Development Team:** info@theplantstore.com
- **Emergency Contact:** [Your Phone Number]

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintained by:** Development Team 