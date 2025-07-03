import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const supplier = await prisma.supplier.findFirst();
  if (!supplier) {
    console.error('❌ No suppliers found. Please create a supplier first.');
    process.exit(1);
  }
  const updated = await prisma.product.updateMany({
    where: { supplierId: null },
    data: { supplierId: supplier.id },
  });
  console.log(`✅ Assigned supplier '${supplier.name}' to ${updated.count} products.`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 