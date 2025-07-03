'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { 
  Banknote, 
  Plus, 
  Upload, 
  Download, 
  Settings, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  autoReconcile: boolean;
  categories: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface BankTransaction {
  id: string;
  transactionDate: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  bankReference: string;
  category?: string;
  balance: number;
  reconciled: boolean;
}

export const BankFeedManager: React.FC = () => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const [newAccount, setNewAccount] = useState({
    bankName: '',
    accountNumber: '',
    autoReconcile: false,
    categories: {}
  });

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/accounting/bank-feed');
      if (response.ok) {
        const data = await response.json();
        setBankAccounts(data.bankAccounts || []);
      }
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      toast.error('Failed to fetch bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const addBankAccount = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/accounting/bank-feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      });

      if (response.ok) {
        toast.success('Bank account added successfully');
        setShowAddAccount(false);
        setNewAccount({
          bankName: '',
          accountNumber: '',
          autoReconcile: false,
          categories: {}
        });
        fetchBankAccounts();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add bank account');
      }
    } catch (error) {
      console.error('Error adding bank account:', error);
      toast.error('Failed to add bank account');
    } finally {
      setIsLoading(false);
    }
  };

  const importTransactions = async (accountNumber: string) => {
    try {
      setIsLoading(true);
      // This would integrate with actual bank APIs
      toast.info('Transaction import feature coming soon');
    } catch (error) {
      console.error('Error importing transactions:', error);
      toast.error('Failed to import transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const exportTransactions = async (accountNumber: string) => {
    try {
      setIsLoading(true);
      // Export functionality
      toast.info('Export feature coming soon');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bank Feed Management</h2>
          <p className="text-gray-600">Connect bank accounts and manage transaction imports</p>
        </div>
        
        <Dialog open={showAddAccount} onOpenChange={setShowAddAccount}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Bank Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={newAccount.bankName}
                  onChange={(e) => setNewAccount({
                    ...newAccount,
                    bankName: e.target.value
                  })}
                  placeholder="e.g., Standard Bank"
                />
              </div>
              
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  value={newAccount.accountNumber}
                  onChange={(e) => setNewAccount({
                    ...newAccount,
                    accountNumber: e.target.value
                  })}
                  placeholder="e.g., 1234567890"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoReconcile"
                  checked={newAccount.autoReconcile}
                  onCheckedChange={(checked) => setNewAccount({
                    ...newAccount,
                    autoReconcile: checked
                  })}
                />
                <Label htmlFor="autoReconcile">Auto-reconcile transactions</Label>
              </div>
              
              <div className="flex gap-2">
                <Button onClick={addBankAccount} disabled={isLoading} className="flex-1">
                  {isLoading ? 'Adding...' : 'Add Account'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddAccount(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bank Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Connected Bank Accounts
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bankAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Banknote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No bank accounts connected</p>
              <Button onClick={() => setShowAddAccount(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Account
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {bankAccounts.map((account) => (
                <div key={account.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{account.bankName}</h3>
                      <p className="text-sm text-gray-600">Account: {account.accountNumber}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={account.autoReconcile ? "default" : "secondary"}>
                        {account.autoReconcile ? "Auto-reconcile" : "Manual"}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => importTransactions(account.accountNumber)}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => exportTransactions(account.accountNumber)}
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedAccount(account.accountNumber)}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      View Transactions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      {selectedAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Transactions - {selectedAccount}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-gray-600">No transactions found</p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => importTransactions(selectedAccount)}
                      >
                        Import Transactions
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        <span className={transaction.type === 'debit' ? 'text-red-600' : 'text-green-600'}>
                          R{transaction.amount.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.type === 'debit' ? 'destructive' : 'default'}>
                          {transaction.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.reconciled ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Reconcile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Bank feed integration allows automatic import and reconciliation of bank transactions. 
          Connect your bank account to streamline expense management and reduce manual data entry.
        </AlertDescription>
      </Alert>
    </div>
  );
}; 