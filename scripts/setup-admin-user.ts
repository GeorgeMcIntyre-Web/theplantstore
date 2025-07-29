#!/usr/bin/env ts-node

import { getPrismaClient } from '../lib/db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

interface AdminUserData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

async function createAdminUser(userData: AdminUserData) {
  const prisma = getPrismaClient();
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      console.log(`❌ User with email ${userData.email} already exists`);
      return false;
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: true,
        emailVerified: new Date(),
      }
    });

    console.log(`✅ Admin user created successfully!`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   ID: ${user.id}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    return false;
  }
}

function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 12) {
    errors.push('Password must be at least 12 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

function generateStrongPassword(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 4; i < 16; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function main() {
  console.log('🔐 The Plant Store - Admin User Setup');
  console.log('=====================================\n');

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'create-super-admin':
      await createSuperAdmin();
      break;
    case 'create-role-user':
      await createRoleUser();
      break;
    case 'list-users':
      await listUsers();
      break;
    case 'generate-password':
      const password = generateStrongPassword();
      console.log(`🔑 Generated strong password: ${password}`);
      break;
    default:
      showHelp();
  }
}

async function createSuperAdmin() {
  console.log('👑 Creating Super Admin User\n');
  
  const userData: AdminUserData = {
    name: 'System Administrator',
    email: 'admin@theplantstore.com',
    password: 'TempPassword123!@#',
    role: UserRole.SUPER_ADMIN
  };

  console.log('⚠️  IMPORTANT: This will create a SUPER_ADMIN account');
  console.log('   Email:', userData.email);
  console.log('   Temporary Password:', userData.password);
  console.log('\n🔒 Security Recommendations:');
  console.log('   1. Change password immediately after first login');
  console.log('   2. Enable 2FA (Two-Factor Authentication)');
  console.log('   3. Use a password manager for secure storage');
  console.log('   4. Regular password rotation (90 days)');
  console.log('   5. Monitor login attempts and locations\n');

  const success = await createAdminUser(userData);
  
  if (success) {
    console.log('\n📋 Next Steps:');
    console.log('   1. Login to the admin panel');
    console.log('   2. Change the temporary password');
    console.log('   3. Set up 2FA if available');
    console.log('   4. Create additional user accounts as needed');
    console.log('   5. Configure system settings');
  }
}

async function createRoleUser() {
  console.log('👤 Creating Role-Based User\n');
  
  const roles = Object.values(UserRole);
  console.log('Available roles:', roles.join(', '));
  
  // This would typically use a CLI prompt library
  // For now, we'll use a template
  const userData: AdminUserData = {
    name: 'Plant Manager',
    email: 'plants@theplantstore.com',
    password: 'PlantMgr2024!@#',
    role: UserRole.PLANT_MANAGER
  };

  console.log('Creating Plant Manager account...');
  console.log('   Email:', userData.email);
  console.log('   Role:', userData.role);
  console.log('   Temporary Password:', userData.password);

  const success = await createAdminUser(userData);
  
  if (success) {
    console.log('\n✅ Plant Manager account created successfully!');
    console.log('   User should change password on first login');
  }
}

async function listUsers() {
  const prisma = getPrismaClient();
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('👥 Current Users:\n');
    
    if (users.length === 0) {
      console.log('No users found');
      return;
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || 'No name'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.isActive ? '✅ Active' : '❌ Inactive'}`);
      console.log(`   Created: ${user.createdAt.toLocaleDateString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }
}

function showHelp() {
  console.log(`
🔐 The Plant Store - Admin User Management

Usage: npx ts-node scripts/setup-admin-user.ts <command>

Commands:
  create-super-admin    Create the initial SUPER_ADMIN account
  create-role-user      Create a role-based user account
  list-users           List all current users
  generate-password    Generate a strong password

Examples:
  npx ts-node scripts/setup-admin-user.ts create-super-admin
  npx ts-node scripts/setup-admin-user.ts list-users
  npx ts-node scripts/setup-admin-user.ts generate-password

Security Notes:
  - All admin passwords should be 12+ characters
  - Include uppercase, lowercase, numbers, and symbols
  - Enable 2FA for all admin accounts
  - Regular password rotation recommended
  - Monitor login attempts and locations
`);
}

if (require.main === module) {
  main().catch(console.error);
}

export { createAdminUser, validatePassword, generateStrongPassword }; 