#!/usr/bin/env ts-node

import { paystackService } from '../lib/paystack';
import dotenv from 'dotenv';

dotenv.config();

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
      case 'list-customers':
        await listCustomers();
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
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
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
    const result = await paystackService.initializeTransaction(testData);
    console.log('✅ Transaction initialized successfully!');
    console.log('📋 Transaction Details:');
    console.log(`   Reference: ${result.data.reference}`);
    console.log(`   Authorization URL: ${result.data.authorization_url}`);
    console.log(`   Access Code: ${result.data.access_code}`);
    console.log('\n🔗 Visit the authorization URL to complete the test payment');
  } catch (error) {
    console.error('❌ Failed to initialize transaction:', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function listTransactions() {
  console.log('📋 Fetching recent transactions...');
  
  try {
    const result = await paystackService.listTransactions({
      page: 1,
      perPage: 10
    });
    
    if (result.data && result.data.length > 0) {
      console.log(`✅ Found ${result.data.length} transactions:`);
      result.data.forEach((txn: any, index: number) => {
        console.log(`\n${index + 1}. Transaction ${txn.reference}`);
        console.log(`   Amount: ${paystackService.formatAmount(paystackService.parseAmount(txn.amount))}`);
        console.log(`   Status: ${txn.status}`);
        console.log(`   Email: ${txn.email}`);
        console.log(`   Date: ${new Date(txn.created_at).toLocaleString()}`);
      });
    } else {
      console.log('📭 No transactions found');
    }
  } catch (error) {
    console.error('❌ Failed to fetch transactions:', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function listCustomers() {
  console.log('👥 Fetching customers...');
  
  try {
    // Note: This would need to be implemented in the PaystackService
    console.log('⚠️  Customer listing not yet implemented in PaystackService');
    console.log('💡 You can implement this by adding a listCustomers method');
  } catch (error) {
    console.error('❌ Failed to fetch customers:', error instanceof Error ? error.message : 'Unknown error');
  }
}

async function verifyTransaction(reference: string) {
  console.log(`🔍 Verifying transaction: ${reference}`);
  
  try {
    const result = await paystackService.verifyTransaction(reference);
    
    if (result.status) {
      console.log('✅ Transaction verified successfully!');
      console.log('📋 Transaction Details:');
      console.log(`   Reference: ${result.data.reference}`);
      console.log(`   Amount: ${paystackService.formatAmount(paystackService.parseAmount(result.data.amount))}`);
      console.log(`   Status: ${result.data.status}`);
      console.log(`   Email: ${result.data.email}`);
      console.log(`   Gateway Response: ${result.data.gateway_response}`);
      console.log(`   Paid At: ${result.data.paid_at ? new Date(result.data.paid_at).toLocaleString() : 'Not paid'}`);
    } else {
      console.log('❌ Transaction verification failed');
      console.log(`   Message: ${result.message}`);
    }
  } catch (error) {
    console.error('❌ Failed to verify transaction:', error instanceof Error ? error.message : 'Unknown error');
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
    const result = await paystackService.createCustomer(customerData);
    
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
    console.error('❌ Failed to create customer:', error instanceof Error ? error.message : 'Unknown error');
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

Usage: npx ts-node scripts/paystack-cli.ts <command> [options]

Commands:
  test-transaction     Initialize a test transaction
  list-transactions    List recent transactions
  list-customers       List customers (not implemented yet)
  verify <reference>   Verify a transaction by reference
  create-customer      Create a test customer
  config              Show current configuration

Examples:
  npx ts-node scripts/paystack-cli.ts test-transaction
  npx ts-node scripts/paystack-cli.ts verify TXN_123456789
  npx ts-node scripts/paystack-cli.ts config

Environment Variables Required:
  PAYSTACK_SECRET_KEY=sk_test_...
  PAYSTACK_PUBLIC_KEY=pk_test_...
`);
}

if (require.main === module) {
  main();
}

export { main }; 