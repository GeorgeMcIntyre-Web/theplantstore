# Deployment Guide - The Plant Store

## 🌐 Domain Information

**Domain:** Thehouseplantstore.co.za  
**Provider:** HOSTAFRICA  
**Registration:** October 4th, 2024  
**Expiry:** September 24th, 2025  
**Status:** Active  
**SSL:** Not configured (needs setup)

## 📋 Pre-Deployment Checklist

### Development Environment
- [ ] Node.js 18+ installed
- [ ] Project builds successfully (`npm run build`)
- [ ] All tests pass
- [ ] Environment variables configured
- [ ] Static files generated in `out/` directory

### Domain Configuration
- [ ] Domain is active and paid
- [ ] Nameservers configured correctly
- [ ] DNS records updated
- [ ] SSL certificate enabled

## 🚀 Deployment Options

### Option 1: HOSTAFRICA (Current Setup)

#### Step 1: Build the Project
```bash
# Install dependencies
npm install

# Build for production
npm run build
```

#### Step 2: Access HOSTAFRICA Control Panel
1. **Login to HOSTAFRICA**
   - URL: https://my.hostafrica.com
   - Username: [Your Username]
   - Password: [Your Password]

2. **Navigate to File Manager**
   - Go to "Hosting" → "File Manager"
   - Or use FTP/SFTP credentials

#### Step 3: Upload Files
**Method A: File Manager**
1. Navigate to `public_html/` directory
2. Delete existing files (backup first if needed)
3. Upload all files from `out/` directory
4. Ensure `index.html` is in the root

**Method B: FTP/SFTP**
```bash
# FTP credentials (get from HOSTAFRICA)
Host: [Your FTP Host]
Username: [Your FTP Username]
Password: [Your FTP Password]
Port: 21 (FTP) or 22 (SFTP)

# Upload using FileZilla or command line
# Upload contents of 'out/' directory to 'public_html/'
```

#### Step 4: Configure Domain
1. **Go to Domain Management**
   - Navigate to "Domains" → "My Domains"
   - Click on "Thehouseplantstore.co.za"

2. **Configure Nameservers**
   - Click "Nameservers" tab
   - Select "Use custom nameservers"
   - Enter:
     - dan1.host-ww.net
     - dan2.host-ww.net

3. **Enable SSL Certificate**
   - Go to "SSL" section
   - Enable SSL certificate
   - Configure HTTPS redirects

#### Step 5: Test Deployment
1. Visit https://thehouseplantstore.co.za
2. Check all pages load correctly
3. Verify responsive design
4. Test contact forms
5. Check performance

### Option 2: Cloudflare Pages (Recommended)

#### Step 1: Prepare Repository
1. **Push code to Git repository**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Ensure build works locally**
   ```bash
   npm run build
   ```

#### Step 2: Connect to Cloudflare Pages
1. **Login to Cloudflare Dashboard**
   - URL: https://dash.cloudflare.com
   - Go to "Pages" section

2. **Create New Project**
   - Click "Create a project"
   - Select "Connect to Git"
   - Choose your repository (GitHub/GitLab)

3. **Configure Build Settings**
   ```
   Project name: theplantstore
   Production branch: main
   Framework preset: None
   Build command: npm run build
   Build output directory: out
   Root directory: /
   ```

4. **Environment Variables**
   Add the following environment variables:
   ```
   NODE_VERSION: 18
   NPM_VERSION: 9
   ```

#### Step 3: Deploy
1. **Trigger First Deployment**
   - Click "Save and Deploy"
   - Cloudflare will build and deploy automatically

2. **Monitor Build Process**
   - Check build logs for any errors
   - Verify all files are generated correctly

#### Step 4: Configure Custom Domain
1. **Add Custom Domain**
   - Go to project settings
   - Click "Custom domains"
   - Add: thehouseplantstore.co.za

2. **Update DNS Records**
   - Go to Cloudflare DNS settings
   - Add CNAME record:
     - Name: @
     - Target: [your-project].pages.dev
     - Proxy status: Proxied (orange cloud)

3. **SSL Configuration**
   - Cloudflare automatically provides SSL
   - Enable "Always Use HTTPS" in SSL/TLS settings

#### Step 5: Performance Optimization
1. **Enable Cloudflare Features**
   - Auto Minify: JavaScript, CSS, HTML
   - Brotli compression
   - Image optimization
   - Cache optimization

2. **Configure Caching**
   - Set appropriate cache headers
   - Enable edge caching

### Option 3: Vercel (Alternative)

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

#### Step 2: Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy project
vercel

# Follow prompts:
# - Set up and deploy: Yes
# - Which scope: [Your Account]
# - Link to existing project: No
# - Project name: theplantstore
# - Directory: ./
# - Override settings: No
```

#### Step 3: Configure Custom Domain
1. **Add Domain in Vercel Dashboard**
   - Go to project settings
   - Add domain: thehouseplantstore.co.za

2. **Update DNS Records**
   - Add CNAME record:
     - Name: @
     - Value: cname.vercel-dns.com
   - Add A record:
     - Name: @
     - Value: 76.76.19.19

#### Step 4: Enable SSL
- Vercel automatically provisions SSL certificates
- HTTPS redirects are configured automatically

### Option 4: Netlify

#### Step 1: Connect Repository
1. **Link to Git Repository**
   - Connect GitHub/GitLab account
   - Select theplantstore repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `out`
   - Node version: 18

#### Step 2: Deploy
1. **Trigger Deployment**
   - Push to main branch
   - Netlify builds automatically

2. **Configure Custom Domain**
   - Add domain in Netlify dashboard
   - Update DNS records as instructed

## 🔧 Configuration Files

### next.config.js (Current)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
```

