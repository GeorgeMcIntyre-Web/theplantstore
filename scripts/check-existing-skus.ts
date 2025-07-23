import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkExistingSKUs() {
  try {
    console.log('Checking existing SKUs in database...\n');
    
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        sku: true,
      },
      where: {
        sku: {
          not: null,
        },
      },
      orderBy: {
        sku: 'asc',
      },
    });

    console.log(`Found ${products.length} products with SKUs:\n`);
    
    products.forEach((product) => {
      console.log(`- ${product.name} (${product.slug}): SKU = ${product.sku}`);
    });

    if (products.length === 0) {
      console.log('No products with SKUs found in database.');
    }

    // Also check for products without SKUs
    const productsWithoutSKU = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
      where: {
        sku: null,
      },
    });

    console.log(`\nFound ${productsWithoutSKU.length} products without SKUs:\n`);
    
    productsWithoutSKU.forEach((product) => {
      console.log(`- ${product.name} (${product.slug}): No SKU`);
    });

  } catch (error) {
    console.error('Error checking SKUs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingSKUs(); 