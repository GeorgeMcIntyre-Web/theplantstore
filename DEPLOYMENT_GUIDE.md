# DigitalOcean Deployment Guide for The Plant Store

## Prerequisites

1. **DigitalOcean Account** with a droplet/server set up
2. **PostgreSQL Database** (either managed database or installed on your droplet)
3. **Domain Name** (optional but recommended)
4. **SSL Certificate** (Let's Encrypt recommended)

## Step 1: Environment Variables Setup

Before pushing to master, you need to configure these environment variables in your DigitalOcean deployment:

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database_name"

# NextAuth Configuration  
NEXTAUTH_SECRET="generate-a-secure-random-string"
NEXTAUTH_URL="https://your-domain.com"

# Environment
NODE_ENV="production"
```

### Optional Environment Variables (for full functionality)

```bash
# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
AZURE_AD_CLIENT_ID="your-azure-client-id"
AZURE_AD_CLIENT_SECRET="your-azure-client-secret"
AZURE_AD_TENANT_ID="your-azure-tenant-id"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"

# Payment Configuration (Yoco)
YOCO_SECRET_KEY="your-yoco-secret-key"
YOCO_PUBLIC_KEY="your-yoco-public-key"

# Shipping Configuration
COURIER_GUY_API_KEY="your-courier-guy-api-key"
ARAMEX_API_KEY="your-aramex-api-key"
POSTNET_API_KEY="your-postnet-api-key"
```

## Step 2: Database Setup

### Option A: DigitalOcean Managed Database
1. Create a PostgreSQL managed database in DigitalOcean
2. Get the connection string from the database dashboard
3. Update your `DATABASE_URL` environment variable

### Option B: Self-hosted PostgreSQL
1. Install PostgreSQL on your droplet
2. Create a database and user
3. Configure the connection string

## Step 3: Domain Configuration

1. **Update `next.config.js`**:
   - Replace `your-domain.com` with your actual domain
   - Add your domain to the `images.domains` array

2. **Configure DNS**:
   - Point your domain to your DigitalOcean droplet's IP address
   - Set up A records for both `your-domain.com` and `www.your-domain.com`

## Step 4: SSL Certificate

Install Let's Encrypt SSL certificate:

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## Step 5: Database Seeding (CRITICAL)

**⚠️ IMPORTANT**: Database seeding is fundamental for the application to work properly. This must be done after migrations but before the first user access.

### Seeding Process

```bash
# 1. Run the main seed script (creates users, categories, products, suppliers)
npx tsx --require dotenv/config scripts/seed.ts

# 2. Run the accounting seed script (creates expense categories, sample expenses)
npx tsx --require dotenv/config scripts/seed-accounting.ts

# 3. Verify seeding was successful
npx prisma studio  # Optional: visual database browser
```

### What Gets Seeded

#### Main Seed (`scripts/seed.ts`)
- **Admin Users**: Super Admin, Plant Manager, Order Manager
- **Sample Customer**: Test customer account
- **Categories**: Indoor Plants, Outdoor Plants, Succulents, Accessories
- **Suppliers**: GreenGrowers Ltd., Urban Jungle Supplies
- **Products**: 15+ sample plants with images, descriptions, pricing
- **Shipping Rates**: Provincial shipping rates for South Africa

#### Accounting Seed (`scripts/seed-accounting.ts`)
- **Expense Categories**: 10 standard business categories
- **Sample Expenses**: 5 realistic expense records
- **Audit Logs**: Complete audit trail for expenses
- **Approval Workflows**: Sample approval records

### Seeding Verification

After seeding, verify these exist in your database:
- [ ] At least 1 Super Admin user
- [ ] 4 product categories
- [ ] 2 suppliers
- [ ] 15+ products with images
- [ ] 10 expense categories
- [ ] Sample expense records

### Troubleshooting Seeding

```bash
# If seeding fails, check:
# 1. Database connection
npx prisma db push

# 2. Environment variables
echo $DATABASE_URL

# 3. Run with verbose logging
DEBUG=* npx tsx --require dotenv/config scripts/seed.ts

# 4. Check for specific errors
npx prisma studio
```

## Step 6: Deployment Pipeline

Your deployment pipeline should:

1. **Pull the latest code** from master branch
2. **Install dependencies**: `npm install`
3. **Generate Prisma client**: `npx prisma generate`
4. **Run database migrations**: `npx prisma db push`
5. **Seed the database**: Run both seed scripts
6. **Build the application**: `npm run build`
7. **Start the application**: `npm start`

## Step 7: Nginx Configuration

Create an Nginx configuration file:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Step 8: Process Manager (PM2)

Install and configure PM2 to keep your app running:

```bash
# Install PM2
npm install -g pm2

# Start your application
pm2 start npm --name "plant-store" -- start

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
```

## Step 9: Testing Your Deployment

1. **Check the application**: Visit `https://your-domain.com`
2. **Test database connection**: Verify admin panel loads
3. **Test authentication**: Try signing up/signing in
4. **Test payment flow**: Use test payment credentials
5. **Check logs**: Monitor application logs for errors

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**:
   - Verify `DATABASE_URL` is correct
   - Check database is accessible from your server
   - Ensure database user has proper permissions

2. **NextAuth Issues**:
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain
   - Ensure OAuth providers are configured correctly

3. **Build Errors**:
   - Check all environment variables are set
   - Verify Node.js version (18.x required)
   - Check for TypeScript errors

4. **Image Loading Issues**:
   - Update `next.config.js` with correct domain
   - Ensure images are in the `public` folder
   - Check file permissions

### Useful Commands:

```bash
# Check application status
pm2 status

# View logs
pm2 logs plant-store

# Restart application
pm2 restart plant-store

# Check database connection
npx prisma db push --preview-feature

# Generate Prisma client
npx prisma generate
```

## Security Checklist

- [ ] Environment variables are properly set
- [ ] SSL certificate is installed and working
- [ ] Database is secured with strong passwords
- [ ] Firewall is configured (only allow necessary ports)
- [ ] Regular backups are set up
- [ ] Monitoring and logging are configured

## Performance Optimization

- [ ] Enable gzip compression in Nginx
- [ ] Set up CDN for static assets
- [ ] Configure caching headers
- [ ] Optimize images
- [ ] Set up monitoring (Uptime Robot, etc.)

## DigitalOcean App Platform Deployment (Recommended)

### Option A: DigitalOcean App Platform (Easiest)

1. **Create App Platform App**:
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select the `main` branch
   - Choose Node.js environment

2. **Configure Environment Variables**:
   ```bash
   DATABASE_URL=your-postgresql-connection-string
   NEXTAUTH_SECRET=your-secure-secret
   NEXTAUTH_URL=https://your-app.ondigitalocean.app
   NODE_ENV=production
   ```

3. **Database Setup**:
   - Create a PostgreSQL database in App Platform
   - Use the provided connection string
   - The database will be automatically managed

4. **Build Commands**:
   ```bash
   Build Command: npm run build
   Run Command: npm start
   ```

5. **Post-Deploy Script** (Add to package.json):
   ```json
   {
     "scripts": {
       "postdeploy": "npx prisma generate && npx prisma db push && npx tsx --require dotenv/config scripts/seed.ts && npx tsx --require dotenv/config scripts/seed-accounting.ts"
     }
   }
   ```

### Option B: DigitalOcean Droplet (More Control)

Follow the steps above for manual deployment on a droplet.

## Next Steps After Deployment

1. **Verify Database Seeding**: Check that all seed data is present
2. **Set up monitoring** and alerting (DigitalOcean Monitoring)
3. **Configure backups** for database and files
4. **Set up CI/CD** for automated deployments
5. **Configure analytics** (Google Analytics, etc.)
6. **Test all features** thoroughly
7. **Set up email notifications** for orders and users
8. **Configure SSL** (automatic with App Platform)
9. **Set up domain** (custom domain configuration) 