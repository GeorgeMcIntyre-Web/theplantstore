"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: string;
  balance: number;
}

const BankAccountsPage = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/accounting/bank-feed')
      .then(res => res.json())
      .then(data => {
        setAccounts(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load bank accounts');
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bank Accounts</h1>
        <Button><Plus className="h-4 w-4 mr-2" />Add Account</Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : accounts.length === 0 ? (
            <div>No bank accounts found.</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Number</th>
                  <th>Type</th>
                  <th>Balance</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc) => (
                  <tr key={acc.id}>
                    <td>{acc.bankName}</td>
                    <td>{acc.accountNumber}</td>
                    <td>{acc.accountType}</td>
                    <td>R {Number(acc.balance).toFixed(2)}</td>
                    <td>
                      <Button size="sm" variant="outline"><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant="destructive"><Trash2 className="h-4 w-4" /></Button>
                    </td>
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

export default BankAccountsPage; 