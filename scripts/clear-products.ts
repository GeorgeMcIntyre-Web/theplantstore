import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all product images...');
  await prisma.productImage.deleteMany({});

  console.log('Deleting all products...');
  await prisma.product.deleteMany({});

  // Optionally, clear other related tables (e.g., product reviews, variants) if you have them
  // await prisma.productReview.deleteMany({});
  // await prisma.productVariant.deleteMany({});

  console.log('✅ All products and related images deleted.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 