import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Order matters due to foreign key constraints
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.address.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.shippingRate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.contactForm.deleteMany();
}

main()
  .then(() => {
    console.log('✅ Database cleared!');
    process.exit(0);
  })
  .catch((e) => {
    console.error('❌ Error clearing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 