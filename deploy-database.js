#!/usr/bin/env node

// Database deployment script for The Plant Store
// Run this after setting up the D1 binding

import { readFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('🌿 The Plant Store - Database Deployment');
console.log('==========================================');

async function deployDatabase() {
  try {
    console.log('1. Installing Wrangler CLI...');
    execSync('npm install -g wrangler', { stdio: 'inherit' });

    console.log('2. Logging into Cloudflare...');
    execSync('wrangler login', { stdio: 'inherit' });

    console.log('3. Deploying database schema...');
    execSync('wrangler d1 execute houseplantstore-db --file=./database/schema.sql', { stdio: 'inherit' });

    console.log('4. Deploying API functions...');
    execSync('wrangler deploy', { stdio: 'inherit' });

    console.log('✅ Database deployment completed successfully!');
    console.log('');
    console.log('🌐 Your API endpoints are now available:');
    console.log('   - Products: https://theplantstore.fractalnexustech.workers.dev/api/products');
    console.log('   - Categories: https://theplantstore.fractalnexustech.workers.dev/api/categories');
    console.log('');
    console.log('📊 Database contains:');
    console.log('   - 5 product categories');
    console.log('   - 6 sample products');
    console.log('   - Optimized indexes');

  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    console.log('');
    console.log('🔧 Manual steps:');
    console.log('1. Go to Cloudflare D1 section');
    console.log('2. Click on houseplantstore-db');
    console.log('3. Copy the database ID');
    console.log('4. Update wrangler.toml with the correct ID');
    console.log('5. Run: wrangler d1 execute houseplantstore-db --file=./database/schema.sql');
  }
}

deployDatabase(); 