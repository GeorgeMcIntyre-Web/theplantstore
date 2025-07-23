import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductCategories() {
  console.log('🔧 Starting product category fix...');
  
  try {
    // Get all products
    const products = await prisma.product.findMany({
      include: {
        category: true
      }
    });
    
    console.log(`📦 Found ${products.length} products to check`);
    
    let fixed = 0;
    let errors = 0;
    const errorDetails: string[] = [];
    
    for (const product of products) {
      try {
        // Check if the current categoryId is valid (exists in Category table)
        const validCategory = await prisma.category.findUnique({
          where: { id: product.categoryId ?? undefined }
        });
        
        if (validCategory) {
          // Category ID is valid, skip this product
          continue;
        }
        
        // Category ID is invalid, try to find category by name
        console.log(`⚠️  Product "${product.name}" has invalid categoryId: "${product.categoryId}"`);
        
        // Try to find category by name (assuming categoryId contains the category name)
        const categoryByName = await prisma.category.findUnique({
          where: { name: product.categoryId ?? undefined }
        });
        
        if (categoryByName) {
          // Update the product with the correct category ID
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId: categoryByName.id }
          });
          
          console.log(`✅ Fixed product "${product.name}": "${product.categoryId}" → "${categoryByName.name}" (ID: ${categoryByName.id})`);
          fixed++;
        } else {
          // Category not found by name either
          console.log(`❌ Could not find category for product "${product.name}" with categoryId: "${product.categoryId}"`);
          errorDetails.push(`Product "${product.name}" (ID: ${product.id}): Category "${product.categoryId}" not found`);
          errors++;
        }
        
      } catch (error) {
        console.error(`❌ Error processing product "${product.name}":`, error);
        errorDetails.push(`Product "${product.name}" (ID: ${product.id}): ${error}`);
        errors++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`✅ Fixed: ${fixed} products`);
    console.log(`❌ Errors: ${errors} products`);
    
    if (errorDetails.length > 0) {
      console.log('\n❌ Error Details:');
      errorDetails.forEach(detail => console.log(`  - ${detail}`));
    }
    
    if (fixed > 0) {
      console.log('\n🎉 Successfully fixed product categories!');
    } else if (errors === 0) {
      console.log('\n✅ All products already have valid category IDs!');
    } else {
      console.log('\n⚠️  Some products could not be fixed. Please check the error details above.');
    }
    
  } catch (error) {
    console.error('❌ Script failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
fixProductCategories()
  .then(() => {
    console.log('🏁 Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  }); 