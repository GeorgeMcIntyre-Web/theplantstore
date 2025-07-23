-- The Plant Store Database Schema
-- Cloudflare D1 SQLite Database

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'South Africa',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    category_id INTEGER,
    image_url TEXT,
    gallery_urls TEXT, -- JSON array of image URLs
    stock_quantity INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    weight_kg DECIMAL(5,2),
    dimensions_cm TEXT, -- "LxWxH"
    care_level TEXT, -- 'Easy', 'Medium', 'Hard'
    light_requirements TEXT, -- 'Low', 'Medium', 'Bright'
    water_frequency TEXT, -- 'Weekly', 'Bi-weekly', 'Monthly'
    is_featured BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    shipping_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    shipping_city TEXT,
    shipping_postal_code TEXT,
    shipping_country TEXT DEFAULT 'South Africa',
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Cart table (for guest users)
CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    comment TEXT,
    is_approved BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contact form submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT OR IGNORE INTO categories (name, slug, description) VALUES
('Indoor Plants', 'indoor-plants', 'Beautiful plants perfect for indoor spaces'),
('Outdoor Plants', 'outdoor-plants', 'Hardy plants for your garden and outdoor areas'),
('Succulents', 'succulents', 'Low-maintenance succulents and cacti'),
('Flowering Plants', 'flowering-plants', 'Colorful flowering plants to brighten your space'),
('Herbs', 'herbs', 'Fresh herbs for cooking and aromatherapy');

-- Insert sample products
INSERT OR IGNORE INTO products (name, slug, description, price, category_id, stock_quantity, sku, care_level, light_requirements, water_frequency, is_featured) VALUES
('Monstera Deliciosa', 'monstera-deliciosa', 'Beautiful Swiss cheese plant perfect for any room', 299.00, 1, 15, 'MON001', 'Easy', 'Medium', 'Weekly', 1),
('Fiddle Leaf Fig', 'fiddle-leaf-fig', 'Elegant indoor tree that makes a statement', 399.00, 1, 8, 'FIG001', 'Medium', 'Bright', 'Weekly', 1),
('Snake Plant', 'snake-plant', 'Low-maintenance plant that purifies the air', 199.00, 1, 25, 'SNA001', 'Easy', 'Low', 'Bi-weekly', 1),
('Peace Lily', 'peace-lily', 'Beautiful flowering plant that helps clean indoor air', 249.00, 4, 12, 'LIL001', 'Easy', 'Medium', 'Weekly', 0),
('Aloe Vera', 'aloe-vera', 'Medicinal succulent perfect for beginners', 89.00, 3, 30, 'ALO001', 'Easy', 'Bright', 'Monthly', 0),
('Basil Plant', 'basil-plant', 'Fresh basil for your kitchen garden', 45.00, 5, 20, 'BAS001', 'Easy', 'Bright', 'Daily', 0);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_session ON cart(session_id); 