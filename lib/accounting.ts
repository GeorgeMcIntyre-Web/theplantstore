import { getPrismaClient } from './db';
import { Prisma, UserRole, OrderStatus } from '@prisma/client';

// Enhanced error handling with custom error types
export class AccountingError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AccountingError';
  }
}

export class ValidationError extends AccountingError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class InsufficientPermissionsError extends AccountingError {
  constructor(message: string) {
    super(message, 'INSUFFICIENT_PERMISSIONS');
    this.name = 'InsufficientPermissionsError';
  }
}

// Validation functions
export const validateAmount = (amount: number | string | Prisma.Decimal): Prisma.Decimal => {
  try {
    const decimalAmount = new Prisma.Decimal(amount);
    if (decimalAmount.lessThanOrEqualTo(0)) {
      throw new ValidationError('Amount must be greater than zero');
    }
    return decimalAmount;
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Invalid amount format');
  }
};

export const validateVATRate = (rate: number | string | Prisma.Decimal): Prisma.Decimal => {
  try {
    const decimalRate = new Prisma.Decimal(rate);
    if (decimalRate.lessThan(0) || decimalRate.greaterThan(100)) {
      throw new ValidationError('VAT rate must be between 0 and 100');
    }
    return decimalRate;
  } catch (error) {
    if (error instanceof ValidationError) throw error;
    throw new ValidationError('Invalid VAT rate format');
  }
};

// Enhanced journal entry creation with better error handling
export async function createJournalEntry(
  data: {
    entryDate: Date;
    referenceId: string;
    referenceType: string;
    description: string;
    entries: Array<{
      accountId: string;
      debitAmount?: Prisma.Decimal;
      creditAmount?: Prisma.Decimal;
    }>;
  },
  tx?: Prisma.TransactionClient
): Promise<any> {
  const client = tx || getPrismaClient();
  
  try {
    // Validate entries balance
    const totalDebits = data.entries
      .map(entry => entry.debitAmount || new Prisma.Decimal(0))
      .reduce((sum, debit) => sum.plus(debit), new Prisma.Decimal(0));
    
    const totalCredits = data.entries
      .map(entry => entry.creditAmount || new Prisma.Decimal(0))
      .reduce((sum, credit) => sum.plus(credit), new Prisma.Decimal(0));
    
    if (!totalDebits.equals(totalCredits)) {
      throw new ValidationError(
        'Journal entries must balance',
        { totalDebits: totalDebits.toString(), totalCredits: totalCredits.toString() }
      );
    }
    
    // Validate that each entry has either debit or credit
    for (const entry of data.entries) {
      if ((!entry.debitAmount || entry.debitAmount.equals(0)) && (!entry.creditAmount || entry.creditAmount.equals(0))) {
        throw new ValidationError('Each journal entry must have either a debit or credit amount');
      }
      if (entry.debitAmount && entry.creditAmount && !entry.debitAmount.equals(0) && !entry.creditAmount.equals(0)) {
        throw new ValidationError('Each journal entry cannot have both debit and credit amounts');
      }
    }
    
    const journalEntry = await client.journalEntry.create({
      data: {
        entryDate: data.entryDate,
        referenceId: data.referenceId,
        referenceType: data.referenceType,
        description: data.description,
        journalLines: {
          create: data.entries.map(entry => ({
            accountId: entry.accountId,
            debitAmount: entry.debitAmount || new Prisma.Decimal(0),
            creditAmount: entry.creditAmount || new Prisma.Decimal(0),
          }))
        }
      },
      include: {
        journalLines: {
          include: {
            account: true
          }
        }
      }
    });
    
    return journalEntry;
  } catch (error) {
    if (error instanceof AccountingError) throw error;
    console.error('Error creating journal entry:', error);
    throw new AccountingError('Failed to create journal entry', 'DATABASE_ERROR', error);
  }
}

