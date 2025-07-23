#!/usr/bin/env node

/**
 * External Integrations Setup Script
 * 
 * This script helps configure all external service integrations
 * for The House Plant Store.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const envPath = path.join(process.cwd(), '.env');
const envExamplePath = path.join(process.cwd(), 'env.example');

console.log('🌱 The House Plant Store - External Integrations Setup\n');

async function main() {
  try {
    // Check if .env exists
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    console.log('📋 Setting up external integrations...\n');

    // Google OAuth Setup
    console.log('🔐 1. Google OAuth Configuration');
    console.log('   Visit: https://console.cloud.google.com');
    console.log('   Create a new project and enable OAuth 2.0');
    console.log('   Get your Client ID and Client Secret\n');

    const googleClientId = await question('   Google Client ID: ');
    const googleClientSecret = await question('   Google Client Secret: ');

    // Paystack Setup
    console.log('\n💳 2. Paystack Payment Configuration');
    console.log('   Visit: https://paystack.com');
    console.log('   Create a business account and get your API keys\n');

    const paystackSecretKey = await question('   Paystack Secret Key (sk_test_... or sk_live_...): ');
    const paystackPublicKey = await question('   Paystack Public Key (pk_test_... or pk_live_...): ');

    // SendGrid Setup
    console.log('\n📧 3. SendGrid Email Configuration');
    console.log('   Visit: https://sendgrid.com');
    console.log('   Create a free account and get your API key\n');

    const sendgridApiKey = await question('   SendGrid API Key (SG....): ');
    const sendgridFromEmail = await question('   From Email (noreply@yourdomain.com): ');
    const sendgridFromName = await question('   From Name (The House Plant Store): ');

    // Cloudinary Setup
    console.log('\n☁️ 4. Cloudinary File Storage Configuration');
    console.log('   Visit: https://cloudinary.com');
    console.log('   Create a free account and get your credentials\n');

    const cloudinaryCloudName = await question('   Cloudinary Cloud Name: ');
    const cloudinaryApiKey = await question('   Cloudinary API Key: ');
    const cloudinaryApiSecret = await question('   Cloudinary API Secret: ');

    // Azure AD Setup (Optional)
    console.log('\n🔐 5. Azure AD Configuration (Optional)');
    console.log('   Visit: https://portal.azure.com');
    console.log('   Register your application in Azure AD\n');

    const useAzure = await question('   Use Azure AD? (y/N): ');
    let azureClientId = '', azureClientSecret = '', azureTenantId = '';
    
    if (useAzure.toLowerCase() === 'y') {
      azureClientId = await question('   Azure Client ID: ');
      azureClientSecret = await question('   Azure Client Secret: ');
      azureTenantId = await question('   Azure Tenant ID: ');
    }

    // Build environment variables
    const newEnvVars = [
      '',
      '# External Integrations',
      '',
      '# Google OAuth',
      `GOOGLE_CLIENT_ID="${googleClientId}"`,
      `GOOGLE_CLIENT_SECRET="${googleClientSecret}"`,
      '',
      '# Paystack Payment',
      `PAYSTACK_SECRET_KEY="${paystackSecretKey}"`,
      `PAYSTACK_PUBLIC_KEY="${paystackPublicKey}"`,
      `PAYSTACK_WEBHOOK_SECRET="your-webhook-secret"`,
      '',
      '# SendGrid Email',
      `SENDGRID_API_KEY="${sendgridApiKey}"`,
      `SENDGRID_FROM_EMAIL="${sendgridFromEmail}"`,
      `SENDGRID_FROM_NAME="${sendgridFromName}"`,
      '',
      '# Cloudinary File Storage',
      `CLOUDINARY_CLOUD_NAME="${cloudinaryCloudName}"`,
      `CLOUDINARY_API_KEY="${cloudinaryApiKey}"`,
      `CLOUDINARY_API_SECRET="${cloudinaryApiSecret}"`,
      '',
    ];

    if (useAzure.toLowerCase() === 'y') {
      newEnvVars.push(
        '# Azure AD',
        `AZURE_AD_CLIENT_ID="${azureClientId}"`,
        `AZURE_AD_CLIENT_SECRET="${azureClientSecret}"`,
        `AZURE_AD_TENANT_ID="${azureTenantId}"`,
        ''
      );
    }

    // Update .env file
    const updatedEnvContent = envContent + newEnvVars.join('\n');
    fs.writeFileSync(envPath, updatedEnvContent);

    console.log('\n✅ Configuration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Review your .env file');
    console.log('   2. Test the integrations');
    console.log('   3. Deploy to production');
    console.log('\n📚 Documentation:');
    console.log('   - See EXTERNAL_INTEGRATIONS_GUIDE.md for detailed setup');
    console.log('   - Check each service dashboard for additional configuration');

    // Create setup summary
    const summary = {
      timestamp: new Date().toISOString(),
      services: {
        google: !!googleClientId,
        paystack: !!paystackSecretKey,
        sendgrid: !!sendgridApiKey,
        cloudinary: !!cloudinaryCloudName,
        azure: useAzure.toLowerCase() === 'y',
      },
      notes: [
        'Remember to configure webhooks for Paystack',
        'Set up domain authentication for SendGrid',
        'Configure CORS for Cloudinary if needed',
        'Test all integrations before going live',
      ]
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'integration-setup-summary.json'),
      JSON.stringify(summary, null, 2)
    );

    console.log('\n📄 Setup summary saved to integration-setup-summary.json');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main(); 