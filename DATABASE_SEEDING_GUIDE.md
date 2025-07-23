# 🌱 Database Seeding Guide

## Overview

Database seeding is **CRITICAL** for The House Plant Store to function properly. The seeding process creates all the initial data needed for the application to work, including users, products, categories, and accounting data.

## What Gets Seeded

### 👥 Users Created

| Email | Role | Password | Purpose |
|-------|------|----------|---------|
| `admin@thehouseplantstore.co.za` | SUPER_ADMIN | `admin123` | Full system access |
| `plants@thehouseplantstore.co.za` | PLANT_MANAGER | `admin123` | Product & inventory management |
| `orders@thehouseplantstore.co.za` | ORDER_MANAGER | `admin123` | Order processing & customer service |
| `john@example.com` | CUSTOMER | `customer123` | Sample customer account |

### 📁 Categories Created

1. **Indoor Plants** - Houseplants for interior spaces
2. **Outdoor Plants** - Garden and patio plants
3. **Succulents** - Low-maintenance desert plants
4. **Accessories** - Pots, soil, tools, etc.

### 🏪 Suppliers Created

1. **GreenGrowers Ltd.**
   - Email: contact@greengrowers.com
   - Phone: +27 21 123 4567
   - Address: 45 Plant Lane, Cape Town

2. **Urban Jungle Supplies**
   - Email: info@urbanjungle.co.za
   - Phone: +27 11 987 6543
   - Address: 99 Leafy Ave, Johannesburg

### 🌿 Products Created

**15+ Sample Plants** including:
- Monstera Deliciosa (R299.99)
- Snake Plant (R149.99)
- Peace Lily (R199.99)
- Fiddle Leaf Fig (R399.99)
- And many more...

Each product includes:
- High-quality images
- Detailed descriptions
- Care instructions
- Pricing and stock levels
- Categorization

### 💰 Accounting Data Created

#### Expense Categories (10 categories)
1. Marketing & Advertising
2. Office Supplies
3. Utilities
4. Rent & Property
5. Travel & Transport
6. Professional Services
7. Equipment & Technology
8. Insurance
9. Employee Benefits
10. Miscellaneous

#### Sample Expenses (5 realistic records)
- Google Ads Campaign - R2,500
- Office Supplies - R450
- Internet & Phone Services - R1,200
- Social Media Advertising - R1,800
- Electricity Bill - R850

Each expense includes:
- Proper categorization
- VAT calculations
- Approval status
- Audit trail

### 🚚 Shipping Rates Created

Provincial shipping rates for all 9 South African provinces:
- Gauteng: R50
- Western Cape: R80
- KwaZulu-Natal: R75
- Eastern Cape: R70
- Limpopo: R85
- Mpumalanga: R80
- North West: R75
- Northern Cape: R90
- Free State: R70

## Seeding Process

### Step 1: Run Main Seed Script

```bash
npx tsx --require dotenv/config scripts/seed.ts
```

**Expected Output:**
```
🌱 Starting database seeding...
🧹 Cleaning up old data...
📁 Creating categories...
✅ Created category: Indoor Plants
✅ Created category: Outdoor Plants
✅ Created category: Succulents
✅ Created category: Accessories
👥 Creating admin users...
✅ Created Super Admin
✅ Created Plant Manager
✅ Created Order Manager
✅ Created sample customer
🚚 Creating suppliers...
✅ Created supplier: GreenGrowers Ltd.
✅ Created supplier: Urban Jungle Supplies
🏠 Creating indoor plants...
✅ Created product: Monstera Deliciosa
✅ Created product: Snake Plant
...
✅ Seeding completed successfully!
```

### Step 2: Run Accounting Seed Script

```bash
npx tsx --require dotenv/config scripts/seed-accounting.ts
```

