import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🔧 Creating test user...');

    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'admin@theplantstore.com' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists');
      console.log('Email: admin@theplantstore.com');
      console.log('Password: admin123');
      console.log('Role: SUPER_ADMIN');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('admin123', 12);

    // Create test user
    const user = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@theplantstore.com',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        isActive: true,
      }
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: admin@theplantstore.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: SUPER_ADMIN');
    console.log('🆔 User ID:', user.id);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 