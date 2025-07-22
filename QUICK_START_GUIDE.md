# 🚀 Quick Start Guide - The House Plant Store

## Domain: thehouseplantstore.com ✅

### Prerequisites
- Node.js 18+ installed
- Cloudflare account
- Cursor IDE (or any code editor)

### Step 1: Initial Setup (5 minutes)

1. **Install Wrangler CLI globally:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Run the automated setup script:**
   ```bash
   # For Windows (PowerShell):
   .\scripts\setup-cloudflare.ps1
   
   # For Mac/Linux:
   ./scripts/setup-cloudflare.sh
   ```

### Step 2: Configure Environment (2 minutes)

1. **Update `.env.local` with your actual values:**
   - Get R2 credentials from Cloudflare dashboard
   - Set up PayStack account for payments
   - Add your Cloudflare account details

2. **Set Cloudflare secrets:**
   ```bash
   wrangler secret put DATABASE_URL
   wrangler secret put R2_ACCESS_KEY_ID
   wrangler secret put R2_SECRET_ACCESS_KEY
   wrangler secret put NEXTAUTH_SECRET
   wrangler secret put PAYSTACK_SECRET_KEY
   ```

### Step 3: Domain Configuration (3 minutes)

1. **In Cloudflare Dashboard:**
   - Go to DNS settings for `thehouseplantstore.com`
   - Add CNAME record: `www` → `thehouseplantstore.pages.dev`

2. **In Pages Dashboard:**
   - Go to your project settings
   - Add custom domain: `thehouseplantstore.com`
   - Add custom domain: `www.thehouseplantstore.com`

### Step 4: Deploy (2 minutes)

```bash
npm run deploy
```

### Step 5: Verify (1 minute)

Visit `https://thehouseplantstore.com` to see your live site!

---

## 📊 Cost Breakdown

| Service | Monthly Cost (ZAR) |
|---------|-------------------|
| Domain | R16 |
| D1 Database | R0-90 |
| Pages Hosting | R0 |
| R2 Storage | R0-30 |
| **Total** | **R16-136** |

---

## 🔧 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Deploy to production
npm run deploy

# Deploy to staging
npm run deploy:staging

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

---

## 📁 Project Structure

```
theplantstore/
├── src/
│   ├── components/     # React components
│   ├── lib/           # Database, R2, utilities
│   ├── pages/         # Next.js pages & API routes
│   └── styles/        # CSS files
├── public/            # Static assets
├── migrations/        # Database migrations
├── scripts/           # Setup & utility scripts
├── wrangler.toml      # Cloudflare configuration
└── package.json       # Dependencies
```

---

## 🌐 Key URLs

- **Live Site**: https://thehouseplantstore.com
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Pages Dashboard**: https://dash.cloudflare.com/pages
- **D1 Database**: https://dash.cloudflare.com/d1
- **R2 Storage**: https://dash.cloudflare.com/r2

---

## 🆘 Troubleshooting

### Common Issues:

1. **"Wrangler not found"**
   ```bash
   npm install -g wrangler
   ```

2. **"Authentication failed"**
   ```bash
   wrangler login
   ```

3. **"Database connection failed"**
   - Check your D1 database ID in `wrangler.toml`
   - Verify secrets are set correctly

4. **"Build failed"**
   ```bash
   npm install
   npm run build
   ```

---

## 🎯 Next Steps

1. **Add Products**: Use the admin interface to add your plant inventory
2. **Configure Payments**: Set up PayStack for South African payments
3. **Customize Design**: Modify components in `src/components/`
4. **Add Analytics**: Enable Cloudflare Web Analytics
5. **SEO Optimization**: Add meta tags and sitemap

---

## 📞 Support

- **Documentation**: Check `CLOUDFLARE_DEPLOYMENT_PLAN.md` for detailed setup
- **Issues**: Create GitHub issues for bugs
- **Questions**: Check Cloudflare documentation

---

**🌿 Your plant store is ready to grow! Happy coding! 🌿** 