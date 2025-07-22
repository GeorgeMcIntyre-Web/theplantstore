# 🌿 Plant Store Cloudflare Deployment Plan
## Domain: thehouseplantstore.com (Already Registered)

### 📋 Complete Integration Setup for Cursor IDE

## 1. Project Structure
```
theplantstore/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   ├── products/
│   │   └── checkout/
│   ├── lib/
│   │   ├── db.ts          # D1 database client
│   │   ├── r2.ts          # R2 storage client
│   │   ├── auth.ts        # Authentication
│   │   └── utils.ts       # Helper functions
│   ├── pages/
│   │   ├── api/           # API routes (Workers)
│   │   ├── products/
│   │   ├── cart/
│   │   └── checkout/
│   └── styles/
├── public/
│   ├── images/
│   └── favicon.ico
├── wrangler.toml          # Cloudflare configuration
├── package.json
└── .env.local
```

## 2. Technology Stack
- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Backend**: Cloudflare Workers (API routes)
- **Database**: Cloudflare D1 (SQLite-based)
- **Storage**: Cloudflare R2 (product images)
- **Domain**: thehouseplantstore.com
- **Hosting**: Cloudflare Pages
- **IDE**: Cursor

## 3. Monthly Cost Breakdown (ZAR)
| Service | Cost (ZAR/month) | Notes |
|---------|------------------|-------|
| Domain (thehouseplantstore.com) | R16 | Already paid |
| D1 Database | R0-90 | Free tier likely sufficient |
| Pages Hosting | R0 | Free tier |
| R2 Storage | R0-30 | Free tier likely sufficient |
| **Total** | **R16-136** | Very cost-effective |

## 4. Setup Commands for Cursor IDE

### Install Dependencies
```bash
npm create next-app@latest theplantstore --typescript --tailwind --app --src-dir
cd theplantstore
npm install @cloudflare/workers-types wrangler
npm install -g wrangler
```

### Initialize Cloudflare
```bash
wrangler login
wrangler init
```

## 5. Configuration Files

### wrangler.toml
```toml
name = "thehouseplantstore"
main = "src/worker.ts"
compatibility_date = "2024-01-01"

[site]
bucket = "./public"

[[d1_databases]]
binding = "DB"
database_name = "plant_store_db"
database_id = "your-d1-database-id"

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "plant-store-images"
preview_bucket_name = "plant-store-images-dev"

[env.production]
name = "thehouseplantstore"
route = "thehouseplantstore.com/*"

[env.staging]
name = "thehouseplantstore-staging"
route = "staging.thehouseplantstore.com/*"
```

### .env.local
```env
# Database
DATABASE_URL="your-d1-database-url"

# R2 Storage
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET_NAME="plant-store-images"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://thehouseplantstore.com"

# Payment (PayStack for SA)
PAYSTACK_SECRET_KEY="your-paystack-secret"
PAYSTACK_PUBLIC_KEY="your-paystack-public"
```

## 6. Database Schema (D1)

### migrations/001_initial_schema.sql
```sql
-- Users table
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT
);

-- Products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    stock_quantity INTEGER DEFAULT 0,
    category_id INTEGER,
    image_urls TEXT, -- JSON array of image URLs
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    shipping_address TEXT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Cart table (for guest users)
CREATE TABLE cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

## 7. Core Database Functions

### src/lib/db.ts
```typescript
import { D1Database } from '@cloudflare/workers-types';

export interface Database {
  DB: D1Database;
}

export class PlantStoreDB {
  constructor(private db: D1Database) {}

