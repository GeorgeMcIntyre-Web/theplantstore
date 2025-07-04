#!/bin/bash

# Automated deployment script for The Plant Store
# This script runs without manual intervention

set -e  # Exit on any error

echo "🚀 Starting automated deployment of The Plant Store..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log with colors
log_info() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

log_info "Node.js version: $(node -v)"

# Check if environment variables are set
if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL environment variable is not set."
    exit 1
fi

if [ -z "$NEXTAUTH_SECRET" ]; then
    log_error "NEXTAUTH_SECRET environment variable is not set."
    exit 1
fi

if [ -z "$NEXTAUTH_URL" ]; then
    log_error "NEXTAUTH_URL environment variable is not set."
    exit 1
fi

log_info "Environment variables are configured"

# Create logs directory if it doesn't exist
mkdir -p logs

# Install dependencies
log_info "Installing dependencies..."
npm ci --production=false

# Generate Prisma client
log_info "Generating Prisma client..."
npx prisma generate

# Run database migrations
log_info "Running database migrations..."
npx prisma db push

# Build the application
log_info "Building the application..."
npm run build

# Check if build was successful
if [ ! -d ".next" ]; then
    log_error "Build failed. .next directory not found."
    exit 1
fi

log_info "Build completed successfully"

# If PM2 is installed, restart the application
if command -v pm2 &> /dev/null; then
    log_info "Restarting application with PM2..."
    
    # Check if the app is already running
    if pm2 list | grep -q "plant-store"; then
        pm2 restart plant-store
    else
        pm2 start ecosystem.config.js --env production
    fi
    
    pm2 save
    log_info "Application restarted with PM2"
else
    log_warn "PM2 not found. You may need to manually restart your application."
    log_warn "To install PM2: npm install -g pm2"
fi

log_info "Deployment completed successfully!"
log_info "Your application should now be running at: $NEXTAUTH_URL"

# Run health check
log_info "Running health check..."
sleep 10
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    log_info "Health check passed"
else
    log_warn "Health check failed. Check your application logs."
    # Don't exit with error for health check failure
fi

log_info "🎉 Automated deployment completed!" 