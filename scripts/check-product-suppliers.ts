import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductSuppliers() {
  try {
    console.log('Checking product suppliers and stock levels...\n');
    
    // Get all products with their suppliers
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        stockQuantity: true,
        lowStockThreshold: true,
        supplierId: true,
        supplier: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`Found ${products.length} products:\n`);
    
    let productsWithSuppliers = 0;
    let productsWithoutSuppliers = 0;
    let lowStockProducts = 0;
    let lowStockWithSuppliers = 0;

    products.forEach((product) => {
      const hasSupplier = product.supplierId && product.supplier;
      const isLowStock = product.stockQuantity <= product.lowStockThreshold;
      
      if (hasSupplier) productsWithSuppliers++;
      else productsWithoutSuppliers++;
      
      if (isLowStock) {
        lowStockProducts++;
        if (hasSupplier) lowStockWithSuppliers++;
      }

      console.log(`- ${product.name} (${product.slug}):`);
      console.log(`  Stock: ${product.stockQuantity}, Threshold: ${product.lowStockThreshold}${isLowStock ? ' (LOW STOCK!)' : ''}`);
      console.log(`  Supplier: ${hasSupplier ? product.supplier!.name : 'None assigned'}`);
      console.log('');
    });

    console.log('=== SUMMARY ===');
    console.log(`Total products: ${products.length}`);
    console.log(`Products with suppliers: ${productsWithSuppliers}`);
    console.log(`Products without suppliers: ${productsWithoutSuppliers}`);
    console.log(`Low stock products: ${lowStockProducts}`);
    console.log(`Low stock products with suppliers: ${lowStockWithSuppliers}`);
    console.log(`Low stock products without suppliers: ${lowStockProducts - lowStockWithSuppliers}`);

    // Check if there are any suppliers in the database
    const suppliers = await prisma.supplier.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    console.log(`\nAvailable suppliers: ${suppliers.length}`);
    suppliers.forEach((supplier) => {
      console.log(`- ${supplier.name} (${supplier.id})`);
    });

  } catch (error) {
    console.error('Error checking product suppliers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductSuppliers(); 