  // Product operations
  async getProducts(limit = 20, offset = 0) {
    return this.db
      .prepare(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.is_active = true 
        ORDER BY p.created_at DESC 
        LIMIT ? OFFSET ?
      `)
      .bind(limit, offset)
      .all();
  }

  async getProductBySlug(slug: string) {
    return this.db
      .prepare(`
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.slug = ? AND p.is_active = true
      `)
      .bind(slug)
      .first();
  }

  // Order operations
  async createOrder(orderData: {
    orderNumber: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
    shippingAddress: string;
    totalAmount: number;
    items: Array<{ productId: number; quantity: number; price: number }>;
  }) {
    const { orderNumber, customerEmail, customerName, customerPhone, shippingAddress, totalAmount, items } = orderData;

    return this.db.batch([
      this.db
        .prepare(`
          INSERT INTO orders (order_number, customer_email, customer_name, customer_phone, shipping_address, total_amount)
          VALUES (?, ?, ?, ?, ?, ?)
        `)
        .bind(orderNumber, customerEmail, customerName, customerPhone, shippingAddress, totalAmount),
      ...items.map(item =>
        this.db
          .prepare(`
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (last_insert_rowid(), ?, ?, ?)
          `)
          .bind(item.productId, item.quantity, item.price)
      )
    ]);
  }

  // Cart operations
  async getCartItems(sessionId: string) {
    return this.db
      .prepare(`
        SELECT ci.*, p.name, p.price, p.image_urls
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        WHERE ci.session_id = ?
      `)
      .bind(sessionId)
      .all();
  }

  async addToCart(sessionId: string, productId: number, quantity: number) {
    return this.db
      .prepare(`
        INSERT INTO cart_items (session_id, product_id, quantity)
        VALUES (?, ?, ?)
      `)
      .bind(sessionId, productId, quantity)
      .run();
  }
}
```

## 8. R2 Storage Integration

### src/lib/r2.ts
```typescript
import { R2Bucket } from '@cloudflare/workers-types';

export class ImageStorage {
  constructor(private bucket: R2Bucket) {}

  async uploadImage(file: File, path: string): Promise<string> {
    const key = `products/${path}`;
    await this.bucket.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });
    return `https://your-r2-domain.com/${key}`;
  }

  async deleteImage(path: string): Promise<void> {
    await this.bucket.delete(path);
  }

  getImageUrl(path: string): string {
    return `https://your-r2-domain.com/${path}`;
  }
}
```

## 9. API Routes (Cloudflare Workers)

### src/pages/api/products/route.ts
```typescript
import { PlantStoreDB } from '../../../lib/db';

export async function GET(request: Request, { env }: { env: any }) {
  const db = new PlantStoreDB(env.DB);
  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  try {
    const products = await db.getProducts(limit, offset);
    return new Response(JSON.stringify(products), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

### src/pages/api/orders/route.ts
```typescript
import { PlantStoreDB } from '../../../lib/db';

export async function POST(request: Request, { env }: { env: any }) {
  const db = new PlantStoreDB(env.DB);
  const body = await request.json();

  try {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await db.createOrder({
      orderNumber,
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      totalAmount: body.totalAmount,
      items: body.items,
    });

    return new Response(JSON.stringify({ orderNumber }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to create order' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
```

## 10. Deployment Commands

### Initial Setup
```bash
# Create D1 database
wrangler d1 create plant-store-db

# Create R2 bucket
wrangler r2 bucket create plant-store-images

# Run migrations
wrangler d1 execute plant-store-db --file=./migrations/001_initial_schema.sql
```

### Deploy to Cloudflare Pages
```bash
# Build the project
npm run build

# Deploy to Pages
wrangler pages deploy . --project-name=thehouseplantstore

# Or use GitHub integration for automatic deployments
```

## 11. Domain Configuration

### DNS Records (in Cloudflare Dashboard)
```
Type    Name                    Value
A       @                       192.0.2.1 (Pages IP)
CNAME   www                     thehouseplantstore.pages.dev
CNAME   staging                 staging-thehouseplantstore.pages.dev
```

### Custom Domain Setup
1. Go to Cloudflare Pages dashboard
2. Select your project
3. Go to "Custom domains"
4. Add `thehouseplantstore.com`
5. Add `www.thehouseplantstore.com`
6. Enable SSL/TLS encryption

## 12. Environment Variables Setup
```bash
# Set secrets in Cloudflare
wrangler secret put DATABASE_URL
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put NEXTAUTH_SECRET
wrangler secret put PAYSTACK_SECRET_KEY
```

## 13. Monitoring & Analytics

### Cloudflare Analytics
- Enable Web Analytics in Cloudflare dashboard
- Monitor performance metrics
- Track visitor behavior

### Error Monitoring
- Set up error logging in Workers
- Monitor D1 query performance
- Track R2 storage usage

## 14. SEO Optimization

### robots.txt
```txt
User-agent: *
Allow: /

Sitemap: https://thehouseplantstore.com/sitemap.xml
```

### sitemap.xml (generate dynamically)
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://thehouseplantstore.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://thehouseplantstore.com/products</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

## 15. Performance Optimization

### Next.js Configuration
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-r2-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
  },
  compress: true,
}

module.exports = nextConfig
```

## 16. Security Headers

### _headers (in public folder)
```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 17. Backup Strategy

### Database Backups
```bash
# Export D1 database
wrangler d1 export plant-store-db --output=backup.sql

# Import D1 database
wrangler d1 execute plant-store-db --file=backup.sql
```

### R2 Backup
- Use R2's built-in redundancy
- Consider cross-region replication for critical data

## 18. Development Workflow

### Local Development
```bash
# Start local development
npm run dev

# Test with Wrangler
wrangler dev --local

# Run database locally
wrangler d1 execute plant-store-db --local --file=./migrations/001_initial_schema.sql
```

### Git Workflow
```bash
# Feature branch workflow
git checkout -b feature/new-product-page
# Make changes
git commit -m "Add new product page"
git push origin feature/new-product-page
# Create PR, merge to main
# Automatic deployment via GitHub integration
```

## 19. Testing Strategy

### Unit Tests
```bash
npm install --save-dev jest @testing-library/react
npm test
```

### E2E Tests
```bash
npm install --save-dev playwright
npx playwright test
```

## 20. Go-Live Checklist

- [ ] Domain DNS configured
- [ ] SSL certificate active
- [ ] Database migrations run
- [ ] Environment variables set
- [ ] Payment gateway configured
- [ ] Email service configured
- [ ] Analytics tracking enabled
- [ ] SEO meta tags added
- [ ] Performance optimized
- [ ] Security headers configured
- [ ] Backup strategy implemented
- [ ] Monitoring alerts set up

---

## 🚀 Ready to Deploy!

Your plant store is now ready for deployment with:
- **Domain**: thehouseplantstore.com ✅
- **Hosting**: Cloudflare Pages
- **Database**: Cloudflare D1
- **Storage**: Cloudflare R2
- **Total Cost**: R16-136/month

Start with the setup commands and configuration files above. The integration is designed to be scalable, cost-effective, and performant for your South African plant e-commerce business. 