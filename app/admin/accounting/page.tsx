'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign, Receipt, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface FinancialSummary {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    total: number;
    net: number;
    vat: number;
  };
  expenses: {
    total: number;
    net: number;
    vat: number;
  };
  profit: {
    gross: number;
    net: number;
  };
  vat: {
    collected: number;
    paid: number;
    liability: number;
  };
}

const AccountingDashboard = () => {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'current-month' | 'current-quarter' | 'current-year'>('current-month');
  const [refreshing, setRefreshing] = useState(false);

  const hasAccess = session?.user?.role === 'SUPER_ADMIN' || 
                   session?.user?.role === 'FINANCIAL_MANAGER' || 
                   session?.user?.role === 'ACCOUNTANT';

  useEffect(() => {
    if (hasAccess) {
      fetchFinancialSummary();
    }
  }, [hasAccess, period]);

  const fetchFinancialSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/accounting/financial-summary?period=${period}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch financial data');
      }
      
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch financial data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFinancialSummary();
    setRefreshing(false);
    toast.success('Financial data refreshed');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR' 
    }).format(amount);
  };

  const getProfitTrend = (profit: number) => {
    if (profit > 0) {
      return { icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100' };
    } else if (profit < 0) {
      return { icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-100' };
    }
    return { icon: TrendingUp, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  const getVATStatus = (liability: number) => {
    if (liability > 0) {
      return { 
        status: 'Payable', 
        color: 'text-red-600', 
        bgColor: 'bg-red-100',
        icon: AlertCircle 
      };
    } else if (liability < 0) {
      return { 
        status: 'Refundable', 
        color: 'text-green-600', 
        bgColor: 'bg-green-100',
        icon: TrendingUp 
      };
    }
    return { 
      status: 'Balanced', 
      color: 'text-gray-600', 
      bgColor: 'bg-gray-100',
      icon: AlertCircle 
    };
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view accounting data.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
            <p className="text-gray-600">Financial overview and insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="current-quarter">Current Quarter</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled>
              <RefreshCw className="h-4 w-4 animate-spin" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                </CardTitle>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
            <p className="text-gray-600">Financial overview and insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="current-quarter">Current Quarter</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={handleRefresh} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
            <p className="text-gray-600">Financial overview and insights</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="current-quarter">Current Quarter</SelectItem>
                <SelectItem value="current-year">Current Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center text-gray-500">
              <p>No financial data available for the selected period.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profitTrend = getProfitTrend(summary.profit.net);
  const vatStatus = getVATStatus(summary.vat.liability);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounting Dashboard</h1>
          <p className="text-gray-600">Financial overview and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Period Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Period</p>
              <p className="font-medium">
                {new Date(summary.period.startDate).toLocaleDateString()} - {new Date(summary.period.endDate).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="outline">
              {period.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.revenue.total)}</div>
            <p className="text-xs text-gray-600">
              Net: {formatCurrency(summary.revenue.net)} | VAT: {formatCurrency(summary.revenue.vat)}
            </p>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.expenses.total)}</div>
            <p className="text-xs text-gray-600">
              Net: {formatCurrency(summary.expenses.net)} | VAT: {formatCurrency(summary.expenses.vat)}
            </p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <profitTrend.icon className={`h-4 w-4 ${profitTrend.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitTrend.color}`}>
              {formatCurrency(summary.profit.net)}
            </div>
            <p className="text-xs text-gray-600">
              Gross: {formatCurrency(summary.profit.gross)}
            </p>
          </CardContent>
        </Card>

        {/* VAT Liability */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VAT Status</CardTitle>
            <vatStatus.icon className={`h-4 w-4 ${vatStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${vatStatus.color}`}>
              {formatCurrency(Math.abs(summary.vat.liability))}
            </div>
            <p className="text-xs text-gray-600">
              {vatStatus.status}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gross Revenue</span>
              <span className="font-medium">{formatCurrency(summary.revenue.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">VAT Collected</span>
              <span className="font-medium text-red-600">-{formatCurrency(summary.revenue.vat)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Revenue</span>
                <span className="font-bold text-green-600">{formatCurrency(summary.revenue.net)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Gross Expenses</span>
              <span className="font-medium">{formatCurrency(summary.expenses.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">VAT Paid</span>
              <span className="font-medium text-green-600">-{formatCurrency(summary.expenses.vat)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Net Expenses</span>
                <span className="font-bold text-red-600">{formatCurrency(summary.expenses.net)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VAT Summary */}
      <Card>
        <CardHeader>
          <CardTitle>VAT Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(summary.vat.collected)}
              </div>
              <p className="text-sm text-gray-600">VAT Collected</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.vat.paid)}
              </div>
              <p className="text-sm text-gray-600">VAT Paid</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${vatStatus.color}`}>
                {formatCurrency(Math.abs(summary.vat.liability))}
              </div>
              <p className="text-sm text-gray-600">VAT {vatStatus.status}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountingDashboard; 