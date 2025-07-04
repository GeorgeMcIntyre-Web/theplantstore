import { PrismaClient, UserRole, ExpenseStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding accounting data...');

  // Create expense categories
  const categories = [
    {
      name: 'Marketing & Advertising',
      description: 'All marketing and advertising expenses including digital ads, print materials, and promotional activities'
    },
    {
      name: 'Office Supplies',
      description: 'Office supplies, stationery, and general office expenses'
    },
    {
      name: 'Utilities',
      description: 'Electricity, water, internet, phone, and other utility bills'
    },
    {
      name: 'Rent & Property',
      description: 'Office rent, property maintenance, and related expenses'
    },
    {
      name: 'Travel & Transport',
      description: 'Business travel, fuel, vehicle maintenance, and transportation costs'
    },
    {
      name: 'Professional Services',
      description: 'Legal fees, accounting services, consulting, and professional subscriptions'
    },
    {
      name: 'Equipment & Technology',
      description: 'Computers, software, equipment purchases, and technology expenses'
    },
    {
      name: 'Insurance',
      description: 'Business insurance, liability coverage, and related policies'
    },
    {
      name: 'Employee Benefits',
      description: 'Health insurance, retirement contributions, and employee benefits'
    },
    {
      name: 'Miscellaneous',
      description: 'Other business expenses that don\'t fit into specific categories'
    }
  ];

  console.log('📁 Creating expense categories...');
  for (const category of categories) {
    const existing = await prisma.expenseCategory.findUnique({
      where: { name: category.name }
    });

    if (!existing) {
      await prisma.expenseCategory.create({
        data: category
      });
      console.log(`✅ Created category: ${category.name}`);
    } else {
      console.log(`⏭️  Category already exists: ${category.name}`);
    }
  }

  // Create sample expenses for testing
  console.log('💰 Creating sample expenses...');
  
  // Get a user with financial permissions
  const financialUser = await prisma.user.findFirst({
    where: {
      role: {
        in: [UserRole.FINANCIAL_MANAGER, UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN]
      }
    }
  });

  if (!financialUser) {
    console.log('⚠️  No financial user found. Please create a user with FINANCIAL_MANAGER, ACCOUNTANT, or SUPER_ADMIN role first.');
    return;
  }

  // Get categories
  const marketingCategory = await prisma.expenseCategory.findUnique({
    where: { name: 'Marketing & Advertising' }
  });
  const officeCategory = await prisma.expenseCategory.findUnique({
    where: { name: 'Office Supplies' }
  });
  const utilitiesCategory = await prisma.expenseCategory.findUnique({
    where: { name: 'Utilities' }
  });

  if (!marketingCategory || !officeCategory || !utilitiesCategory) {
    console.log('⚠️  Required categories not found. Please run the category creation first.');
    return;
  }

  // Create sample expenses
  const sampleExpenses = [
    {
      description: 'Google Ads Campaign - Q1 2025',
      amount: 2500.00,
      expenseDate: new Date('2025-01-15'),
      category: { connect: { id: marketingCategory.id } },
      vendorName: 'Google LLC',
      notes: 'Q1 marketing campaign for plant store promotion',
      vatAmount: 326.09,
      vatRate: 15,
      status: ExpenseStatus.APPROVED,
      user: { connect: { id: financialUser.id } },
    },
    {
      description: 'Office Supplies - January 2025',
      amount: 450.00,
      expenseDate: new Date('2025-01-20'),
      category: { connect: { id: officeCategory.id } },
      vendorName: 'Staples South Africa',
      notes: 'Monthly office supplies including paper, pens, and printer cartridges',
      vatAmount: 58.70,
      vatRate: 15,
      status: ExpenseStatus.APPROVED,
      user: { connect: { id: financialUser.id } },
    },
    {
      description: 'Internet & Phone Services - January 2025',
      amount: 1200.00,
      expenseDate: new Date('2025-01-25'),
      category: { connect: { id: utilitiesCategory.id } },
      vendorName: 'Telkom SA',
      notes: 'Monthly internet and phone services for office',
      vatAmount: 156.52,
      vatRate: 15,
      status: ExpenseStatus.PAID,
      user: { connect: { id: financialUser.id } },
    },
    {
      description: 'Social Media Advertising - February 2025',
      amount: 1800.00,
      expenseDate: new Date('2025-02-10'),
      category: { connect: { id: marketingCategory.id } },
      vendorName: 'Meta Platforms',
      notes: 'Facebook and Instagram advertising campaign',
      vatAmount: 234.78,
      vatRate: 15,
      status: ExpenseStatus.PENDING_APPROVAL,
      user: { connect: { id: financialUser.id } },
    },
    {
      description: 'Electricity Bill - January 2025',
      amount: 850.00,
      expenseDate: new Date('2025-01-30'),
      category: { connect: { id: utilitiesCategory.id } },
      vendorName: 'Eskom',
      notes: 'Monthly electricity consumption for office and greenhouse',
      vatAmount: 110.87,
      vatRate: 15,
      status: ExpenseStatus.APPROVED,
      user: { connect: { id: financialUser.id } },
    }
  ];

  for (const expenseData of sampleExpenses) {
    const existing = await prisma.expense.findFirst({
      where: {
        description: expenseData.description,
        expenseDate: expenseData.expenseDate
      }
    });

    if (!existing) {
      const expense = await prisma.expense.create({
        data: expenseData
      });
      console.log(`✅ Created expense: ${expense.description}`);

      // Create audit log for the expense creation
      await prisma.expenseAuditLog.create({
        data: {
          expenseId: expense.id,
          userId: financialUser.id,
          action: 'CREATE',
          after: {
            description: expense.description,
            amount: Number(expense.amount),
            status: expense.status,
            categoryId: expense.categoryId,
            vendorName: expense.vendorName
          }
        }
      });

      // If expense is approved, create approval audit log
      if (expense.status === ExpenseStatus.APPROVED || expense.status === ExpenseStatus.PAID) {
        await prisma.expenseApproval.create({
          data: {
            expenseId: expense.id,
            approverId: financialUser.id,
            status: 'APPROVED',
            comments: 'Auto-approved for seeding purposes'
          }
        });

        await prisma.expenseAuditLog.create({
          data: {
            expenseId: expense.id,
            userId: financialUser.id,
            action: 'APPROVE',
            before: {
              status: 'DRAFT'
            },
            after: {
              status: expense.status
            }
          }
        });
      }
    } else {
      console.log(`⏭️  Expense already exists: ${expenseData.description}`);
    }
  }

  console.log('✅ Accounting data seeding completed!');
  console.log('');
  console.log('📊 Summary:');
  console.log(`   - Categories: ${categories.length}`);
  console.log(`   - Sample Expenses: ${sampleExpenses.length}`);
  console.log('');
  console.log('🚀 You can now test the accounting module with this sample data.');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding accounting data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 