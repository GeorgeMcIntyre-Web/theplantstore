import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupSuppliers() {
  try {
    console.log('Setting up suppliers and assigning to products...\n');
    
    // Create some default suppliers
    const suppliers = [
      {
        name: 'Plant Paradise Suppliers',
        email: 'orders@plantparadise.co.za',
        phone: '+27 11 123 4567',
        address: '123 Plant Street, Johannesburg, Gauteng',
      },
      {
        name: 'Green Thumb Nursery',
        email: 'sales@greenthumb.co.za',
        phone: '+27 21 987 6543',
        address: '456 Garden Road, Cape Town, Western Cape',
      },
      {
        name: 'Indoor Plant Specialists',
        email: 'info@indoorplants.co.za',
        phone: '+27 31 555 1234',
        address: '789 Indoor Way, Durban, KwaZulu-Natal',
      },
    ];

    console.log('Creating suppliers...');
    const createdSuppliers = [];
    for (const supplierData of suppliers) {
      const supplier = await prisma.supplier.create({
        data: supplierData,
      });
      createdSuppliers.push(supplier);
      console.log(`Created supplier: ${supplier.name} (${supplier.id})`);
    }

    // Get all products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        categoryId: true,
      },
    });

    console.log(`\nAssigning suppliers to ${products.length} products...`);
    
    // Assign suppliers to products (round-robin)
    for (let i = 0; i < products.length; i++) {
      const supplierIndex = i % createdSuppliers.length;
      const supplier = createdSuppliers[supplierIndex];
      
      await prisma.product.update({
        where: { id: products[i].id },
        data: { supplierId: supplier.id },
      });
      
      console.log(`Assigned ${supplier.name} to ${products[i].name}`);
    }

    // Verify the setup
    console.log('\n=== VERIFICATION ===');
    const productsWithSuppliers = await prisma.product.findMany({
      select: {
        name: true,
        stockQuantity: true,
        lowStockThreshold: true,
        supplier: {
          select: {
            name: true,
          },
        },
      },
      where: {
        supplierId: {
          not: null,
        },
      },
    });

    console.log(`Products with suppliers: ${productsWithSuppliers.length}`);
    console.log(`Low stock products with suppliers: ${productsWithSuppliers.filter(p => p.stockQuantity <= p.lowStockThreshold).length}`);

    // Test the auto-draft functionality
    console.log('\n=== TESTING AUTO-DRAFT ===');
    const lowStockProducts = productsWithSuppliers.filter(p => p.stockQuantity <= p.lowStockThreshold);
    
    if (lowStockProducts.length > 0) {
      console.log(`Found ${lowStockProducts.length} low stock products with suppliers:`);
      lowStockProducts.forEach(product => {
        console.log(`- ${product.name}: Stock ${product.stockQuantity}/${product.lowStockThreshold} (Supplier: ${product.supplier?.name})`);
      });
      console.log('\n✅ Auto-draft PO functionality should now work!');
      console.log('You can test it by clicking "Suggest POs" in the admin dashboard.');
    } else {
      console.log('No low stock products found with suppliers.');
    }

  } catch (error) {
    console.error('Error setting up suppliers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupSuppliers(); 