#!/bin/bash

# 🌿 Plant Store Cloudflare Setup Script
# This script sets up your Cloudflare infrastructure for thehouseplantstore.com

set -e

echo "🌿 Setting up Cloudflare infrastructure for The House Plant Store..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI is not installed. Please install it first:${NC}"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
echo -e "${BLUE}🔐 Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  You need to log in to Cloudflare first.${NC}"
    echo "Please run: wrangler login"
    exit 1
fi

echo -e "${GREEN}✅ Authenticated with Cloudflare${NC}"

# Create D1 database
echo -e "${BLUE}🗄️  Creating D1 database...${NC}"
DB_OUTPUT=$(wrangler d1 create plant-store-db)
DB_ID=$(echo "$DB_OUTPUT" | grep -o 'Created D1 database .*' | cut -d' ' -f4)

if [ -z "$DB_ID" ]; then
    echo -e "${RED}❌ Failed to create D1 database${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Created D1 database: $DB_ID${NC}"

# Create R2 bucket
echo -e "${BLUE}📦 Creating R2 bucket...${NC}"
if wrangler r2 bucket create plant-store-images; then
    echo -e "${GREEN}✅ Created R2 bucket: plant-store-images${NC}"
else
    echo -e "${YELLOW}⚠️  R2 bucket might already exist or failed to create${NC}"
fi

# Update wrangler.toml with database ID
echo -e "${BLUE}📝 Updating wrangler.toml with database ID...${NC}"
sed -i.bak "s/your-d1-database-id/$DB_ID/g" wrangler.toml
echo -e "${GREEN}✅ Updated wrangler.toml${NC}"

# Run database migrations
echo -e "${BLUE}🔄 Running database migrations...${NC}"
if wrangler d1 execute plant-store-db --file=./migrations/001_initial_schema.sql; then
    echo -e "${GREEN}✅ Database migrations completed${NC}"
else
    echo -e "${RED}❌ Database migrations failed${NC}"
    exit 1
fi

# Create Pages project
echo -e "${BLUE}🚀 Creating Cloudflare Pages project...${NC}"
if wrangler pages project create thehouseplantstore; then
    echo -e "${GREEN}✅ Created Pages project: thehouseplantstore${NC}"
else
    echo -e "${YELLOW}⚠️  Pages project might already exist${NC}"
fi

# Set up environment variables
echo -e "${BLUE}🔧 Setting up environment variables...${NC}"
echo -e "${YELLOW}You'll need to set these secrets manually:${NC}"
echo "wrangler secret put DATABASE_URL"
echo "wrangler secret put R2_ACCESS_KEY_ID"
echo "wrangler secret put R2_SECRET_ACCESS_KEY"
echo "wrangler secret put NEXTAUTH_SECRET"
echo "wrangler secret put PAYSTACK_SECRET_KEY"

# Generate a random secret for NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo -e "${BLUE}🔑 Generated NextAuth secret: $NEXTAUTH_SECRET${NC}"

# Create .env.local file
echo -e "${BLUE}📄 Creating .env.local file...${NC}"
cat > .env.local << EOF
# Database
DATABASE_URL="your-d1-database-url"

# R2 Storage
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="plant-store-images"

# Authentication
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NEXTAUTH_URL="https://thehouseplantstore.com"

# Payment (PayStack for SA)
PAYSTACK_SECRET_KEY="your-paystack-secret"
PAYSTACK_PUBLIC_KEY="your-paystack-public"

# Cloudflare
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_API_TOKEN="your-api-token"
EOF

echo -e "${GREEN}✅ Created .env.local file${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
if npm install; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi

# Build the project
echo -e "${BLUE}🔨 Building the project...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ Project built successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Update your .env.local with actual values"
echo "2. Set up your domain DNS in Cloudflare dashboard"
echo "3. Configure custom domain in Pages dashboard"
echo "4. Set up PayStack payment gateway"
echo "5. Deploy: npm run deploy"
echo ""
echo -e "${BLUE}🔗 Useful links:${NC}"
echo "Cloudflare Dashboard: https://dash.cloudflare.com"
echo "Pages Dashboard: https://dash.cloudflare.com/pages"
echo "D1 Dashboard: https://dash.cloudflare.com/d1"
echo "R2 Dashboard: https://dash.cloudflare.com/r2"
echo ""
echo -e "${GREEN}🌿 Your plant store is ready to grow!${NC}" 