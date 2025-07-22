-- House Plant Store - Simplified D1 Schema
-- Cloudflare D1 Database

-- Products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Store in cents (ZAR)
  sale_price INTEGER,
  stock INTEGER DEFAULT 0,
  image TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  product_id TEXT,
  quantity INTEGER NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  shipping_address TEXT NOT NULL,
  total_amount INTEGER NOT NULL, -- Store in cents (ZAR)
  status TEXT DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  payment_status TEXT DEFAULT 'pending', -- pending, paid, failed
  payment_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Cart table (for guest users)
CREATE TABLE cart_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Categories table
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT
);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Indoor Plants', 'indoor-plants', 'Beautiful plants that thrive indoors'),
('Outdoor Plants', 'outdoor-plants', 'Perfect for gardens and outdoor spaces'),
('Succulents', 'succulents', 'Low-maintenance plants perfect for beginners'),
('Flowering Plants', 'flowering-plants', 'Colorful blooms to brighten your space'),
('Herbs', 'herbs', 'Fresh herbs for cooking and aromatherapy');

-- Insert sample products
INSERT INTO products (id, name, description, price, stock, image, category) VALUES
('p1', 'Monstera Deliciosa', 'Large, beautiful Swiss cheese plant', 2500, 10, '/images/monstera.jpg', 'Indoor Plants'),
('p2', 'Snake Plant', 'Low-maintenance air purifying plant', 1200, 15, '/images/snake-plant.jpg', 'Indoor Plants'),
('p3', 'Aloe Vera', 'Medicinal succulent plant', 800, 20, '/images/aloe-vera.jpg', 'Succulents'),
('p4', 'Peace Lily', 'Elegant flowering indoor plant', 1800, 8, '/images/peace-lily.jpg', 'Flowering Plants'),
('p5', 'Basil Plant', 'Fresh culinary herb', 450, 25, '/images/basil.jpg', 'Herbs');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_cart_items_session ON cart_items(session_id); 