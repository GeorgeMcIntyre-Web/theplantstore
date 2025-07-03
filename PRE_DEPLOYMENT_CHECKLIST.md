# Pre-Deployment Checklist

## Before Pushing to Master

### ✅ Environment Variables (Set on your DigitalOcean server)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Secure random string for session encryption
- [ ] `NEXTAUTH_URL` - Your production domain (e.g., https://yourdomain.com)
- [ ] `NODE_ENV` - Set to "production"

### ✅ Database Setup
- [ ] PostgreSQL database is created and accessible
- [ ] Database user has proper permissions
- [ ] Connection string is tested and working

### ✅ Domain Configuration
- [ ] Update `next.config.js` with your actual domain
- [ ] DNS records point to your DigitalOcean droplet
- [ ] SSL certificate is installed (Let's Encrypt)

### ✅ Server Setup
- [ ] Node.js 18.x is installed
- [ ] PM2 is installed for process management
- [ ] Nginx is configured as reverse proxy
- [ ] Firewall allows ports 80, 443, and 3000

### ✅ Optional Features (if you want them working)
- [ ] Google OAuth credentials configured
- [ ] Microsoft OAuth credentials configured
- [ ] Email server settings configured
- [ ] Payment gateway (Yoco) credentials
- [ ] Shipping provider API keys

## Quick Commands to Run on Your Server

```bash
# 1. Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2
npm install -g pm2

# 3. Install Nginx
sudo apt update
sudo apt install nginx

# 4. Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx

# 5. Set environment variables (replace with your values)
export DATABASE_URL="postgresql://username:password@host:port/database_name"
export NEXTAUTH_SECRET="your-secure-secret-here"
export NEXTAUTH_URL="https://yourdomain.com"
export NODE_ENV="production"

# 6. Make deploy script executable
chmod +x scripts/deploy.sh

# 7. Run deployment
./scripts/deploy.sh
```

## What Happens When You Push to Master

1. Your CI/CD pipeline will:
   - Pull the latest code
   - Install dependencies
   - Generate Prisma client
   - Run database migrations
   - Build the application
   - Restart the application

2. The application will be available at your domain

## Testing After Deployment

- [ ] Homepage loads correctly
- [ ] Product pages work
- [ ] User registration/login works
- [ ] Admin panel is accessible
- [ ] Database operations work
- [ ] Images load properly
- [ ] SSL certificate is working

## Troubleshooting

If deployment fails:
1. Check server logs: `pm2 logs plant-store`
2. Verify environment variables are set
3. Test database connection
4. Check Nginx configuration
5. Verify domain DNS settings

## Security Notes

- [ ] Change default database passwords
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Configure firewall properly
- [ ] Set up regular backups
- [ ] Monitor application logs 