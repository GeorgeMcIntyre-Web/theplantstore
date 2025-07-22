# 🌿 Plant Store Cloudflare Setup Script (PowerShell)
# This script sets up your Cloudflare infrastructure for thehouseplantstore.com

param(
    [switch]$SkipBuild
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🌿 Setting up Cloudflare infrastructure for The House Plant Store..." -ForegroundColor Green

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Check if wrangler is installed
Write-Host "🔍 Checking if Wrangler CLI is installed..." -ForegroundColor $Blue
try {
    $null = Get-Command wrangler -ErrorAction Stop
    Write-Host "✅ Wrangler CLI is installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Wrangler CLI is not installed. Please install it first:" -ForegroundColor $Red
    Write-Host "npm install -g wrangler" -ForegroundColor $Yellow
    exit 1
}

# Check if user is logged in to Cloudflare
Write-Host "🔐 Checking Cloudflare authentication..." -ForegroundColor $Blue
try {
    $null = wrangler whoami 2>$null
    Write-Host "✅ Authenticated with Cloudflare" -ForegroundColor $Green
} catch {
    Write-Host "⚠️  You need to log in to Cloudflare first." -ForegroundColor $Yellow
    Write-Host "Please run: wrangler login" -ForegroundColor $Yellow
    exit 1
}

# Create D1 database
Write-Host "🗄️  Creating D1 database..." -ForegroundColor $Blue
try {
    $DBOutput = wrangler d1 create plant-store-db
    $DBId = ($DBOutput | Select-String "Created D1 database .*" | ForEach-Object { $_.Matches[0].Value -split " " | Select-Object -Last 1 })
    
    if (-not $DBId) {
        throw "Failed to extract database ID"
    }
    
    Write-Host "✅ Created D1 database: $DBId" -ForegroundColor $Green
} catch {
    Write-Host "❌ Failed to create D1 database" -ForegroundColor $Red
    Write-Host $_.Exception.Message -ForegroundColor $Red
    exit 1
}

# Create R2 bucket
Write-Host "📦 Creating R2 bucket..." -ForegroundColor $Blue
try {
    $null = wrangler r2 bucket create plant-store-images
    Write-Host "✅ Created R2 bucket: plant-store-images" -ForegroundColor $Green
} catch {
    Write-Host "⚠️  R2 bucket might already exist or failed to create" -ForegroundColor $Yellow
}

# Update wrangler.toml with database ID
Write-Host "📝 Updating wrangler.toml with database ID..." -ForegroundColor $Blue
try {
    $wranglerContent = Get-Content "wrangler.toml" -Raw
    $wranglerContent = $wranglerContent -replace "your-d1-database-id", $DBId
    Set-Content "wrangler.toml" $wranglerContent
    Write-Host "✅ Updated wrangler.toml" -ForegroundColor $Green
} catch {
    Write-Host "❌ Failed to update wrangler.toml" -ForegroundColor $Red
    exit 1
}

# Run database migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor $Blue
try {
    $null = wrangler d1 execute plant-store-db --file=./migrations/001_initial_schema.sql
    Write-Host "✅ Database migrations completed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Database migrations failed" -ForegroundColor $Red
    exit 1
}

# Create Pages project
Write-Host "🚀 Creating Cloudflare Pages project..." -ForegroundColor $Blue
try {
    $null = wrangler pages project create thehouseplantstore
    Write-Host "✅ Created Pages project: thehouseplantstore" -ForegroundColor $Green
} catch {
    Write-Host "⚠️  Pages project might already exist" -ForegroundColor $Yellow
}

# Set up environment variables
Write-Host "🔧 Setting up environment variables..." -ForegroundColor $Blue
Write-Host "You'll need to set these secrets manually:" -ForegroundColor $Yellow
Write-Host "wrangler secret put DATABASE_URL" -ForegroundColor $Yellow
Write-Host "wrangler secret put R2_ACCESS_KEY_ID" -ForegroundColor $Yellow
Write-Host "wrangler secret put R2_SECRET_ACCESS_KEY" -ForegroundColor $Yellow
Write-Host "wrangler secret put NEXTAUTH_SECRET" -ForegroundColor $Yellow
Write-Host "wrangler secret put PAYSTACK_SECRET_KEY" -ForegroundColor $Yellow

# Generate a random secret for NextAuth
$NextAuthSecret = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host "🔑 Generated NextAuth secret: $NextAuthSecret" -ForegroundColor $Blue

# Create .env.local file
Write-Host "📄 Creating .env.local file..." -ForegroundColor $Blue
$envContent = @"
# Database
DATABASE_URL="your-d1-database-url"

# R2 Storage
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="plant-store-images"

# Authentication
NEXTAUTH_SECRET="$NextAuthSecret"
NEXTAUTH_URL="https://thehouseplantstore.com"

# Payment (PayStack for SA)
PAYSTACK_SECRET_KEY="your-paystack-secret"
PAYSTACK_PUBLIC_KEY="your-paystack-public"

# Cloudflare
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_API_TOKEN="your-api-token"
"@

Set-Content ".env.local" $envContent
Write-Host "✅ Created .env.local file" -ForegroundColor $Green

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor $Blue
try {
    $null = npm install
    Write-Host "✅ Dependencies installed" -ForegroundColor $Green
} catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor $Red
    exit 1
}

# Build the project (unless skipped)
if (-not $SkipBuild) {
    Write-Host "🔨 Building the project..." -ForegroundColor $Blue
    try {
        $null = npm run build
        Write-Host "✅ Project built successfully" -ForegroundColor $Green
    } catch {
        Write-Host "❌ Build failed" -ForegroundColor $Red
        exit 1
    }
} else {
    Write-Host "⏭️  Skipping build as requested" -ForegroundColor $Yellow
}

Write-Host "🎉 Setup completed successfully!" -ForegroundColor $Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor $Blue
Write-Host "1. Update your .env.local with actual values" -ForegroundColor $Yellow
Write-Host "2. Set up your domain DNS in Cloudflare dashboard" -ForegroundColor $Yellow
Write-Host "3. Configure custom domain in Pages dashboard" -ForegroundColor $Yellow
Write-Host "4. Set up PayStack payment gateway" -ForegroundColor $Yellow
Write-Host "5. Deploy: npm run deploy" -ForegroundColor $Yellow
Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor $Blue
Write-Host "Cloudflare Dashboard: https://dash.cloudflare.com" -ForegroundColor $Yellow
Write-Host "Pages Dashboard: https://dash.cloudflare.com/pages" -ForegroundColor $Yellow
Write-Host "D1 Dashboard: https://dash.cloudflare.com/d1" -ForegroundColor $Yellow
Write-Host "R2 Dashboard: https://dash.cloudflare.com/r2" -ForegroundColor $Yellow
Write-Host ""
Write-Host "🌿 Your plant store is ready to grow!" -ForegroundColor $Green 