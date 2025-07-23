import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      categoryId: true,
      careLevel: true,
      lightRequirement: true,
      wateringFrequency: true,
      plantSize: true,
      growthRate: true,
      isPetSafe: true,
      isActive: true,
    },
    orderBy: { name: 'asc' },
  });

  for (const p of products) {
    console.log(
      `${p.name} | careLevel: ${p.careLevel} | light: ${p.lightRequirement} | water: ${p.wateringFrequency} | size: ${p.plantSize} | growth: ${p.growthRate} | petSafe: ${p.isPetSafe} | active: ${p.isActive}`
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });