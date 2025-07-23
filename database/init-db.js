// Database initialization script for Cloudflare D1
// Run this after deploying your Cloudflare Worker

import { readFileSync } from 'fs';

const schema = readFileSync('./database/schema.sql', 'utf8');

export async function initDatabase(env) {
  try {
    console.log('Initializing database...');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await env.DB.prepare(statement).run();
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }

    console.log('Database initialized successfully!');
    
    // Verify the setup
    const categories = await env.DB.prepare('SELECT COUNT(*) as count FROM categories').first();
    const products = await env.DB.prepare('SELECT COUNT(*) as count FROM products').first();
    
    console.log(`Categories created: ${categories.count}`);
    console.log(`Products created: ${products.count}`);
    
    return {
      success: true,
      categories: categories.count,
      products: products.count
    };
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to reset database (use with caution)
export async function resetDatabase(env) {
  try {
    console.log('Resetting database...');
    
    const tables = [
      'contact_submissions',
      'newsletter_subscribers', 
      'reviews',
      'cart',
      'order_items',
      'orders',
      'products',
      'categories',
      'users'
    ];

    for (const table of tables) {
      await env.DB.prepare(`DROP TABLE IF EXISTS ${table}`).run();
      console.log(`Dropped table: ${table}`);
    }

    // Reinitialize
    return await initDatabase(env);
    
  } catch (error) {
    console.error('Database reset failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to add sample data
export async function addSampleData(env) {
  try {
    console.log('Adding sample data...');
    
    // Add more products
    const sampleProducts = [
      {
        name: 'Pothos Golden',
        slug: 'pothos-golden',
        description: 'Beautiful trailing plant with golden variegation',
        price: 179.00,
        category_id: 1,
        stock_quantity: 20,
        sku: 'POT001',
        care_level: 'Easy',
        light_requirements: 'Low',
        water_frequency: 'Weekly',
        is_featured: 0
      },
      {
        name: 'ZZ Plant',
        slug: 'zz-plant',
        description: 'Ultra-low maintenance plant that thrives in low light',
        price: 229.00,
        category_id: 1,
        stock_quantity: 18,
        sku: 'ZZ001',
        care_level: 'Easy',
        light_requirements: 'Low',
        water_frequency: 'Monthly',
        is_featured: 0
      },
      {
        name: 'Lavender',
        slug: 'lavender',
        description: 'Fragrant herb perfect for gardens and aromatherapy',
        price: 75.00,
        category_id: 5,
        stock_quantity: 35,
        sku: 'LAV001',
        care_level: 'Medium',
        light_requirements: 'Bright',
        water_frequency: 'Weekly',
        is_featured: 0
      }
    ];

    for (const product of sampleProducts) {
      await env.DB.prepare(`
        INSERT OR IGNORE INTO products 
        (name, slug, description, price, category_id, stock_quantity, sku, care_level, light_requirements, water_frequency, is_featured)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        product.name,
        product.slug,
        product.description,
        product.price,
        product.category_id,
        product.stock_quantity,
        product.sku,
        product.care_level,
        product.light_requirements,
        product.water_frequency,
        product.is_featured
      ).run();
    }

    console.log('Sample data added successfully!');
    return { success: true };
    
  } catch (error) {
    console.error('Adding sample data failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 