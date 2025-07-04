"use client";
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BankTransaction {
  id: string;
  accountNumber: string;
  transactionDate: string;
  description: string;
  amount: number;
  type: string;
  bankReference: string;
  category?: string;
  balance: number;
  reconciled: boolean;
  reconciledAt?: string;
}

const BankTransactionsPage = () => {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/accounting/bank-transactions')
      .then(res => res.json())
      .then(data => {
        let txArray = Array.isArray(data) ? data : Array.isArray(data.transactions) ? data.transactions : [];
        setTransactions(txArray);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load bank transactions');
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bank Transactions</h1>
        <Button disabled>Import Transactions</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : transactions.length === 0 ? (
            <div>No bank transactions found.</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Account</th>
                  <th>Reconciled</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.transactionDate).toLocaleDateString()}</td>
                    <td>{tx.description}</td>
                    <td>R {Number(tx.amount).toFixed(2)}</td>
                    <td>{tx.type}</td>
                    <td>{tx.accountNumber}</td>
                    <td>{tx.reconciled ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BankTransactionsPage; 