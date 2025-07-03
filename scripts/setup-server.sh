#!/bin/bash

# Server Setup Script for The Plant Store
# Run this script on your DigitalOcean droplet

set -e

echo "🚀 Setting up server for The Plant Store..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Install PM2 globally
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Install Certbot for SSL
echo "📦 Installing Certbot..."
sudo apt install certbot python3-certbot-nginx -y

# Install PostgreSQL (if not using managed database)
echo "📦 Installing PostgreSQL..."
sudo apt install postgresql postgresql-contrib -y

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/plant-store
sudo chown $USER:$USER /var/www/plant-store

# Create logs directory
mkdir -p /var/www/plant-store/logs

# Set up firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3000
sudo ufw --force enable

# Create systemd service for PM2
echo "⚙️ Setting up PM2 startup script..."
pm2 startup

echo "✅ Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Set up your environment variables"
echo "2. Configure your domain in nginx.conf"
echo "3. Set up SSL certificate with: sudo certbot --nginx -d your-domain.com"
echo "4. Clone your repository to /var/www/plant-store"
echo "5. Run the deployment script: ./scripts/deploy.sh" 