// Enhanced expense journal entry creation
export async function createExpenseJournalEntry(
  expense: any,
  tx?: Prisma.TransactionClient
): Promise<any> {
  const client = tx || getPrismaClient();
  
  try {
    // Validate expense data
    if (!expense.amount || expense.amount.lessThanOrEqualTo(0)) {
      throw new ValidationError('Expense amount must be greater than zero');
    }
    
    // Get or create expense account
    let expenseAccount = await client.chartOfAccounts.findFirst({
      where: { 
        accountType: 'EXPENSE',
        accountName: { contains: expense.category.name }
      }
    });
    
    if (!expenseAccount) {
      // Create a generic expense account if category-specific account doesn't exist
      expenseAccount = await client.chartOfAccounts.findFirst({
        where: { 
          accountType: 'EXPENSE',
          accountName: 'General Expenses'
        }
      });
      
      if (!expenseAccount) {
        throw new AccountingError('No suitable expense account found', 'ACCOUNT_NOT_FOUND');
      }
    }
    
    // Get VAT account
    const vatAccount = await client.chartOfAccounts.findFirst({
      where: { 
        accountType: 'LIABILITY',
        accountName: { contains: 'VAT' }
      }
    });
    
    if (!vatAccount) {
      throw new AccountingError('VAT account not found', 'ACCOUNT_NOT_FOUND');
    }
    
    // Get bank account
    const bankAccount = await client.chartOfAccounts.findFirst({
      where: { 
        accountType: 'ASSET',
        accountName: { contains: 'Bank' }
      }
    });
    
    if (!bankAccount) {
      throw new AccountingError('Bank account not found', 'ACCOUNT_NOT_FOUND');
    }
    
    const netAmount = expense.amount.minus(expense.vatAmount || new Prisma.Decimal(0));
    
    const entries = [
      {
        accountId: expenseAccount.id,
        debitAmount: netAmount,
      },
      {
        accountId: vatAccount.id,
        debitAmount: expense.vatAmount || 0,
      },
      {
        accountId: bankAccount.id,
        creditAmount: expense.amount,
      }
    ];
    
    return await createJournalEntry({
      entryDate: expense.expenseDate,
      referenceId: expense.id,
      referenceType: 'EXPENSE',
      description: `Expense: ${expense.description}`,
      entries
    }, client);
  } catch (error) {
    if (error instanceof AccountingError) throw error;
    console.error('Error creating expense journal entry:', error);
    throw new AccountingError('Failed to create expense journal entry', 'DATABASE_ERROR', error);
  }
}

// Enhanced sales journal entry creation
export async function createSalesJournalEntry(
  order: any,
  tx?: Prisma.TransactionClient
): Promise<any> {
  const client = tx || getPrismaClient();
  
  try {
    // Validate order data
    if (!order.totalAmount || order.totalAmount.lessThanOrEqualTo(0)) {
      throw new ValidationError('Order total must be greater than zero');
    }
    
    // Get accounts
    const salesAccount = await client.chartOfAccounts.findFirst({
      where: { 
        accountType: 'REVENUE',
        accountName: { contains: 'Sales' }
      }
    });
    
    const vatAccount = await client.chartOfAccounts.findFirst({
      where: { 
        accountType: 'LIABILITY',
        accountName: { contains: 'VAT' }
      }
    });
    
    const bankAccount = await client.chartOfAccounts.findFirst({
      where: { 
        accountType: 'ASSET',
        accountName: { contains: 'Bank' }
      }
    });
    
    const costOfSalesAccount = await client.chartOfAccounts.findFirst({
      where: { 
        accountType: 'EXPENSE',
        accountName: { contains: 'Cost of Sales' }
      }
    });
    
    const inventoryAccount = await client.chartOfAccounts.findFirst({
      where: { 
        accountType: 'ASSET',
        accountName: { contains: 'Inventory' }
      }
    });
    
    if (!salesAccount || !vatAccount || !bankAccount || !costOfSalesAccount || !inventoryAccount) {
      throw new AccountingError('Required accounts not found', 'ACCOUNT_NOT_FOUND');
    }
    
    const netAmount = order.totalAmount.minus(order.vatAmount || new Prisma.Decimal(0));
    const totalCost = order.items.reduce((sum: Prisma.Decimal, item: any) => {
      return sum.plus(new Prisma.Decimal(item.costPrice || 0).times(item.quantity));
    }, new Prisma.Decimal(0));
    
    const entries = [
      // Sales entry
      {
        accountId: bankAccount.id,
        debitAmount: order.totalAmount,
      },
      {
        accountId: salesAccount.id,
        creditAmount: netAmount,
      },
      {
        accountId: vatAccount.id,
        creditAmount: order.vatAmount || 0,
      },
      // Cost of sales entry
      {
        accountId: costOfSalesAccount.id,
        debitAmount: totalCost,
      },
      {
        accountId: inventoryAccount.id,
        creditAmount: totalCost,
      }
    ];
    
    return await createJournalEntry({
      entryDate: order.createdAt,
      referenceId: order.id,
      referenceType: 'ORDER',
      description: `Sales transaction for order ${order.orderNumber}`,
      entries
    }, client);
  } catch (error) {
    if (error instanceof AccountingError) throw error;
    console.error('Error creating sales journal entry:', error);
    throw new AccountingError('Failed to create sales journal entry', 'DATABASE_ERROR', error);
  }
}

