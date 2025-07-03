import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { email: 'admin@thehouseplantstore.co.za' },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  console.log('Admin users in database:');
  console.log('========================');
  users.forEach(user => {
    console.log(`ID: ${user.id}`);
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
    console.log(`Active: ${user.isActive}`);
    console.log(`Created: ${user.createdAt}`);
    console.log('---');
  });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  }); 