**Expected Output:**
```
🌱 Seeding accounting data...
📁 Creating expense categories...
✅ Created category: Marketing & Advertising
✅ Created category: Office Supplies
...
💰 Creating sample expenses...
✅ Created expense: Google Ads Campaign - Q1 2025
✅ Created expense: Office Supplies - January 2025
...
✅ Accounting data seeding completed!
```

### Step 3: Verify Seeding

```bash
# Check database content
npx prisma studio
```

## Troubleshooting

### Common Seeding Issues

#### 1. Database Connection Error
```bash
Error: P1001: Can't reach database server
```

**Solution:**
- Check `DATABASE_URL` environment variable
- Verify database is running and accessible
- Test connection: `npx prisma db push`

#### 2. Permission Denied
```bash
Error: P2002: Unique constraint failed
```

**Solution:**
- Clear existing data: `npx prisma db push --force-reset`
- Run seeding again

#### 3. Missing Dependencies
```bash
Error: Cannot find module 'bcryptjs'
```

**Solution:**
```bash
npm install
npx prisma generate
```

#### 4. Image Upload Issues
```bash
Error: Failed to upload product images
```

**Solution:**
- Ensure `public/products/` directory exists
- Check file permissions
- Verify image files are present

### Debugging Commands

```bash
# Run with verbose logging
DEBUG=* npx tsx --require dotenv/config scripts/seed.ts

# Check database schema
npx prisma db pull

# Reset database completely
npx prisma db push --force-reset

# View database in browser
npx prisma studio

# Check specific tables
npx prisma studio --port 5556
```

## Verification Checklist

After seeding, verify these exist:

### Users
- [ ] Super Admin user exists and can login
- [ ] Plant Manager user exists and can login
- [ ] Order Manager user exists and can login
- [ ] Sample customer exists

### Products
- [ ] At least 15 products created
- [ ] Product images are visible
- [ ] Categories are assigned
- [ ] Pricing is set correctly

### Accounting
- [ ] 10 expense categories exist
- [ ] Sample expenses are created
- [ ] Audit logs are present
- [ ] Approval workflows work

### System
- [ ] Admin panel loads correctly
- [ ] Product catalog displays
- [ ] User authentication works
- [ ] No console errors

## Production Deployment

### DigitalOcean App Platform

Add this to your `package.json`:

```json
{
  "scripts": {
    "postdeploy": "npx prisma generate && npx prisma db push && npx tsx --require dotenv/config scripts/seed.ts && npx tsx --require dotenv/config scripts/seed-accounting.ts"
  }
}
```

### Manual Deployment

```bash
# After deployment
npm run build
npx prisma generate
npx prisma db push
npx tsx --require dotenv/config scripts/seed.ts
npx tsx --require dotenv/config scripts/seed-accounting.ts
npm start
```

## Security Notes

### Default Passwords
All seeded users have default passwords that **MUST** be changed in production:

- `admin123` - Admin users
- `customer123` - Sample customer

### Production Checklist
- [ ] Change all default passwords
- [ ] Remove or secure sample customer account
- [ ] Review and customize sample data
- [ ] Set up proper user permissions
- [ ] Configure email notifications

## Customization

### Adding Custom Data

To add your own data, modify the seed scripts:

1. **Add Products**: Edit `scripts/seed.ts`
2. **Add Categories**: Edit `scripts/seed.ts`
3. **Add Users**: Edit `scripts/seed.ts`
4. **Add Expenses**: Edit `scripts/seed-accounting.ts`

### Example: Add Custom Product

```typescript
// In scripts/seed.ts
const customProduct = await prisma.product.upsert({
  where: { name: "Your Custom Plant" },
  update: {},
  create: {
    name: "Your Custom Plant",
    slug: "your-custom-plant",
    description: "Your custom description",
    price: 199.99,
    // ... other fields
  },
});
```

## Support

If you encounter issues with seeding:

1. **Check the logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test database connection** manually
4. **Contact support** with error details

---

*Remember: Proper seeding is essential for a successful deployment! 🌱* 