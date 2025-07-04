"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ReconciliationPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reconciliation</h1>
      <Card>
        <CardHeader>
          <CardTitle>Auto & Manual Reconciliation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            This feature will allow you to auto-match and manually reconcile bank transactions with expenses.<br />
            <b>Coming soon!</b>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReconciliationPage; 