# Database Setup Guide - The Plant Store

## 🗄️ Cloudflare D1 Database Setup

Your D1 database `houseplantstore-db` is already created and ready for configuration.

## 📋 Database Schema Overview

### Tables Created:
- **users** - Customer accounts and information
- **categories** - Product categories (Indoor, Outdoor, Succulents, etc.)
- **products** - Plant inventory with care instructions
- **orders** - Customer orders and shipping details
- **order_items** - Individual items in each order
- **cart** - Shopping cart for guest users
- **reviews** - Customer product reviews
- **newsletter_subscribers** - Email marketing list
- **contact_submissions** - Contact form submissions

### Sample Data Included:
- 5 product categories
- 6 featured products
- Optimized indexes for performance

## 🚀 Setup Steps

### Step 1: Get Database ID
1. Go to https://dash.cloudflare.com
2. Navigate to "Storage & Databases" → "D1 SQL"
3. Click on `houseplantstore-db`
4. Copy the Database ID from the URL or settings

### Step 2: Update Wrangler Configuration
1. Open `wrangler.toml`
2. Replace the database_id with your actual ID:
   ```toml
   database_id = "your-actual-database-id-here"
   ```

### Step 3: Install Wrangler CLI
```bash
npm install -g wrangler
```

### Step 4: Login to Cloudflare
```bash
wrangler login
```

### Step 5: Initialize Database
```bash
# Deploy the schema to your database
wrangler d1 execute houseplantstore-db --file=./database/schema.sql
```

### Step 6: Deploy API Functions
```bash
# Deploy the API functions
wrangler deploy
```

## 🔧 API Endpoints

Once deployed, your API will be available at:
- `https://your-worker.your-subdomain.workers.dev/api/products`
- `https://your-worker.your-subdomain.workers.dev/api/categories`

### Available Endpoints:

#### Products
- `GET /api/products` - Get all products
- `GET /api/products?featured=true` - Get featured products
- `GET /api/products?category=indoor-plants` - Get products by category
- `GET /api/products/monstera-deliciosa` - Get single product

#### Categories
- `GET /api/categories` - Get all categories

### Query Parameters:
- `category` - Filter by category slug
- `featured` - Filter featured products only
- `limit` - Number of products to return (default: 50)
- `offset` - Pagination offset (default: 0)

## 📊 Database Management

### View Database in Cloudflare Dashboard:
1. Go to D1 SQL section
2. Click on `houseplantstore-db`
3. Use the SQL editor to run queries

### Common Queries:

#### Get all products with categories:
```sql
SELECT p.*, c.name as category_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id 
WHERE p.is_active = 1;
```

#### Get featured products:
```sql
SELECT * FROM products WHERE is_featured = 1 AND is_active = 1;
```

#### Get products by category:
```sql
SELECT p.*, c.name as category_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id 
WHERE c.slug = 'indoor-plants' AND p.is_active = 1;
```

## 🔄 Adding New Products

### Via SQL:
```sql
INSERT INTO products (
    name, slug, description, price, category_id, 
    stock_quantity, sku, care_level, light_requirements, water_frequency
) VALUES (
    'New Plant Name', 'new-plant-slug', 'Description here', 
    299.00, 1, 10, 'NEW001', 'Easy', 'Medium', 'Weekly'
);
```

### Via API (Future Enhancement):
```javascript
// POST /api/products
{
    "name": "New Plant",
    "slug": "new-plant",
    "description": "Plant description",
    "price": 299.00,
    "category_id": 1,
    "stock_quantity": 10,
    "sku": "NEW001",
    "care_level": "Easy",
    "light_requirements": "Medium",
    "water_frequency": "Weekly"
}
```

## 🛡️ Security Considerations

### Environment Variables:
- Store sensitive data in Cloudflare environment variables
- Use proper authentication for admin endpoints
- Implement rate limiting for API calls

### Data Validation:
- Validate all input data
- Sanitize SQL queries (already handled by D1)
- Implement proper error handling

## 📈 Performance Optimization

### Indexes Created:
- Products by category
- Products by featured status
- Products by active status
- Orders by user and status
- Reviews by product

### Caching Strategy:
- Use Cloudflare's edge caching
- Implement browser caching headers
- Consider Redis for session storage

## 🔍 Monitoring and Analytics

### Cloudflare Analytics:
- Monitor API usage in Cloudflare dashboard
- Track database query performance
- Set up alerts for errors

### Custom Analytics:
- Track popular products
- Monitor order patterns
- Analyze customer behavior

## 🆘 Troubleshooting

### Common Issues:

1. **Database Connection Error**
   - Verify database ID in wrangler.toml
   - Check Cloudflare account permissions
   - Ensure database is active

2. **API Not Responding**
   - Check Worker deployment status
   - Verify function code syntax
   - Check Cloudflare logs

3. **Data Not Loading**
   - Verify database schema is deployed
   - Check sample data insertion
   - Test API endpoints directly

### Support Resources:
- Cloudflare D1 Documentation
- Cloudflare Workers Documentation
- Community forums and Discord

---

**Last Updated:** January 2025  
**Database:** houseplantstore-db  
**Status:** Ready for deployment 