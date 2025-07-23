# The Plant Store

A modern e-commerce website for selling beautiful plants and gardening supplies, built with Next.js.

## 🌿 Project Overview

**Domain:** Thehouseplantstore.co.za  
**Hosting Provider:** HOSTAFRICA / Cloudflare Pages  
**Project Type:** Next.js E-commerce Website  
**Currency:** South African Rand (ZAR)

## 📋 Domain Information

### Domain Details
- **Domain Name:** Thehouseplantstore.co.za
- **Registration Date:** Friday, October 4th, 2024
- **Next Due Date:** Wednesday, September 24th, 2025
- **Status:** Active
- **SSL Status:** No SSL Detected (needs configuration)
- **First Payment:** R99.00
- **Recurring Amount:** R208.00 Every 1 Year
- **Payment Method:** Credit Card, EFT

### Nameserver Configuration
- **Nameserver 1:** dan1.host-ww.net
- **Nameserver 2:** dan2.host-ww.net
- **Nameserver 3:** (empty)
- **Nameserver 4:** (empty)
- **Nameserver 5:** (empty)

### Suggested Addon Domains
- Thehouseplantstore.africa (R139.00)
- Thehouseplantstore.org (R99.00)
- Thehouseplantstore.website (R99.00)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd theplantstore
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
theplantstore/
├── app/
│   ├── layout.tsx          # Root layout component
│   └── page.tsx            # Home page component
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies and scripts
└── README.md              # Project documentation
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server

## 🎨 Features

### Current Features
- ✅ Responsive design
- ✅ Hero section with call-to-action
- ✅ Featured products showcase
- ✅ Product cards with pricing
- ✅ Contact information
- ✅ Mobile-friendly layout

### Planned Features
- [ ] Shopping cart functionality
- [ ] Product catalog
- [ ] User authentication
- [ ] Payment integration
- [ ] Order management
- [ ] Admin dashboard
- [ ] Product search and filtering
- [ ] Customer reviews
- [ ] Newsletter subscription

## 🌐 Deployment

### Current Configuration
The project is configured for static export (`output: 'export'`) which is suitable for hosting on static hosting platforms.

### Deployment Options

1. **Cloudflare Pages (Recommended)**
   - Connect Git repository to Cloudflare Pages
   - Automatic deployments on push
   - Global CDN and edge caching
   - Free SSL certificates
   - Build command: `npm run build`
   - Publish directory: `out`

2. **HOSTAFRICA (Current)**
   - Upload static files to hosting directory
   - Configure domain DNS settings
   - Enable SSL certificate

3. **Vercel (Alternative)**
   ```bash
   npm install -g vercel
   vercel
   ```

4. **Netlify**
   - Connect repository to Netlify
   - Build command: `npm run build`
   - Publish directory: `out`

## 🔧 Configuration

### Next.js Config
- Static export enabled
- Trailing slash enabled
- ESLint and TypeScript errors ignored during build

### Environment Variables
Create a `.env.local` file for local development:
```env
NEXT_PUBLIC_SITE_URL=https://thehouseplantstore.co.za
NEXT_PUBLIC_CONTACT_EMAIL=info@theplantstore.com
NEXT_PUBLIC_PHONE=+27 11 123 4567
```

## 📞 Contact Information

- **Email:** info@theplantstore.com
- **Phone:** +27 11 123 4567
- **Address:** Johannesburg, South Africa

## 🔒 Security & SSL

**Current Status:** SSL not configured  
**Action Required:** Enable SSL certificate through hosting provider

### SSL Setup Steps
1. **Cloudflare Pages:** Automatic SSL provisioning
2. **HOSTAFRICA:** Enable SSL certificate in control panel
3. **Vercel/Netlify:** Automatic SSL certificates

## 📈 Analytics & SEO

### Recommended Tools
- Google Analytics 4
- Google Search Console
- Facebook Pixel
- Hotjar (for user behavior)
- Cloudflare Analytics (if using Cloudflare)

### SEO Optimization
- Meta tags implementation
- Structured data markup
- Sitemap generation
- Robots.txt configuration

## 🛒 E-commerce Integration

### Payment Gateways (South Africa)
- PayGate
- Peach Payments
- PayFast
- Yoco

### Shipping Options
- Courier delivery
- Local pickup
- Express shipping

## 📱 Mobile Optimization

The website is built with mobile-first design principles and includes:
- Responsive grid layouts
- Touch-friendly buttons
- Optimized images
- Fast loading times

## 🔄 Version Control

### Git Workflow
- Main branch for production
- Feature branches for development
- Pull request reviews
- Automated testing

## 📊 Performance

### Optimization Targets
- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1

### Cloudflare Performance Features
- Global CDN
- Edge caching
- Auto minification
- Image optimization
- Brotli compression

## 🐛 Troubleshooting

### Common Issues
1. **Build errors** - Check Node.js version compatibility
2. **Deployment issues** - Verify static export configuration
3. **Domain issues** - Contact hosting provider support

## 📄 License

This project is private and proprietary to The Plant Store.

---

**Last Updated:** January 2025  
**Maintained by:** Development Team  
**Support:** info@theplantstore.com 