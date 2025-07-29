# Cloudflare Pages Deployment Guide

## Overview
This guide will help you deploy The House Plant Store to Cloudflare Pages with a PlanetScale database.

## Prerequisites
- Cloudflare account (you already have this)
- PlanetScale account (free tier available)
- GitHub repository connected to Cloudflare

## Step 1: Set up PlanetScale Database

1. **Create PlanetScale Account**
   - Go to [planetscale.com](https://planetscale.com)
   - Sign up with GitHub
   - Create a new database called `thehouseplantstore`

2. **Get Database Connection String**
   - In PlanetScale dashboard, go to your database
   - Click "Connect" → "Connect with Prisma"
   - Copy the connection string

## Step 2: Deploy to Cloudflare Pages

1. **Connect Repository**
   - Go to Cloudflare Dashboard → Pages
   - Click "Create a project" → "Connect to Git"
   - Select your GitHub repository

2. **Configure Build Settings**
   ```
   Framework preset: Next.js
   Build command: npm run build:static
   Build output directory: out
   Root directory: / (leave empty)
   ```

3. **Set Environment Variables**
   Add these in Cloudflare Pages settings:
   ```
   DATABASE_URL=your_planetscale_connection_string
   NEXTAUTH_SECRET=your_secret_key
   NEXTAUTH_URL=https://thehouseplantstore.com
   SENDGRID_API_KEY=your_sendgrid_key
   CLOUDINARY_URL=your_cloudinary_url
   PAYSTACK_SECRET_KEY=your_paystack_key
   YOCO_SECRET_KEY=your_yoco_key
   ```

## Step 3: Configure Domain

1. **Custom Domain**
   - In Pages settings, go to "Custom domains"
   - Add `thehouseplantstore.com`
   - Cloudflare will automatically configure DNS

2. **SSL/TLS Settings**
   - Ensure SSL/TLS is set to "Full" or "Full (strict)"
   - Enable "Always Use HTTPS"

## Step 4: Database Migration

1. **Run Migrations**
   ```bash
   # Locally first
   npx prisma db push
   npx prisma generate
   ```

2. **Seed Database**
   ```bash
   npm run db:seed
   ```

## Step 5: Test Deployment

1. **Check Build Logs**
   - Monitor build process in Cloudflare Pages
   - Ensure no errors in build logs

2. **Test Functionality**
   - Visit your domain
   - Test key features (products, cart, checkout)
   - Check admin panel

## Important Notes

### Limitations with Cloudflare Pages
- **Static Export**: Your app uses `output: "export"` which creates static files
- **API Routes**: Some API routes may need to be converted to Cloudflare Functions
- **Server-Side Features**: Authentication and database operations need special handling

### Recommended Architecture
```
Frontend: Cloudflare Pages (Static)
API: Cloudflare Functions (if needed)
Database: PlanetScale (Serverless MySQL)
CDN: Cloudflare (Global)
```

### Environment Variables Checklist
- [ ] DATABASE_URL (PlanetScale)
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL
- [ ] SENDGRID_API_KEY
- [ ] CLOUDINARY_URL
- [ ] PAYSTACK_SECRET_KEY
- [ ] YOCO_SECRET_KEY
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET

## Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify DATABASE_URL format
3. **Image Loading**: Ensure Cloudinary is configured
4. **Authentication**: Check NEXTAUTH configuration

### Performance Optimization
- Enable Cloudflare's image optimization
- Use Cloudflare's caching rules
- Optimize bundle size with code splitting

## Next Steps
1. Set up monitoring and analytics
2. Configure backup strategies
3. Set up staging environment
4. Implement CI/CD pipeline

## Support
- Cloudflare Pages Documentation
- PlanetScale Documentation
- Next.js Static Export Guide