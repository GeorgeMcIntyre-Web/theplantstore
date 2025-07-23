# 🤖 Automated Deployment Setup Guide

This guide will help you set up fully automated deployment for The Plant Store without any manual intervention.

## 🎯 Overview

The automated deployment system consists of:
- **GitHub Actions workflows** for CI/CD
- **Automated testing** on every push/PR
- **Automatic deployment** to production on main branch
- **Health checks** and monitoring

## 📋 Prerequisites

1. **GitHub Repository** with your code
2. **Production Server** (DigitalOcean, AWS, etc.)
3. **Database** (PostgreSQL recommended)
4. **Domain** and SSL certificate

## 🔧 Step 1: GitHub Repository Setup

### 1.1 Enable GitHub Actions

1. Go to your GitHub repository
2. Navigate to **Settings** → **Actions** → **General**
3. Enable **Actions** and **Workflow permissions**
4. Set **Workflow permissions** to "Read and write permissions"

### 1.2 Add Repository Secrets

Go to **Settings** → **Secrets and variables** → **Actions** and add these secrets:

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://yourdomain.com

# Server Access
SERVER_HOST=your-server-ip
SERVER_USER=root
SERVER_SSH_KEY=your-private-ssh-key
SERVER_PORT=22
```

### 1.3 Generate SSH Key for Server Access

```bash
# Generate SSH key pair
ssh-keygen -t rsa -b 4096 -C "github-actions@yourdomain.com"

# Copy public key to server
ssh-copy-id -i ~/.ssh/id_rsa.pub root@your-server-ip

# Copy private key to GitHub secrets
cat ~/.ssh/id_rsa
```

## 🖥️ Step 2: Server Setup

### 2.1 Install Required Software

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install git -y

# Install Nginx (optional, for reverse proxy)
sudo apt install nginx -y
```

### 2.2 Create Application Directory

```bash
# Create application directory
sudo mkdir -p /var/www/plant-store
sudo chown $USER:$USER /var/www/plant-store

# Clone your repository
cd /var/www
git clone https://github.com/yourusername/theplantstore.git plant-store
cd plant-store
```

### 2.3 Set Up Environment Variables

```bash
# Create .env file
nano .env

# Add your environment variables
DATABASE_URL=postgresql://username:password@host:port/database
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://yourdomain.com
# Add other required environment variables
```

### 2.4 Initial Setup

```bash
# Install dependencies
npm ci --production=false

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## 🔄 Step 3: Automated Deployment Workflow

### 3.1 How It Works

1. **Push to main branch** → Triggers deployment
2. **GitHub Actions runs tests** → Ensures code quality
3. **If tests pass** → Deploys to production
4. **Server pulls latest code** → Updates application
5. **PM2 restarts app** → Zero downtime deployment
6. **Health check** → Verifies deployment success

### 3.2 Workflow Files

The following files are already created:

- `.github/workflows/deploy.yml` - Main deployment workflow
- `.github/workflows/test.yml` - Testing workflow
- `scripts/auto-deploy.sh` - Server-side deployment script
- `ecosystem.config.js` - PM2 configuration

### 3.3 Manual Deployment (if needed)

```bash
# On your server
cd /var/www/plant-store
./scripts/auto-deploy.sh
```

## 🧪 Step 4: Testing the Setup

### 4.1 Test the Workflow

1. Make a small change to your code
2. Push to the main branch
3. Go to **Actions** tab in GitHub
4. Watch the deployment workflow run

### 4.2 Verify Deployment

```bash
# Check if app is running
pm2 status

# Check logs
pm2 logs plant-store

# Test health endpoint
curl http://localhost:3000/api/health
```

## 📊 Step 5: Monitoring and Alerts

### 5.1 PM2 Monitoring

```bash
# Monitor application
pm2 monit

# View logs
pm2 logs plant-store --lines 100

# Check status
pm2 show plant-store
```

### 5.2 Set Up Alerts (Optional)

```bash
# Install PM2 logrotate
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🔒 Step 6: Security Considerations

### 6.1 Environment Variables

- Never commit `.env` files to Git
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly

### 6.2 Server Security

```bash
# Set up firewall
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable

# Update SSH configuration
sudo nano /etc/ssh/sshd_config
# Disable root login, use key-based auth only
```

### 6.3 SSL Certificate

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## 🚀 Step 7: Advanced Configuration

### 7.1 Multiple Environments

Create separate workflows for staging:

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging
on:
  push:
    branches: [ develop ]
```

### 7.2 Database Migrations

The workflow automatically runs:
- `npx prisma generate` - Updates Prisma client
- `npx prisma db push` - Applies schema changes

### 7.3 Rollback Strategy

```bash
# If deployment fails, rollback
cd /var/www/plant-store
git reset --hard HEAD~1
./scripts/auto-deploy.sh
```

## 🎉 Success!

Your automated deployment is now set up! Every push to the main branch will:

1. ✅ Run all tests automatically
2. ✅ Build the application
3. ✅ Deploy to production
4. ✅ Restart the application
5. ✅ Verify deployment with health checks

## 📞 Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Check SSH key in GitHub secrets
   - Verify server IP and port
   - Test SSH connection manually

2. **Build Fails**
   - Check Node.js version (requires 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

3. **Database Connection Issues**
   - Verify DATABASE_URL in secrets
   - Check database server is running
   - Ensure database user has proper permissions

4. **PM2 Issues**
   - Check if PM2 is installed globally
   - Verify ecosystem.config.js configuration
   - Check PM2 logs for errors

### Getting Help

- Check GitHub Actions logs for detailed error messages
- Review PM2 logs: `pm2 logs plant-store`
- Verify environment variables are set correctly
- Test deployment script manually: `./scripts/auto-deploy.sh`

---

**🎯 You're all set! Your deployment will now run automatically without any manual intervention.** 