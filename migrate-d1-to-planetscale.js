#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔄 D1 to PlanetScale Migration Script');
console.log('=====================================\n');

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

async function backupD1Data() {
  log('📦 Backing up D1 database...', 'blue');
  
  // Export D1 data
  if (!runCommand('wrangler d1 export houseplantstore-db --output=d1-backup.sql', 'Exporting D1 data')) {
    return false;
  }
  
  log('✅ D1 backup created: d1-backup.sql', 'green');
  return true;
}

async function setupPlanetScale() {
  log('🌐 Setting up PlanetScale database...', 'blue');
  
  log('📋 Manual steps required:', 'yellow');
  log('1. Go to https://planetscale.com', 'yellow');
  log('2. Create new database: thehouseplantstore', 'yellow');
  log('3. Get connection string from "Connect" → "Connect with Prisma"', 'yellow');
  log('4. Update your .env file with the new DATABASE_URL', 'yellow');
  
  const answer = await askQuestion('Have you created the PlanetScale database? (y/n): ');
  return answer.toLowerCase() === 'y';
}

function askQuestion(question) {
  return new Promise((resolve) => {
    const readline = require('readline');
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

async function migrateSchema() {
  log('🏗️  Migrating schema to PlanetScale...', 'blue');
  
  // Generate Prisma client
  if (!runCommand('npx prisma generate', 'Generating Prisma client')) {
    return false;
  }
  
  // Push schema to PlanetScale
  if (!runCommand('npx prisma db push', 'Pushing schema to PlanetScale')) {
    return false;
  }
  
  return true;
}

async function seedDatabase() {
  log('🌱 Seeding PlanetScale database...', 'blue');
  
  if (!runCommand('npm run db:seed', 'Seeding database')) {
    return false;
  }
  
  return true;
}

async function deleteD1Database() {
  log('🗑️  Deleting D1 database...', 'blue');
  
  const answer = await askQuestion('Are you sure you want to delete the D1 database? This cannot be undone! (y/n): ');
  
  if (answer.toLowerCase() === 'y') {
    if (!runCommand('wrangler d1 delete houseplantstore-db', 'Deleting D1 database')) {
      log('⚠️  Failed to delete D1 database. You may need to delete it manually from the Cloudflare dashboard.', 'yellow');
      return false;
    }
    log('✅ D1 database deleted', 'green');
    return true;
  } else {
    log('❌ D1 database deletion cancelled', 'red');
    return false;
  }
}

async function updateConfiguration() {
  log('⚙️  Updating configuration...', 'blue');
  
  // Update wrangler.toml to remove D1 configuration
  const wranglerConfig = fs.readFileSync('wrangler.toml', 'utf8');
  const updatedConfig = wranglerConfig.replace(/\[\[d1_databases\]\].*?database_id.*?\n/s, '');
  fs.writeFileSync('wrangler.toml', updatedConfig);
  
  log('✅ Configuration updated', 'green');
  return true;
}

async function main() {
  log('Starting D1 to PlanetScale migration...', 'blue');
  
  // Step 1: Backup D1 data
  if (!await backupD1Data()) {
    log('❌ Backup failed. Migration aborted.', 'red');
    process.exit(1);
  }
  
  // Step 2: Setup PlanetScale
  if (!await setupPlanetScale()) {
    log('❌ PlanetScale setup failed. Migration aborted.', 'red');
    process.exit(1);
  }
  
  // Step 3: Migrate schema
  if (!await migrateSchema()) {
    log('❌ Schema migration failed. Migration aborted.', 'red');
    process.exit(1);
  }
  
  // Step 4: Seed database
  if (!await seedDatabase()) {
    log('❌ Database seeding failed. Migration aborted.', 'red');
    process.exit(1);
  }
  
  // Step 5: Delete D1 database
  await deleteD1Database();
  
  // Step 6: Update configuration
  await updateConfiguration();
  
  log('\n🎉 Migration completed successfully!', 'green');
  log('\nNext steps:', 'blue');
  log('1. Test your application with the new PlanetScale database', 'blue');
  log('2. Update your deployment scripts to use PlanetScale', 'blue');
  log('3. Monitor the application for any issues', 'blue');
  log('4. Keep the d1-backup.sql file as a backup', 'blue');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, backupD1Data, setupPlanetScale, migrateSchema };