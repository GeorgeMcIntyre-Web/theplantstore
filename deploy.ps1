# House Plant Store - Simple Deployment Script
# Deploys to Cloudflare Pages with D1 database

Write-Host "🌿 Deploying The House Plant Store..." -ForegroundColor Green

# Check if wrangler is installed
try {
    $null = Get-Command wrangler -ErrorAction Stop
    Write-Host "✅ Wrangler CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Wrangler CLI not found. Installing..." -ForegroundColor Red
    npm install -g wrangler
}

# Login to Cloudflare (if not already logged in)
Write-Host "🔐 Checking Cloudflare authentication..." -ForegroundColor Blue
try {
    $null = wrangler whoami 2>$null
    Write-Host "✅ Already authenticated" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Please log in to Cloudflare:" -ForegroundColor Yellow
    wrangler login
}

# Create D1 database (if it doesn't exist)
Write-Host "🗄️  Setting up D1 database..." -ForegroundColor Blue
try {
    $DBOutput = wrangler d1 create houseplantstore-db
    $DBId = ($DBOutput | Select-String "Created D1 database .*" | ForEach-Object { $_.Matches[0].Value -split " " | Select-Object -Last 1 })
    
    if ($DBId) {
        Write-Host "✅ Created D1 database: $DBId" -ForegroundColor Green
        
        # Update wrangler.toml with database ID
        $wranglerContent = Get-Content "wrangler.toml" -Raw
        $wranglerContent = $wranglerContent -replace "your-d1-database-id", $DBId
        Set-Content "wrangler.toml" $wranglerContent
        Write-Host "✅ Updated wrangler.toml" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Database might already exist" -ForegroundColor Yellow
}

# Create R2 bucket (if it doesn't exist)
Write-Host "📦 Setting up R2 bucket..." -ForegroundColor Blue
try {
    $null = wrangler r2 bucket create houseplantstore-images
    Write-Host "✅ Created R2 bucket" -ForegroundColor Green
} catch {
    Write-Host "⚠️  R2 bucket might already exist" -ForegroundColor Yellow
}

# Run database migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Blue
try {
    $null = wrangler d1 execute houseplantstore-db --file=./schema.sql
    Write-Host "✅ Database migrations completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Database migrations failed" -ForegroundColor Red
    exit 1
}

# Deploy to Cloudflare Pages
Write-Host "🚀 Deploying to Cloudflare Pages..." -ForegroundColor Blue
try {
    $null = wrangler pages deploy . --project-name=houseplantstore
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Your plant store is now live!" -ForegroundColor Green
Write-Host "🌐 Visit: https://thehouseplantstore.com" -ForegroundColor Blue
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure custom domain in Cloudflare Pages dashboard" -ForegroundColor White
Write-Host "2. Add product images to R2 bucket" -ForegroundColor White
Write-Host "3. Set up payment gateway (PayStack recommended for SA)" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Useful links:" -ForegroundColor Blue
Write-Host "Cloudflare Dashboard: https://dash.cloudflare.com" -ForegroundColor White
Write-Host "Pages Dashboard: https://dash.cloudflare.com/pages" -ForegroundColor White 