#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

console.log('🌿 PlanetScale Setup for The House Plant Store');
console.log('==============================================\n');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function setupEnvironment() {
  log('📋 Setting up environment variables...', 'blue');
  
  log('Please provide the following information:', 'yellow');
  
  const databaseUrl = await askQuestion('PlanetScale DATABASE_URL (mysql://...): ');
  const nextauthSecret = await askQuestion('NEXTAUTH_SECRET (or press Enter for auto-generate): ');
  const nextauthUrl = await askQuestion('NEXTAUTH_URL (default: https://thehouseplantstore.com): ') || 'https://thehouseplantstore.com';
  
  // Generate a secret if not provided
  const secret = nextauthSecret || require('crypto').randomBytes(32).toString('hex');
  
  // Create .env content
  const envContent = `# Database Configuration (PlanetScale MySQL)
DATABASE_URL="${databaseUrl}"

# NextAuth Configuration
NEXTAUTH_SECRET="${secret}"
NEXTAUTH_URL="${nextauthUrl}"

# OAuth Providers (Optional - for Google and Microsoft login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email Configuration (for notifications and newsletters)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@thehouseplantstore.com"

# Payment Configuration (Yoco)
YOCO_SECRET_KEY="your-yoco-secret-key"
YOCO_PUBLIC_KEY="your-yoco-public-key"

# Shipping Configuration
COURIER_GUY_API_KEY="your-courier-guy-api-key"
ARAMEX_API_KEY="your-aramex-api-key"
POSTNET_API_KEY="your-postnet-api-key"

# Cloud Storage (Cloudinary)
CLOUDINARY_URL="your-cloudinary-url"

# SendGrid (for email)
SENDGRID_API_KEY="your-sendgrid-api-key"

# Paystack (payment processor)
PAYSTACK_SECRET_KEY="your-paystack-secret-key"

# Environment
NODE_ENV="production"
`;

  // Write .env file
  fs.writeFileSync('.env', envContent);
  log('✅ .env file created successfully!', 'green');
  
  return true;
}

async function testDatabaseConnection() {
  log('🔍 Testing database connection...', 'blue');
  
  try {
    execSync('npx prisma generate', { stdio: 'inherit' });
    log('✅ Prisma client generated', 'green');
    
    execSync('npx prisma db push', { stdio: 'inherit' });
    log('✅ Database schema pushed successfully', 'green');
    
    return true;
  } catch (error) {
    log('❌ Database connection failed', 'red');
    log('Please check your DATABASE_URL and try again', 'yellow');
    return false;
  }
}

async function seedDatabase() {
  log('🌱 Seeding database...', 'blue');
  
  try {
    execSync('npm run db:seed', { stdio: 'inherit' });
    log('✅ Database seeded successfully', 'green');
    return true;
  } catch (error) {
    log('❌ Database seeding failed', 'red');
    return false;
  }
}

async function main() {
  log('Starting PlanetScale setup...', 'blue');
  
  // Step 1: Setup environment
  if (!await setupEnvironment()) {
    log('❌ Environment setup failed', 'red');
    process.exit(1);
  }
  
  // Step 2: Test database connection
  if (!await testDatabaseConnection()) {
    log('❌ Database connection failed', 'red');
    process.exit(1);
  }
  
  // Step 3: Seed database
  await seedDatabase();
  
  log('\n🎉 PlanetScale setup completed successfully!', 'green');
  log('\nNext steps:', 'blue');
  log('1. Test your application locally', 'blue');
  log('2. Deploy to Cloudflare Pages', 'blue');
  log('3. Set up environment variables in Cloudflare', 'blue');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { setupEnvironment, testDatabaseConnection, seedDatabase };