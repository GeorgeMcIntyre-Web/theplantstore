#!/usr/bin/env node

const https = require('https');

// Use environment variable for API key
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY environment variable is required');
  console.log('Please set it with: export SENDGRID_API_KEY="your-api-key"');
  process.exit(1);
}

const args = process.argv.slice(2);
const command = args[0];

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function main() {
  try {
    switch (command) {
      case 'test-email':
        await testEmail();
        break;
      case 'send-email':
        await sendEmail();
        break;
      case 'list-contacts':
        await listContacts();
        break;
      case 'add-contact':
        await addContact();
        break;
      case 'verify-key':
        await verifyKey();
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

async function testEmail() {
  console.log('🧪 Testing SendGrid Email...');
  
  const testData = {
    personalizations: [
      {
        to: [
          {
            email: 'test@example.com',
            name: 'Test User'
          }
        ],
        subject: 'Test Email from The Plant Store'
      }
    ],
    from: {
      email: 'noreply@theplantstore.com',
      name: 'The Plant Store'
    },
    content: [
      {
        type: 'text/plain',
        value: 'This is a test email from The Plant Store SendGrid integration.'
      },
      {
        type: 'text/html',
        value: `
          <html>
            <body>
              <h2>Welcome to The Plant Store!</h2>
              <p>This is a test email to verify our SendGrid integration is working correctly.</p>
              <p>If you receive this email, our email system is properly configured.</p>
              <br>
              <p>Best regards,<br>The Plant Store Team</p>
            </body>
          </html>
        `
      }
    ]
  };

  try {
    const result = await sendEmailAPI(testData);
    
    if (result.statusCode === 202) {
      console.log('✅ Email sent successfully!');
      console.log('📋 Response Details:');
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Message: Email queued for delivery`);
    } else {
      console.log('❌ Failed to send email');
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Response: ${JSON.stringify(result.body, null, 2)}`);
    }
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
}

async function sendEmail() {
  console.log('📧 Sending Custom Email...');
  
  const emailData = {
    personalizations: [
      {
        to: [
          {
            email: 'customer@example.com',
            name: 'Plant Store Customer'
          }
        ],
        subject: 'Your Order Confirmation - The Plant Store'
      }
    ],
    from: {
      email: 'orders@theplantstore.com',
      name: 'The Plant Store'
    },
    content: [
      {
        type: 'text/html',
        value: `
          <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
                <h1 style="color: #28a745; margin: 0;">🌿 The Plant Store</h1>
              </div>
              <div style="padding: 20px;">
                <h2>Thank you for your order!</h2>
                <p>Dear Customer,</p>
                <p>We've received your order and it's being processed. You'll receive a confirmation email once your plants are ready for shipping.</p>
                <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3>Order Details:</h3>
                  <p><strong>Order Number:</strong> #PLANT-2024-001</p>
                  <p><strong>Total Amount:</strong> R299.99</p>
                  <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
                </div>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p>Best regards,<br>The Plant Store Team</p>
              </div>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #6c757d;">
                <p>© 2024 The Plant Store. All rights reserved.</p>
              </div>
            </body>
          </html>
        `
      }
    ]
  };

  try {
    const result = await sendEmailAPI(emailData);
    
    if (result.statusCode === 202) {
      console.log('✅ Custom email sent successfully!');
      console.log('📋 Response Details:');
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Message: Email queued for delivery`);
    } else {
      console.log('❌ Failed to send email');
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Response: ${JSON.stringify(result.body, null, 2)}`);
    }
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
  }
}

async function listContacts() {
  console.log('👥 Fetching contacts...');
  
  try {
    const result = await listContactsAPI();
    
    if (result.statusCode === 200) {
      const contacts = result.body.contact_count || 0;
      console.log(`✅ Found ${contacts} contacts`);
      
      if (result.body.contacts && result.body.contacts.length > 0) {
        console.log('📋 Contact List:');
        result.body.contacts.forEach((contact, index) => {
          console.log(`\n${index + 1}. ${contact.first_name} ${contact.last_name}`);
          console.log(`   Email: ${contact.email}`);
          console.log(`   Created: ${new Date(contact.created_at).toLocaleString()}`);
        });
      } else {
        console.log('📭 No contacts found');
      }
    } else {
      console.log('❌ Failed to fetch contacts');
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Response: ${JSON.stringify(result.body, null, 2)}`);
    }
  } catch (error) {
    console.error('❌ Failed to fetch contacts:', error.message);
  }
}

async function addContact() {
  console.log('👤 Adding test contact...');
  
  const contactData = {
    contacts: [
      {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'Customer',
        phone_number: '+27123456789'
      }
    ]
  };

  try {
    const result = await addContactAPI(contactData);
    
    if (result.statusCode === 202) {
      console.log('✅ Contact added successfully!');
      console.log('📋 Response Details:');
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Message: Contact queued for processing`);
    } else {
      console.log('❌ Failed to add contact');
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Response: ${JSON.stringify(result.body, null, 2)}`);
    }
  } catch (error) {
    console.error('❌ Failed to add contact:', error.message);
  }
}

async function verifyKey() {
  console.log('🔍 Verifying SendGrid API Key...');
  
  try {
    const result = await verifyKeyAPI();
    
    if (result.statusCode === 200) {
      console.log('✅ API Key is valid!');
      console.log('📋 Account Details:');
      console.log(`   Username: ${result.body.username || 'N/A'}`);
      console.log(`   Email: ${result.body.email || 'N/A'}`);
      console.log(`   Account Type: ${result.body.account_type || 'N/A'}`);
    } else {
      console.log('❌ API Key verification failed');
      console.log(`   Status Code: ${result.statusCode}`);
      console.log(`   Response: ${JSON.stringify(result.body, null, 2)}`);
    }
  } catch (error) {
    console.error('❌ Failed to verify API key:', error.message);
  }
}

function showConfig() {
  console.log('⚙️  SendGrid Configuration:');
  console.log(`   API Key: ✅ Set (from environment variable)`);
  console.log(`   Mode: 🧪 Test`);
  
  const keyPreview = SENDGRID_API_KEY.substring(0, 10) + '...';
  console.log(`   API Key Preview: ${keyPreview}`);
}

function showHelp() {
  console.log(`
📧 SendGrid CLI Tool

Usage: node scripts/sendgrid-cli.js <command> [options]

Commands:
  test-email        Send a test email
  send-email        Send a custom order confirmation email
  list-contacts     List all contacts
  add-contact       Add a test contact
  verify-key        Verify API key validity
  config            Show current configuration

Examples:
  node scripts/sendgrid-cli.js test-email
  node scripts/sendgrid-cli.js verify-key
  node scripts/sendgrid-cli.js config

Environment Variables Required:
  SENDGRID_API_KEY=SG...
`);
}

// API Functions
async function sendEmailAPI(data) {
  const options = {
    hostname: 'api.sendgrid.com',
    port: 443,
    path: '/v3/mail/send',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  return await makeRequest(options, data);
}

async function listContactsAPI() {
  const options = {
    hostname: 'api.sendgrid.com',
    port: 443,
    path: '/v3/marketing/contacts?page_size=100',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    },
  };

  return await makeRequest(options);
}

async function addContactAPI(data) {
  const options = {
    hostname: 'api.sendgrid.com',
    port: 443,
    path: '/v3/marketing/contacts',
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  return await makeRequest(options, data);
}

async function verifyKeyAPI() {
  const options = {
    hostname: 'api.sendgrid.com',
    port: 443,
    path: '/v3/user/profile',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    },
  };

  return await makeRequest(options);
}

if (require.main === module) {
  main();
}

module.exports = { main }; 