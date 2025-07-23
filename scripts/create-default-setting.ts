import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: 'lowStockThreshold' },
    update: {
      value: '10',
      category: 'inventory',
      description: 'Default low stock threshold for products',
    },
    create: {
      key: 'lowStockThreshold',
      value: '10',
      category: 'inventory',
      description: 'Default low stock threshold for products',
    },
  });
  console.log('Default lowStockThreshold setting ensured.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
}); 