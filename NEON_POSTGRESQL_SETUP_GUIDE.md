# 🌿 Neon PostgreSQL Setup Guide for The House Plant Store

## 🎯 Why Neon PostgreSQL?

✅ **Perfect for your plant store:**
- **Free tier available** - No monthly costs to start
- **Serverless** - Pay only for what you use
- **PostgreSQL** - Full-featured database
- **Great performance** - Fast queries and scaling
- **Prisma compatible** - Full ORM support

## 🚀 Step-by-Step Setup

### 1. Create Neon Account
1. Go to [https://neon.tech](https://neon.tech)
2. Click "Sign Up" (you can use GitHub)
3. Create your account

### 2. Create Database
1. Click "Create New Project"
2. **Project Name:** `thehouseplantstore`
3. **Region:** Choose closest to your users (US East recommended)
4. **Database Name:** `main` (or leave default)
5. Click "Create Project"

### 3. Get Connection String
1. In your project dashboard, click "Connection Details"
2. Copy the **Connection string**
3. It will look like: `postgresql://username:password@host/database`

### 4. Run Setup Script
```bash
npm run setup:neon
```

The script will:
- Ask for your Neon DATABASE_URL
- Generate a NEXTAUTH_SECRET
- Create your `.env` file
- Test the database connection
- Push the schema to Neon
- Seed the database with sample data

### 5. Deploy to Cloudflare
```bash
npm run build:static
wrangler pages deploy .next/export --project-name theplantstore
```

### 6. Set Environment Variables in Cloudflare
```bash
wrangler secret put DATABASE_URL
wrangler secret put NEXTAUTH_SECRET
wrangler secret put NEXTAUTH_URL
# ... add other secrets as needed
```

## 💰 Cost Breakdown

**Free Tier (Perfect for starting):**
- 1 database
- 10GB storage
- 1 billion row reads/month
- 10 million row writes/month
- $0/month

**Paid Tier (When you grow):**
- Pay per use
- Unlimited storage
- Unlimited reads/writes
- ~$0.10 per million reads
- ~$0.50 per million writes

## 🔧 Configuration Files

### wrangler.toml
```toml
name = "thehouseplantstore"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# Pages configuration for static export
pages_build_output_dir = ".next/export"
```

### .env (created by setup script)
```env
DATABASE_URL="postgresql://username:password@host/database"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://thehouseplantstore.com"
# ... other variables
```

## 🎉 Benefits of This Setup

✅ **Completely Free to Start**
- No monthly database costs
- Cloudflare Pages hosting included
- Only pay when you scale

✅ **Production Ready**
- PostgreSQL with full ACID compliance
- Automatic backups
- High availability

✅ **Developer Friendly**
- Full Prisma ORM support
- TypeScript support
- Easy migrations

✅ **Scalable**
- Serverless scaling
- Pay per use pricing
- No server management

## 🚨 Important Notes

1. **Keep your DATABASE_URL secure** - Never commit it to git
2. **Backup regularly** - Neon provides automatic backups
3. **Monitor usage** - Check your Neon dashboard for usage
4. **Set up alerts** - Configure billing alerts in Neon

## 🆘 Troubleshooting

**Connection Issues:**
- Check your DATABASE_URL format
- Ensure your IP is allowed (if using IP restrictions)
- Verify your credentials

**Schema Issues:**
- Run `npx prisma generate` after schema changes
- Run `npx prisma db push` to update the database
- Check Prisma logs for specific errors

**Deployment Issues:**
- Ensure all environment variables are set in Cloudflare
- Check the build logs for errors
- Verify the export directory exists

## 📞 Support

- **Neon Documentation:** [https://neon.tech/docs](https://neon.tech/docs)
- **Prisma Documentation:** [https://prisma.io/docs](https://prisma.io/docs)
- **Cloudflare Pages:** [https://developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)

---

**Ready to get started?** Run `npm run setup:neon` and follow the prompts!