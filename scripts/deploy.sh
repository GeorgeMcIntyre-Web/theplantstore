#!/bin/bash

# Deployment script for The Plant Store
# This script should be run on your DigitalOcean server

set -e  # Exit on any error

echo "🚀 Starting deployment of The Plant Store..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set."
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    echo "❌ Error: NEXTAUTH_SECRET environment variable is not set."
    exit 1
fi

if [ -z "$NEXTAUTH_URL" ]; then
    echo "❌ Error: NEXTAUTH_URL environment variable is not set."
    exit 1
fi

echo "✅ Environment variables are configured"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma db push

# Build the application
echo "🏗️ Building the application..."
npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    echo "❌ Error: Build failed. .next directory not found."
    exit 1
fi

echo "✅ Build completed successfully"

# If PM2 is installed, restart the application
if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting application with PM2..."
    
    # Check if the app is already running
    if pm2 list | grep -q "plant-store"; then
        pm2 restart plant-store
    else
        pm2 start npm --name "plant-store" -- start
    fi
    
    pm2 save
    echo "✅ Application restarted with PM2"
else
    echo "⚠️ PM2 not found. You may need to manually restart your application."
    echo "To install PM2: npm install -g pm2"
fi

echo "🎉 Deployment completed successfully!"
echo "🌐 Your application should now be running at: $NEXTAUTH_URL"

# Optional: Run health check
echo "🏥 Running health check..."
sleep 5
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed"
else
    echo "⚠️ Health check failed. Check your application logs."
fi 