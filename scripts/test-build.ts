import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBuild() {
  try {
    console.log('🔧 Testing build process...');
    
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful - ${userCount} users found`);
    
    // Test settings query
    const settings = await prisma.setting.findMany();
    console.log(`✅ Settings query successful - ${settings.length} settings found`);
    
    console.log('✅ All build tests passed!');
  } catch (error) {
    console.error('❌ Build test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
  }
}

testBuild(); 