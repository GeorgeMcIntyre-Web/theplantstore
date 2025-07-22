# 🌿 The House Plant Store

A simple, fast e-commerce site for selling plants, built with Cloudflare Workers, D1 database, and R2 storage.

**Domain**: thehouseplantstore.com

## 🚀 Quick Deploy

1. **Install Wrangler CLI:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Deploy everything:**
   ```powershell
   .\deploy.ps1
   ```

That's it! Your plant store will be live at `https://thehouseplantstore.com`

## 📁 Project Structure

```
/
├── public/
│   └── index.html          # Main store frontend
├── src/
│   └── index.ts            # Cloudflare Worker (API)
├── wrangler.toml           # Cloudflare configuration
├── schema.sql              # Database schema
└── deploy.ps1              # Deployment script
```

## 💰 Cost Breakdown

| Service | Monthly Cost (ZAR) |
|---------|-------------------|
| Domain | R16 |
| D1 Database | R0-90 |
| Pages Hosting | R0 |
| R2 Storage | R0-30 |
| **Total** | **R16-136** |

## 🔧 Features

- ✅ **Product Catalog** - Display plants with images and prices
- ✅ **Shopping Cart** - Add/remove items
- ✅ **Order Management** - Process customer orders
- ✅ **Responsive Design** - Works on mobile and desktop
- ✅ **Fast Loading** - Global CDN with edge computing
- ✅ **Secure** - SSL/TLS encryption included

## 🛠️ API Endpoints

- `GET /api/products` - List all products
- `GET /api/cart?session=xxx` - Get cart items
- `POST /api/cart` - Add item to cart
- `POST /api/orders` - Create new order

## 📊 Database Schema

Simple tables for:
- **Products** - Plant inventory
- **Orders** - Customer orders
- **Cart Items** - Shopping cart
- **Categories** - Plant categories

## 🎨 Customization

1. **Add Products**: Edit `schema.sql` to add more plants
2. **Change Design**: Modify `public/index.html` styles
3. **Add Features**: Extend `src/index.ts` API

## 🔗 Useful Links

- [Cloudflare Dashboard](https://dash.cloudflare.com)
- [Pages Dashboard](https://dash.cloudflare.com/pages)
- [D1 Database](https://dash.cloudflare.com/d1)
- [R2 Storage](https://dash.cloudflare.com/r2)

## 🆘 Support

- Check Cloudflare documentation
- Review deployment logs
- Test locally with `wrangler dev`

---

**Built with ❤️ for plant lovers in South Africa**
