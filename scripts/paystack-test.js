#!/usr/bin/env node

require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Set Paystack keys directly for testing
process.env.PAYSTACK_SECRET_KEY = "sk_test_553c435227232e3c22a49e08f803264549258026";
process.env.PAYSTACK_PUBLIC_KEY = "pk_test_4ce35c3a8b5ead70fdbf1da7ac87760c6a9b6419";

const args = process.argv.slice(2);
const command = args[0];

async function main() {
  try {
    switch (command) {
      case 'test-transaction':
        await testTransaction();
        break;
      case 'list-transactions':
        await listTransactions();
        break;
      case 'verify':
        const reference = args[1];
        if (!reference) {
          console.error('Please provide a transaction reference');
          process.exit(1);
        }
        await verifyTransaction(reference);
        break;
      case 'create-customer':
        await createCustomer();
        break;
      case 'config':
        showConfig();
        break;
      default:
        showHelp();
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function testTransaction() {
  console.log('🧪 Testing Paystack Transaction...');
  
  const testData = {
    amount: 100, // R1.00
    email: 'test@example.com',
    reference: `TEST_${Date.now()}`,
    callback_url: 'https://your-domain.com/payment/verify'
  };

  try {
    const result = await initializeTransaction(testData);
    console.log('✅ Transaction initialized successfully!');
    console.log('📋 Transaction Details:');
    console.log(`   Reference: ${result.data.reference}`);
    console.log(`   Authorization URL: ${result.data.authorization_url}`);
    console.log(`   Access Code: ${result.data.access_code}`);
    console.log('\n🔗 Visit the authorization URL to complete the test payment');
  } catch (error) {
    console.error('❌ Failed to initialize transaction:', error.message);
  }
}

async function listTransactions() {
  console.log('📋 Fetching recent transactions...');
  
  try {
    const result = await listTransactionsAPI({
      page: 1,
      perPage: 10
    });
    
    if (result.data && result.data.length > 0) {
      console.log(`✅ Found ${result.data.length} transactions:`);
      result.data.forEach((txn, index) => {
        console.log(`\n${index + 1}. Transaction ${txn.reference}`);
        console.log(`   Amount: R${(txn.amount / 100).toFixed(2)}`);
        console.log(`   Status: ${txn.status}`);
        console.log(`   Email: ${txn.email}`);
        console.log(`   Date: ${new Date(txn.created_at).toLocaleString()}`);
      });
    } else {
      console.log('📭 No transactions found');
    }
  } catch (error) {
    console.error('❌ Failed to fetch transactions:', error.message);
  }
}

async function verifyTransaction(reference) {
  console.log(`🔍 Verifying transaction: ${reference}`);
  
  try {
    const result = await verifyTransactionAPI(reference);
    
    if (result.status) {
      console.log('✅ Transaction verified successfully!');
      console.log('📋 Transaction Details:');
      console.log(`   Reference: ${result.data.reference}`);
      console.log(`   Amount: R${(result.data.amount / 100).toFixed(2)}`);
      console.log(`   Status: ${result.data.status}`);
      console.log(`   Email: ${result.data.email}`);
      console.log(`   Gateway Response: ${result.data.gateway_response}`);
      console.log(`   Paid At: ${result.data.paid_at ? new Date(result.data.paid_at).toLocaleString() : 'Not paid'}`);
    } else {
      console.log('❌ Transaction verification failed');
      console.log(`   Message: ${result.message}`);
    }
  } catch (error) {
    console.error('❌ Failed to verify transaction:', error.message);
  }
}

async function createCustomer() {
  console.log('👤 Creating test customer...');
  
  const customerData = {
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'Customer',
    phone: '+27123456789'
  };

  try {
    const result = await createCustomerAPI(customerData);
    
    if (result.status) {
      console.log('✅ Customer created successfully!');
      console.log('📋 Customer Details:');
      console.log(`   ID: ${result.data.id}`);
      console.log(`   Email: ${result.data.email}`);
      console.log(`   Name: ${result.data.first_name} ${result.data.last_name}`);
      console.log(`   Phone: ${result.data.phone}`);
    } else {
      console.log('❌ Failed to create customer');
      console.log(`   Message: ${result.message}`);
    }
  } catch (error) {
    console.error('❌ Failed to create customer:', error.message);
  }
}

function showConfig() {
  console.log('⚙️  Paystack Configuration:');
  console.log(`   Secret Key: ${process.env.PAYSTACK_SECRET_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`   Public Key: ${process.env.PAYSTACK_PUBLIC_KEY ? '✅ Set' : '❌ Not set'}`);
  console.log(`   Mode: ${process.env.PAYSTACK_SECRET_KEY?.includes('test') ? '🧪 Test' : '🚀 Live'}`);
  
  if (process.env.PAYSTACK_SECRET_KEY) {
    const keyPreview = process.env.PAYSTACK_SECRET_KEY.substring(0, 10) + '...';
    console.log(`   Secret Key Preview: ${keyPreview}`);
  }
  
  if (process.env.PAYSTACK_PUBLIC_KEY) {
    const keyPreview = process.env.PAYSTACK_PUBLIC_KEY.substring(0, 10) + '...';
    console.log(`   Public Key Preview: ${keyPreview}`);
  }
}

function showHelp() {
  console.log(`
🚀 Paystack CLI Tool

Usage: node scripts/paystack-test.js <command> [options]

Commands:
  test-transaction     Initialize a test transaction
  list-transactions    List recent transactions
  verify <reference>   Verify a transaction by reference
  create-customer      Create a test customer
  config              Show current configuration

Examples:
  node scripts/paystack-test.js test-transaction
  node scripts/paystack-test.js verify TXN_123456789
  node scripts/paystack-test.js config

Environment Variables Required:
  PAYSTACK_SECRET_KEY=sk_test_...
  PAYSTACK_PUBLIC_KEY=pk_test_...
`);
}

// API Functions
async function initializeTransaction(data) {
  const payload = {
    amount: data.amount * 100, // Convert to kobo
    email: data.email,
    reference: data.reference,
    callback_url: data.callback_url,
    currency: 'ZAR',
  };

  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return await response.json();
}

async function listTransactionsAPI(params = {}) {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.perPage) queryParams.append('perPage', params.perPage.toString());

  const response = await fetch(`https://api.paystack.co/transaction?${queryParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });

  return await response.json();
}

async function verifyTransactionAPI(reference) {
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    },
  });

  return await response.json();
}

async function createCustomerAPI(data) {
  const response = await fetch('https://api.paystack.co/customer', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  return await response.json();
}

if (require.main === module) {
  main();
}

module.exports = { main }; 