// Enhanced VAT calculation with validation
export function calculateVAT(amount: number | string | Prisma.Decimal, rate: number | string | Prisma.Decimal = 15): {
  netAmount: Prisma.Decimal;
  vatAmount: Prisma.Decimal;
  totalAmount: Prisma.Decimal;
} {
  try {
    const totalAmount = validateAmount(amount);
    const vatRate = validateVATRate(rate);
    
    const vatAmount = totalAmount.dividedBy(new Prisma.Decimal(1).plus(vatRate.dividedBy(100)))
      .times(vatRate.dividedBy(100))
      .toDecimalPlaces(2);
    
    const netAmount = totalAmount.minus(vatAmount);
    
    return {
      netAmount: netAmount.toDecimalPlaces(2),
      vatAmount,
      totalAmount
    };
  } catch (error) {
    if (error instanceof AccountingError) throw error;
    throw new AccountingError('Failed to calculate VAT', 'CALCULATION_ERROR', error);
  }
}

// Enhanced financial summary with error handling
export async function getFinancialSummary(
  startDate: Date,
  endDate: Date,
  userRole?: UserRole
): Promise<any> {
  try {
    // Validate date range
    if (startDate >= endDate) {
      throw new ValidationError('Start date must be before end date');
    }
    
    // Check permissions for sensitive data
    const allowedRoles: UserRole[] = [UserRole.FINANCIAL_MANAGER, UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN];
    const hasAccess = userRole && allowedRoles.includes(userRole);
    
    if (!hasAccess) {
      throw new InsufficientPermissionsError('Insufficient permissions to access financial data');
    }
    
    const [revenue, expenses, vatCollected, vatPaid] = await Promise.all([
      // Revenue
      getPrismaClient().order.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: OrderStatus.DELIVERED
        },
        _sum: { totalAmount: true }
      }),
      
      // Expenses
      getPrismaClient().expense.aggregate({
        where: {
          expenseDate: { gte: startDate, lte: endDate },
          status: 'APPROVED'
        },
        _sum: { amount: true }
      }),
      
      // VAT Collected
      getPrismaClient().order.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: OrderStatus.DELIVERED
        },
        _sum: { vatAmount: true }
      }),
      
      // VAT Paid
      getPrismaClient().expense.aggregate({
        where: {
          expenseDate: { gte: startDate, lte: endDate },
          status: 'APPROVED'
        },
        _sum: { vatAmount: true }
      })
    ]);
    
    const totalRevenue = new Prisma.Decimal(revenue._sum?.totalAmount || 0);
    const totalExpenses = new Prisma.Decimal(expenses._sum?.amount || 0);
    const totalVATCollected = new Prisma.Decimal(vatCollected._sum?.vatAmount || 0);
    const totalVATPaid = new Prisma.Decimal(vatPaid._sum?.vatAmount || 0);
    
    const netProfit = totalRevenue.minus(totalExpenses);
    const vatLiability = totalVATCollected.minus(totalVATPaid);
    
    return {
      period: { startDate, endDate },
      revenue: {
        total: totalRevenue,
        net: totalRevenue.minus(totalVATCollected),
        vat: totalVATCollected
      },
      expenses: {
        total: totalExpenses,
        net: totalExpenses.minus(totalVATPaid),
        vat: totalVATPaid
      },
      profit: {
        gross: netProfit,
        net: netProfit.minus(vatLiability)
      },
      vat: {
        collected: totalVATCollected,
        paid: totalVATPaid,
        liability: vatLiability
      }
    };
  } catch (error) {
    if (error instanceof AccountingError) throw error;
    console.error('Error getting financial summary:', error);
    throw new AccountingError('Failed to get financial summary', 'DATABASE_ERROR', error);
  }
}

