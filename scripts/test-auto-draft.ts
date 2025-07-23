import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAutoDraft() {
  try {
    console.log('Testing auto-draft PO functionality...\n');
    
    // First, let's check if there are any existing draft POs
    const existingPOs = await prisma.purchaseOrder.findMany({
      where: { status: 'DRAFT' },
      include: { supplier: true },
    });
    
    console.log(`Existing draft POs: ${existingPOs.length}`);
    existingPOs.forEach(po => {
      console.log(`- ${po.orderNumber}: ${po.supplier.name}`);
    });

    // Get an admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'PLANT_MANAGER', 'ORDER_MANAGER'],
        },
      },
    });

    if (!adminUser) {
      console.log('No admin user found. Creating one...');
      const newAdmin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@theplantstore.com',
          password: 'admin123', // This should be hashed in production
          role: 'SUPER_ADMIN',
        },
      });
      console.log(`Created admin user: ${newAdmin.name} (${newAdmin.id})`);
    }

    const adminId = adminUser?.id || 'admin-user-id';
    
    console.log(`\nRunning auto-draft for admin: ${adminId}`);
    
    // Simulate the auto-draft logic
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        price: true,
        stockQuantity: true,
        lowStockThreshold: true,
        supplierId: true,
      },
    });
    
    const lowStock = products.filter(
      (p) => typeof p.stockQuantity === 'number' && 
             typeof p.lowStockThreshold === 'number' && 
             p.stockQuantity <= p.lowStockThreshold && 
             p.supplierId
    );

    console.log(`Found ${lowStock.length} low stock products with suppliers`);
    
    const createdPOs = [];
    for (const product of lowStock) {
      // Check if a draft PO already exists for this product and supplier
      const draftPOs = await prisma.purchaseOrder.findMany({
        where: {
          status: 'DRAFT',
          supplierId: product.supplierId!,
          adminId,
        },
      });
      
      const existing = draftPOs.find((po: any) =>
        Array.isArray(po.items) &&
        po.items.some((item: any) => item.productId === product.id)
      );
      
      if (existing) {
        console.log(`Skipping ${product.name} - draft PO already exists`);
        continue;
      }
      
      // Create draft PO
      const items = [{
        productId: product.id,
        name: product.name,
        quantity: Math.max(1, product.lowStockThreshold - product.stockQuantity + 1),
        price: product.price,
      }];
      
      const total = Number(product.price) * items[0].quantity;
      const po = await prisma.purchaseOrder.create({
        data: {
          orderNumber: `PO-${new Date().toISOString().slice(0,10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'DRAFT',
          adminId,
          supplierId: product.supplierId!,
          items,
          total,
        },
        include: { supplier: true },
      });
      
      console.log(`Created draft PO: ${po.orderNumber} for ${product.name} (${po.supplier.name})`);
      createdPOs.push(po);
    }
    
    console.log(`\n✅ Created ${createdPOs.length} draft purchase orders!`);
    
    // Show all draft POs
    const allDraftPOs = await prisma.purchaseOrder.findMany({
      where: { status: 'DRAFT' },
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`\nTotal draft POs in system: ${allDraftPOs.length}`);
    allDraftPOs.forEach(po => {
      console.log(`- ${po.orderNumber}: ${po.supplier.name} (${po.total})`);
    });

  } catch (error) {
    console.error('Error testing auto-draft:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAutoDraft(); 