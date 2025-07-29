#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌿 The House Plant Store - Wrangler Deployment Script');
console.log('==================================================\n');

// Colors for console output
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

function runCommand(command, description) {
  try {
    log(`🔄 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return false;
  }
}

function checkPrerequisites() {
  log('🔍 Checking prerequisites...', 'blue');
  
  // Check if wrangler is installed
  try {
    execSync('wrangler --version', { stdio: 'pipe' });
    log('✅ Wrangler CLI is installed', 'green');
  } catch (error) {
    log('❌ Wrangler CLI not found. Installing...', 'yellow');
    runCommand('npm install -g wrangler', 'Installing Wrangler CLI');
  }
  
  // Check if .env file exists
  if (!fs.existsSync('.env')) {
    log('⚠️  .env file not found. Please create one with your environment variables.', 'yellow');
    log('Required variables:', 'yellow');
    log('  - DATABASE_URL', 'yellow');
    log('  - NEXTAUTH_SECRET', 'yellow');
    log('  - NEXTAUTH_URL', 'yellow');
    log('  - SENDGRID_API_KEY', 'yellow');
    log('  - CLOUDINARY_URL', 'yellow');
    log('  - PAYSTACK_SECRET_KEY', 'yellow');
    log('  - YOCO_SECRET_KEY', 'yellow');
  } else {
    log('✅ .env file found', 'green');
  }
}

function buildProject() {
  log('🏗️  Building project...', 'blue');
  
  // Install dependencies
  if (!runCommand('npm install', 'Installing dependencies')) {
    return false;
  }
  
  // Generate Prisma client
  if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
    return false;
  }
  
  // Build the project
  if (!runCommand('npm run build:static', 'Building static export')) {
    return false;
  }
  
  return true;
}

function setupSecrets() {
  log('🔐 Setting up Cloudflare secrets...', 'blue');
  
  const envFile = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envFile)) {
    log('❌ .env file not found. Please create it first.', 'red');
    return false;
  }
  
  const envContent = fs.readFileSync(envFile, 'utf8');
  const envVars = envContent.split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.split('=')[0]);
  
  for (const envVar of envVars) {
    if (envVar) {
      log(`Setting secret: ${envVar}`, 'blue');
      try {
        execSync(`wrangler secret put ${envVar}`, { stdio: 'pipe' });
        log(`✅ Secret ${envVar} set`, 'green');
      } catch (error) {
        log(`⚠️  Failed to set secret ${envVar}. You may need to set it manually.`, 'yellow');
      }
    }
  }
  
  return true;
}

function deployToCloudflare() {
  log('🚀 Deploying to Cloudflare Pages...', 'blue');
  
  // Deploy to production
  if (!runCommand('wrangler pages deploy out --project-name thehouseplantstore', 'Deploying to Cloudflare Pages')) {
    return false;
  }
  
  return true;
}

function setupDomain() {
  log('🌐 Setting up custom domain...', 'blue');
  
  // Add custom domain
  if (!runCommand('wrangler pages domain add thehouseplantstore thehouseplantstore.com', 'Adding custom domain')) {
    log('⚠️  Domain setup may need to be done manually in Cloudflare dashboard', 'yellow');
  }
  
  return true;
}

function main() {
  log('Starting deployment process...', 'blue');
  
  // Step 1: Check prerequisites
  checkPrerequisites();
  
  // Step 2: Build project
  if (!buildProject()) {
    log('❌ Build failed. Deployment aborted.', 'red');
    process.exit(1);
  }
  
  // Step 3: Setup secrets
  setupSecrets();
  
  // Step 4: Deploy to Cloudflare
  if (!deployToCloudflare()) {
    log('❌ Deployment failed.', 'red');
    process.exit(1);
  }
  
  // Step 5: Setup domain
  setupDomain();
  
  log('\n🎉 Deployment completed successfully!', 'green');
  log('Your site should be available at: https://thehouseplantstore.com', 'green');
  log('\nNext steps:', 'blue');
  log('1. Check the deployment in Cloudflare dashboard', 'blue');
  log('2. Test all functionality on the live site', 'blue');
  log('3. Set up monitoring and analytics', 'blue');
}

if (require.main === module) {
  main();
}

module.exports = { main, buildProject, deployToCloudflare };