### Environment Variables
Create `.env.local` for local development:
```env
NEXT_PUBLIC_SITE_URL=https://thehouseplantstore.co.za
NEXT_PUBLIC_CONTACT_EMAIL=info@theplantstore.com
NEXT_PUBLIC_PHONE=+27 11 123 4567
```

## 🔒 SSL Configuration

### Cloudflare SSL Setup
1. **Automatic SSL Provisioning**
   - Cloudflare provides free SSL certificates
   - Automatic HTTPS redirects

2. **SSL/TLS Settings**
   - Mode: Full (strict)
   - Always Use HTTPS: On
   - Minimum TLS Version: 1.2

### HOSTAFRICA SSL Setup
1. **Access SSL Management**
   - Go to domain management
   - Click "SSL" tab

2. **Enable SSL Certificate**
   - Select "Let's Encrypt" (free)
   - Or purchase premium SSL

3. **Configure HTTPS Redirects**
   - Enable automatic HTTPS redirect
   - Force HTTPS for all pages

### SSL Verification
```bash
# Check SSL certificate
openssl s_client -connect thehouseplantstore.co.za:443 -servername thehouseplantstore.co.za

# Test HTTPS redirect
curl -I http://thehouseplantstore.co.za
# Should return 301 redirect to HTTPS
```

## 📊 Performance Optimization

### Cloudflare Optimization
1. **Auto Minify**
   - JavaScript, CSS, HTML
   - Reduces file sizes

2. **Image Optimization**
   - WebP format support
   - Automatic image resizing
   - Lazy loading

3. **Caching Strategy**
   - Edge caching
   - Browser caching
   - Static asset optimization

### Build Optimization
```bash
# Analyze bundle size
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

### Image Optimization
- Use Next.js Image component
- Optimize image formats (WebP)
- Implement lazy loading

### Caching Strategy
```javascript
// next.config.js additions
const nextConfig = {
  // ... existing config
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};
```

## 🧪 Testing Deployment

### Pre-Launch Checklist
- [ ] All pages load correctly
- [ ] Images display properly
- [ ] Contact forms work
- [ ] Mobile responsive design
- [ ] Performance is acceptable
- [ ] SSL certificate active
- [ ] HTTPS redirects working
- [ ] No console errors
- [ ] SEO meta tags present

### Performance Testing
```bash
# Lighthouse testing
npm install -g lighthouse
lighthouse https://thehouseplantstore.co.za --output html --output-path ./lighthouse-report.html

# PageSpeed Insights
# Visit: https://pagespeed.web.dev/
```

### Cross-Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🔄 Continuous Deployment

### Cloudflare Pages Auto-Deploy
- Automatic deployments on git push
- Preview deployments for pull requests
- Rollback to previous versions

### GitHub Actions (Alternative)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build project
        run: npm run build
        
      - name: Deploy to HOSTAFRICA
        uses: SamKirkland/FTP-Deploy-Action@v4.3.4
        with:
          server: ${{ secrets.FTP_SERVER }}
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./out/
          server-dir: ./public_html/
```

### Environment Secrets
Add to GitHub repository secrets:
- `FTP_SERVER`: Your HOSTAFRICA FTP server
- `FTP_USERNAME`: Your FTP username
- `FTP_PASSWORD`: Your FTP password

## 🆘 Troubleshooting

### Common Issues

#### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next out
npm run build
```

#### Cloudflare Deployment Issues
1. **Build Failures**
   - Check build logs in Cloudflare dashboard
   - Verify Node.js version compatibility
   - Check for missing dependencies

2. **Domain Issues**
   - Verify DNS records are correct
   - Check domain is added to Cloudflare
   - Ensure SSL is enabled

#### Deployment Issues
1. **Check file permissions**
   ```bash
   chmod 644 out/*
   chmod 755 out/
   ```

2. **Verify file upload**
   - Check all files uploaded
   - Ensure no corrupted files

3. **Check DNS propagation**
   ```bash
   nslookup thehouseplantstore.co.za
   ```

#### SSL Issues
1. **Certificate not active**
   - Wait 24-48 hours for propagation
   - Contact hosting provider support

2. **Mixed content errors**
   - Ensure all resources use HTTPS
   - Check for hardcoded HTTP URLs

### Support Contacts
- **Cloudflare Support:** https://support.cloudflare.com/
- **HOSTAFRICA Support:** support@hostafrica.com
- **Vercel Support:** https://vercel.com/support
- **Netlify Support:** https://www.netlify.com/support/

## 📈 Post-Deployment

### Monitoring Setup
1. **Uptime Monitoring**
   - UptimeRobot (free)
   - Pingdom
   - StatusCake

2. **Performance Monitoring**
   - Google PageSpeed Insights
   - GTmetrix
   - WebPageTest
   - Cloudflare Analytics

3. **Error Tracking**
   - Sentry
   - LogRocket
   - Bugsnag

### Analytics Setup
1. **Google Analytics 4**
   - Create property
   - Add tracking code
   - Configure goals

2. **Google Search Console**
   - Add domain
   - Verify ownership
   - Submit sitemap

3. **Cloudflare Analytics**
   - Built-in analytics
   - Real-time metrics
   - Performance insights

### Backup Strategy
1. **Code Backup**
   - Git repository
   - Regular commits
   - Feature branches

2. **Content Backup**
   - Database backups (if applicable)
   - File backups
   - Configuration backups

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Maintained by:** Development Team 