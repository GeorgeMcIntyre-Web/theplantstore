# Wrangler Deployment Guide for The House Plant Store

## Overview
This guide covers deploying your Next.js plant store application to Cloudflare Pages using Wrangler CLI, with PlanetScale database integration.

## Prerequisites
- Cloudflare account with `thehouseplantstore.com` domain
- PlanetScale database account
- Node.js 18+ installed
- Git repository set up

## Step 1: Install and Authenticate Wrangler

### Install Wrangler CLI
```bash
npm install -g wrangler
```

### Authenticate with Cloudflare
```bash
wrangler login
```

## Step 2: Set up PlanetScale Database

### Create PlanetScale Database
1. Go to [planetscale.com](https://planetscale.com)
2. Create new database: `thehouseplantstore`
3. Get connection string from "Connect" → "Connect with Prisma"

### Update Environment Variables
Create `.env` file with:
```env
DATABASE_URL="mysql://your-planetscale-connection-string"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://thehouseplantstore.com"
SENDGRID_API_KEY="your-sendgrid-key"
CLOUDINARY_URL="your-cloudinary-url"
PAYSTACK_SECRET_KEY="your-paystack-key"
YOCO_SECRET_KEY="your-yoco-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Step 3: Build and Test Locally

### Install Dependencies
```bash
npm install
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Test Static Build
```bash
npm run build:static
```

### Test Locally
```bash
npx serve out
```

## Step 4: Deploy with Wrangler

### Option A: Automated Deployment Script
```bash
node deploy-wrangler.js
```

### Option B: Manual Deployment Steps

#### 1. Set Environment Secrets
```bash
# Set each secret individually
wrangler secret put DATABASE_URL
wrangler secret put NEXTAUTH_SECRET
wrangler secret put NEXTAUTH_URL
wrangler secret put SENDGRID_API_KEY
wrangler secret put CLOUDINARY_URL
wrangler secret put PAYSTACK_SECRET_KEY
wrangler secret put YOCO_SECRET_KEY
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
```

#### 2. Deploy to Cloudflare Pages
```bash
wrangler pages deploy out --project-name thehouseplantstore
```

#### 3. Add Custom Domain
```bash
wrangler pages domain add thehouseplantstore thehouseplantstore.com
wrangler pages domain add thehouseplantstore www.thehouseplantstore.com
```

## Step 5: Database Migration

### Push Schema to PlanetScale
```bash
npx prisma db push
```

### Seed Database
```bash
npm run db:seed
```

## Step 6: Verify Deployment

### Check Deployment Status
```bash
wrangler pages deployment list --project-name thehouseplantstore
```

### View Logs
```bash
wrangler pages deployment tail --project-name thehouseplantstore
```

### Test Domain
Visit: https://thehouseplantstore.com

## Wrangler Commands Reference

### Project Management
```bash
# List all projects
wrangler pages project list

# Create new project
wrangler pages project create thehouseplantstore

# Delete project
wrangler pages project delete thehouseplantstore
```

### Deployment Management
```bash
# Deploy
wrangler pages deploy out --project-name thehouseplantstore

# List deployments
wrangler pages deployment list --project-name thehouseplantstore

# View specific deployment
wrangler pages deployment tail --project-name thehouseplantstore --deployment-id <id>

# Rollback to previous deployment
wrangler pages deployment rollback --project-name thehouseplantstore --deployment-id <id>
```

### Domain Management
```bash
# List domains
wrangler pages domain list --project-name thehouseplantstore

# Add domain
wrangler pages domain add thehouseplantstore thehouseplantstore.com

# Remove domain
wrangler pages domain remove thehouseplantstore thehouseplantstore.com
```

### Environment Variables
```bash
# List secrets
wrangler secret list

# Set secret
wrangler secret put SECRET_NAME

# Delete secret
wrangler secret delete SECRET_NAME
```

## Configuration Files

### wrangler.toml
```toml
name = "thehouseplantstore"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npm run build:static"
output_directory = "out"

[env.production]
name = "thehouseplantstore-production"
route = "thehouseplantstore.com/*"

[pages]
custom_domains = [
  { domain = "thehouseplantstore.com", zone_id = "" },
  { domain = "www.thehouseplantstore.com", zone_id = "" }
]
```

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
wrangler pages deployment tail --project-name thehouseplantstore

# Test build locally
npm run build:static
```

#### Database Connection Issues
```bash
# Test database connection
npx prisma db push --preview-feature

# Check Prisma client
npx prisma generate
```

#### Domain Issues
```bash
# Check domain status
wrangler pages domain list --project-name thehouseplantstore

# Verify DNS settings in Cloudflare dashboard
```

### Performance Optimization

#### Enable Cloudflare Features
- Image optimization
- Minification
- Brotli compression
- Edge caching

#### Monitor Performance
```bash
# View analytics
wrangler analytics

# Check bandwidth usage
wrangler analytics bandwidth
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npx prisma generate
      - run: npm run build:static
      - uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy out --project-name thehouseplantstore
```

## Monitoring and Maintenance

### Regular Tasks
1. **Monitor deployments**: Check for failed builds
2. **Update dependencies**: Keep packages current
3. **Database backups**: PlanetScale handles this automatically
4. **Performance monitoring**: Use Cloudflare analytics

### Security Checklist
- [ ] Environment variables are set as secrets
- [ ] SSL/TLS is enabled
- [ ] Domain security settings are configured
- [ ] API keys are rotated regularly

## Support Resources
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [PlanetScale Documentation](https://planetscale.com/docs)
- [Next.js Static Export Guide](https://nextjs.org/docs/advanced-features/static-html-export)