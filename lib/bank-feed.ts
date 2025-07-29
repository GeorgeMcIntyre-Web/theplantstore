import { prisma } from './db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export interface BankTransaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  reference: string;
  category?: string;
  balance: number;
}

export interface BankFeedConfig {
  bankName: string;
  accountNumber: string;
  apiKey?: string;
  apiSecret?: string;
  webhookUrl?: string;
  autoReconcile: boolean;
  categories: {
    [key: string]: string; // bank category -> expense category
  };
}

export interface ReconciliationResult {
  matched: boolean;
  confidence: number;
  suggestedExpense?: {
    vendorName: string;
    amount: number;
    category: string;
    description: string;
  };
}

class BankFeedService {
  private configs: Map<string, BankFeedConfig> = new Map();

  async addBankAccount(config: BankFeedConfig): Promise<void> {
    // In a real implementation, this would store the config securely
    this.configs.set(config.accountNumber, config);
    
    // Store in database for persistence
    await prisma.bankAccount.upsert({
      where: { accountNumber: config.accountNumber },
      update: {
        bankName: config.bankName,
        autoReconcile: config.autoReconcile,
        categories: config.categories as any,
        updatedAt: new Date()
      },
      create: {
        accountNumber: config.accountNumber,
        bankName: config.bankName,
        autoReconcile: config.autoReconcile,
        categories: config.categories as any,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  async importTransactions(accountNumber: string, transactions: BankTransaction[]): Promise<void> {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      throw new Error('Unauthorized');
    }

    const config = this.configs.get(accountNumber);
    if (!config) {
      throw new Error('Bank account not configured');
    }

    for (const transaction of transactions) {
      // Check if transaction already exists
      const existing = await prisma.bankTransaction.findFirst({
        where: {
          bankReference: transaction.reference,
          accountNumber: accountNumber
        }
      });

      if (existing) continue;

      // Store transaction
      await prisma.bankTransaction.create({
        data: {
          accountNumber: accountNumber,
          transactionDate: transaction.date,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          bankReference: transaction.reference,
          category: transaction.category,
          balance: transaction.balance,
          createdAt: new Date()
        }
      });

      // Auto-reconcile if enabled
      if (config.autoReconcile) {
        await this.autoReconcileTransaction(transaction, config);
      }
    }
  }

  private async autoReconcileTransaction(
    transaction: BankTransaction, 
    config: BankFeedConfig
  ): Promise<void> {
    // Skip credits (income)
    if (transaction.type === 'credit') return;

    // Look for matching expenses
    const matchingExpenses = await this.findMatchingExpenses(transaction);
    
    if (matchingExpenses.length === 1) {
      // Auto-reconcile if only one match
      const expense = matchingExpenses[0];
      await this.reconcileTransaction(transaction, expense);
    } else if (matchingExpenses.length > 1) {
      // Create reconciliation suggestion
      await this.createReconciliationSuggestion(transaction, matchingExpenses);
    } else {
      // Create potential expense from transaction
      await this.createExpenseFromTransaction(transaction, config);
    }
  }

  private async findMatchingExpenses(transaction: BankTransaction) {
    const searchTerms = this.extractSearchTerms(transaction.description);
    
    return await prisma.expense.findMany({
      where: {
        OR: [
          {
            vendorName: {
              contains: searchTerms.vendor
            }
          },
          {
            notes: {
              contains: searchTerms.description
            }
          },
          {
            amount: {
              gte: transaction.amount * 0.95, // Allow 5% variance
              lte: transaction.amount * 1.05
            }
          }
        ],
        status: 'DRAFT',
        bankTransactions: null // Not already reconciled
      },
      orderBy: {
        expenseDate: 'desc'
      },
      take: 5
    });
  }

  private extractSearchTerms(description: string) {
    // Remove common bank prefixes and suffixes
    const cleaned = description
      .replace(/^(POS|EFT|DEBIT|CREDIT)\s*/i, '')
      .replace(/\s+(PTY|LTD|INC|LLC)$/i, '')
      .trim();

    // Extract vendor name (usually first part)
    const vendor = cleaned.split(/\s+/)[0] || cleaned;
    
    return {
      vendor,
      description: cleaned
    };
  }

  private async reconcileTransaction(
    transaction: BankTransaction, 
    expense: any
  ): Promise<void> {
    await prisma.expense.update({
      where: { id: expense.id },
      data: {
        bankTransactions: { connect: { id: transaction.id } }
      }
    });

    await prisma.bankTransaction.update({
      where: { id: transaction.id },
      data: {
        reconciled: true,
        reconciledAt: new Date(),
        expenseId: expense.id
      }
    });
  }

  private async createReconciliationSuggestion(
    transaction: BankTransaction,
    expenses: any[]
  ): Promise<void> {
    await prisma.reconciliationSuggestion.create({
      data: {
        bankTransactionId: transaction.id,
        suggestedExpenseIds: expenses.map(e => e.id),
        confidence: 0.8,
        createdAt: new Date()
      }
    });
  }

  private async createExpenseFromTransaction(
    transaction: BankTransaction,
    config: BankFeedConfig
  ): Promise<void> {
    const session = await getServerSession(authOptions);
    if (!session?.user) return;

    const categoryName = this.mapBankCategory(transaction.category, config.categories);
    const categoryRecord = await prisma.expenseCategory.findFirst({ where: { name: categoryName } });
    if (!categoryRecord) throw new Error(`Expense category '${categoryName}' not found`);

    await prisma.expense.create({
      data: {
        description: transaction.description,
        vendorName: this.extractVendorName(transaction.description),
        amount: transaction.amount,
        expenseDate: transaction.date,
        categoryId: categoryRecord.id,
        notes: `Auto-created from bank transaction: ${transaction.description}`,
        vatRate: 15,
        status: "PENDING_APPROVAL",
        requestedById: session.user.id,
        userId: session.user.id,
        createdAt: new Date()
      }
    });
  }

  private mapBankCategory(bankCategory: string | undefined, categoryMap: any): string {
    if (!bankCategory) return 'General';
    return categoryMap[bankCategory] || 'General';
  }

  private extractVendorName(description: string): string {
    // Remove common bank prefixes
    const cleaned = description
      .replace(/^(POS|EFT|DEBIT|CREDIT)\s*/i, '')
      .replace(/\s+(PTY|LTD|INC|LLC)$/i, '')
      .trim();

    // Take first meaningful part as vendor name
    const parts = cleaned.split(/\s+/);
    return parts[0] || 'Unknown Vendor';
  }

  async getUnreconciledTransactions(accountNumber: string): Promise<BankTransaction[]> {
    const results = await prisma.bankTransaction.findMany({
      where: {
        accountNumber: accountNumber,
        reconciled: false
      },
      orderBy: {
        transactionDate: 'desc'
      }
    });
    return results.map(tx => ({
      id: tx.id,
      date: tx.transactionDate,
      description: tx.description,
      amount: typeof tx.amount === 'object' && 'toNumber' in tx.amount ? tx.amount.toNumber() : tx.amount,
      type: tx.type === "credit" ? "credit" : "debit",
      reference: tx.bankReference,
      category: tx.category ?? undefined,
      balance: typeof tx.balance === 'object' && 'toNumber' in tx.balance ? tx.balance.toNumber() : tx.balance,
      createdAt: tx.createdAt,
      reconciled: tx.reconciled,
      reconciledAt: tx.reconciledAt,
      expenseId: tx.expenseId,
      accountNumber: tx.accountNumber,
    }));
  }

  async getReconciliationSuggestions(): Promise<any[]> {
    return await prisma.reconciliationSuggestion.findMany({
      include: {
        bankTransaction: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async manualReconcile(
    transactionId: string, 
    expenseId: string
  ): Promise<void> {
    await prisma.$transaction([
      prisma.bankTransaction.update({
        where: { id: transactionId },
        data: {
          reconciled: true,
          reconciledAt: new Date(),
          expenseId: expenseId
        }
      }),
      prisma.expense.update({
        where: { id: expenseId },
        data: {
          reconciled: true,
          reconciledAt: new Date(),
          bankTransactions: { connect: { id: transactionId } }
        }
      })
    ]);
  }

  async getBankAccounts(): Promise<any[]> {
    return await prisma.bankAccount.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async deleteBankAccount(accountNumber: string): Promise<void> {
    this.configs.delete(accountNumber);
    
    await prisma.bankAccount.delete({
      where: { accountNumber: accountNumber }
    });
  }
}

export const bankFeedService = new BankFeedService(); 