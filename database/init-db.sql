-- Simple database initialization for The Plant Store
-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS newsletter_subscribers;
DROP TABLE IF EXISTS contact_submissions;

-- Create categories table
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2),
    category_id INTEGER,
    image_url TEXT,
    stock_quantity INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    care_level TEXT,
    light_requirements TEXT,
    water_frequency TEXT,
    is_featured BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Indoor Plants', 'indoor-plants', 'Beautiful plants perfect for indoor spaces'),
('Outdoor Plants', 'outdoor-plants', 'Hardy plants for your garden and outdoor areas'),
('Succulents', 'succulents', 'Low-maintenance succulents and cacti'),
('Flowering Plants', 'flowering-plants', 'Colorful flowering plants to brighten your space'),
('Herbs', 'herbs', 'Fresh herbs for cooking and aromatherapy');

-- Insert sample products
INSERT INTO products (name, slug, description, price, category_id, stock_quantity, sku, care_level, light_requirements, water_frequency, is_featured) VALUES
('Monstera Deliciosa', 'monstera-deliciosa', 'Beautiful Swiss cheese plant perfect for any room', 299.00, 1, 15, 'MON001', 'Easy', 'Medium', 'Weekly', 1),
('Fiddle Leaf Fig', 'fiddle-leaf-fig', 'Elegant indoor tree that makes a statement', 399.00, 1, 8, 'FIG001', 'Medium', 'Bright', 'Weekly', 1),
('Snake Plant', 'snake-plant', 'Low-maintenance plant that purifies the air', 199.00, 1, 25, 'SNA001', 'Easy', 'Low', 'Bi-weekly', 1),
('Peace Lily', 'peace-lily', 'Beautiful flowering plant that helps clean indoor air', 249.00, 4, 12, 'LIL001', 'Easy', 'Medium', 'Weekly', 0),
('Aloe Vera', 'aloe-vera', 'Medicinal succulent perfect for beginners', 89.00, 3, 30, 'ALO001', 'Easy', 'Bright', 'Monthly', 0),
('Basil Plant', 'basil-plant', 'Fresh basil for your kitchen garden', 45.00, 5, 20, 'BAS001', 'Easy', 'Bright', 'Daily', 0); 