const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing for Cloudflare Pages deployment...');

// Check if out directory exists
if (!fs.existsSync('out')) {
  console.error('❌ Build directory "out" not found. Please run "npm run build" first.');
  process.exit(1);
}

console.log('✅ Build directory found');
console.log('📁 Contents of out directory:');
fs.readdirSync('out').forEach(file => {
  console.log(`   - ${file}`);
});

console.log('\n📋 Next steps:');
console.log('1. Go to Cloudflare Dashboard → Workers & Pages → Pages');
console.log('2. Click "Create a project"');
console.log('3. Choose "Direct Upload"');
console.log('4. Project name: theplantstore-pages');
console.log('5. Upload the "out" folder');
console.log('6. Add custom domain: thehouseplantstore.co.za');
console.log('7. Add environment variables:');
console.log('   - NEXT_PUBLIC_SITE_URL = https://thehouseplantstore.co.za');
console.log('   - NEXT_PUBLIC_SITE_NAME = The Plant Store');
console.log('   - NEXT_PUBLIC_CONTACT_EMAIL = info@thehouseplantstore.co.za');
console.log('   - NEXT_PUBLIC_PHONE = +27 11 123 4567');

console.log('\n🌐 Your API endpoints will be available at:');
console.log('   - https://thehouseplantstore.co.za/api/products');
console.log('   - https://thehouseplantstore.co.za/api/categories');
console.log('   - https://thehouseplantstore.co.za/api/products?featured=true'); 