// Enhanced chart data with error handling
export async function getChartData(
  period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  startDate: Date,
  endDate: Date,
  userRole?: UserRole
): Promise<any> {
  try {
    // Validate permissions
    const allowedRoles: UserRole[] = [UserRole.FINANCIAL_MANAGER, UserRole.ACCOUNTANT, UserRole.SUPER_ADMIN];
    const hasAccess = userRole && allowedRoles.includes(userRole);
    
    if (!hasAccess) {
      throw new InsufficientPermissionsError('Insufficient permissions to access chart data');
    }
    
    // Group by clause based on period
    const groupBy = period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month';
    
    const [revenueData, expenseData] = await Promise.all([
      // Revenue data
      getPrismaClient().$queryRaw`
        SELECT 
          DATE_TRUNC(${groupBy}, "createdAt") as period,
          SUM("totalAmount") as revenue,
          SUM("vatAmount") as vat_collected
        FROM "Order"
        WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
          AND status = 'COMPLETED'
        GROUP BY DATE_TRUNC(${groupBy}, "createdAt")
        ORDER BY period
      `,
      
      // Expense data
      getPrismaClient().$queryRaw`
        SELECT 
          DATE_TRUNC(${groupBy}, "expenseDate") as period,
          SUM(amount) as expenses,
          SUM("vatAmount") as vat_paid
        FROM "Expense"
        WHERE "expenseDate" >= ${startDate} AND "expenseDate" <= ${endDate}
          AND status = 'APPROVED'
        GROUP BY DATE_TRUNC(${groupBy}, "expenseDate")
        ORDER BY period
      `
    ]);
    
    return {
      revenue: revenueData,
      expenses: expenseData,
      period
    };
  } catch (error) {
    if (error instanceof AccountingError) throw error;
    console.error('Error getting chart data:', error);
    throw new AccountingError('Failed to get chart data', 'DATABASE_ERROR', error);
  }
}

// Enhanced initialization with better error handling
export async function initializeAccountingSystem(): Promise<void> {
  try {
    // Check if already initialized
    const existingAccounts = await getPrismaClient().chartOfAccounts.count();
    if (existingAccounts > 0) {
      console.log('Accounting system already initialized');
      return;
    }
    
    const accounts = [
      // Assets
      { accountCode: '1000', accountName: 'Bank Account', accountType: 'ASSET', description: 'Main business bank account' },
      { accountCode: '1100', accountName: 'Accounts Receivable', accountType: 'ASSET', description: 'Money owed by customers' },
      { accountCode: '1200', accountName: 'Inventory', accountType: 'ASSET', description: 'Product inventory' },
      { accountCode: '1300', accountName: 'Prepaid Expenses', accountType: 'ASSET', description: 'Prepaid business expenses' },
      
      // Liabilities
      { accountCode: '2000', accountName: 'Accounts Payable', accountType: 'LIABILITY', description: 'Money owed to suppliers' },
      { accountCode: '2100', accountName: 'VAT Payable', accountType: 'LIABILITY', description: 'VAT collected from customers' },
      { accountCode: '2200', accountName: 'Accrued Expenses', accountType: 'LIABILITY', description: 'Expenses incurred but not yet paid' },
      
      // Equity
      { accountCode: '3000', accountName: 'Owner Equity', accountType: 'EQUITY', description: 'Owner investment in the business' },
      { accountCode: '3100', accountName: 'Retained Earnings', accountType: 'EQUITY', description: 'Accumulated profits' },
      
      // Revenue
      { accountCode: '4000', accountName: 'Sales Revenue', accountType: 'REVENUE', description: 'Revenue from product sales' },
      { accountCode: '4100', accountName: 'Other Income', accountType: 'REVENUE', description: 'Other business income' },
      
      // Expenses
      { accountCode: '5000', accountName: 'Cost of Sales', accountType: 'EXPENSE', description: 'Cost of products sold' },
      { accountCode: '5100', accountName: 'General Expenses', accountType: 'EXPENSE', description: 'General business expenses' },
      { accountCode: '5200', accountName: 'Marketing Expenses', accountType: 'EXPENSE', description: 'Marketing and advertising costs' },
      { accountCode: '5300', accountName: 'Office Expenses', accountType: 'EXPENSE', description: 'Office supplies and expenses' },
      { accountCode: '5400', accountName: 'Shipping Expenses', accountType: 'EXPENSE', description: 'Shipping and delivery costs' },
    ];
    
    await getPrismaClient().chartOfAccounts.createMany({
      data: accounts
    });
    
    console.log('Accounting system initialized successfully');
  } catch (error) {
    console.error('Error initializing accounting system:', error);
    throw new AccountingError('Failed to initialize accounting system', 'INITIALIZATION_ERROR', error);
  }
} 