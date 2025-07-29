# PlanetScale Setup Guide

## Step 1: Create PlanetScale Account

1. Go to [https://planetscale.com](https://planetscale.com)
2. Click "Start for free"
3. Sign up with your GitHub account

## Step 2: Create Database

1. Click "New database"
2. Name: `thehouseplantstore`
3. Region: Choose closest to your users (e.g., US East for North America)
4. Click "Create database"

## Step 3: Get Connection String

1. In your database dashboard, click "Connect"
2. Select "Connect with Prisma"
3. Copy the connection string (it looks like: `mysql://username:password@host/database`)

## Step 4: Update Environment Variables

Create or update your `.env` file:

```env
# Database
DATABASE_URL="mysql://your-planetscale-connection-string"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://thehouseplantstore.com"

# Email
SENDGRID_API_KEY="your-sendgrid-key"

# Cloud Storage
CLOUDINARY_URL="your-cloudinary-url"

# Payment Processors
PAYSTACK_SECRET_KEY="your-paystack-key"
YOCO_SECRET_KEY="your-yoco-key"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

## Step 5: Test Connection

After updating the DATABASE_URL, run:

```bash
npx prisma generate
npx prisma db push
```

## Step 6: Seed Database

```bash
npm run db:seed
```

## Step 7: Continue Migration

Once PlanetScale is set up, run:

```bash
npm run migrate:d1-to-planetscale
```

## Important Notes

- **Free Tier**: PlanetScale free tier includes 1 database, 1 billion reads/month, 10 million writes/month
- **Backups**: Automatic daily backups included
- **Branching**: You can create development branches for safe schema changes
- **Connection**: Use the Prisma connection string, not the direct MySQL one

## Troubleshooting

### Connection Issues
- Ensure the connection string is correct
- Check that your IP is not blocked
- Verify the database name matches exactly

### Schema Issues
- PlanetScale uses MySQL, not PostgreSQL
- Some PostgreSQL-specific features may need adjustment
- Use `npx prisma db push` instead of migrations for initial setup