'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Download, TrendingUp, TrendingDown, DollarSign, Receipt, BarChart3, PieChart, Calendar, RefreshCw, Info, FileText, TrendingUpIcon } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';

interface FinancialReport {
  period: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    total: number;
    net: number;
    vat: number;
    orders: number;
    averageOrderValue: number;
  };
  expenses: {
    total: number;
    net: number;
    vat: number;
    count: number;
    byCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  profit: {
    gross: number;
    net: number;
    margin: number;
  };
  vat: {
    collected: number;
    paid: number;
    liability: number;
  };
  topProducts: Array<{
    name: string;
    revenue: number;
    quantity: number;
    profit: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
}

const ReportsPage = () => {
  const { data: session } = useSession();
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'summary' | 'detailed' | 'vat' | 'trends'>('summary');
  const [dateRange, setDateRange] = useState<'current-month' | 'current-quarter' | 'current-year' | 'custom'>('current-month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const hasAccess = session?.user?.role === 'SUPER_ADMIN' || 
                   session?.user?.role === 'FINANCIAL_MANAGER' || 
                   session?.user?.role === 'ACCOUNTANT';

  useEffect(() => {
    if (hasAccess) {
      fetchReport();
    }
  }, [hasAccess, reportType, dateRange, customStartDate, customEndDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('type', reportType);
      params.append('period', dateRange);
      if (dateRange === 'custom') {
        if (customStartDate) params.append('startDate', customStartDate);
        if (customEndDate) params.append('endDate', customEndDate);
      }
      
      const response = await fetch(`/api/accounting/reports?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch report data');
      }
      
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch report data';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReport();
    setRefreshing(false);
    toast.success('Report data refreshed');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR' 
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const exportReport = async (format: 'csv' | 'pdf') => {
    try {
      const params = new URLSearchParams();
      params.append('type', reportType);
      params.append('period', dateRange);
      params.append('format', format);
      if (dateRange === 'custom') {
        if (customStartDate) params.append('startDate', customStartDate);
        if (customEndDate) params.append('endDate', customEndDate);
      }
      
      const response = await fetch(`/api/accounting/reports/export?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const filename = `financial-report-${reportType}-${new Date().toISOString().slice(0,10)}.${format}`;
        saveAs(blob, filename);
        toast.success(`Report exported as ${format.toUpperCase()}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
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
        icon: TrendingDown 
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
      icon: TrendingUp 
    };
  };

  // Chart utility functions
  const formatChartCurrency = (value: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatChartTooltip = (value: any, name: string) => {
    if (typeof value === 'number') {
      return [formatCurrency(value), name];
    }
    return [value, name];
  };

  const chartColors = {
    revenue: '#10b981',
    expenses: '#ef4444',
    profit: '#3b82f6',
    vat: '#f59e0b',
    categories: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view financial reports.</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Financial Reports</h1>
          <p className="text-gray-600">Comprehensive financial analysis and insights</p>
          {report && (
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>Period: {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => exportReport('csv')} disabled={!report}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" disabled={!report}>
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Analysis</SelectItem>
                  <SelectItem value="vat">VAT Report</SelectItem>
                  <SelectItem value="trends">Trends Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="current-quarter">Current Quarter</SelectItem>
                  <SelectItem value="current-year">Current Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateRange === 'custom' && (
              <>
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchReport} variant="outline">
            Try Again
          </Button>
        </div>
      ) : report ? (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    Total Revenue
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 ml-1 text-gray-400 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Gross revenue including VAT</p>
                      </TooltipContent>
                    </UITooltip>
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(report.revenue.total)}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.revenue.orders} orders • Avg: {formatCurrency(report.revenue.averageOrderValue)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(report.expenses.total)}</div>
                  <p className="text-xs text-muted-foreground">
                    {report.expenses.count} expenses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  <div className={`h-4 w-4 ${getProfitTrend(report.profit.net).color}`}>
                    {React.createElement(getProfitTrend(report.profit.net).icon)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(report.profit.net)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatPercentage(report.profit.margin)} margin
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">VAT Liability</CardTitle>
                  <div className={`h-4 w-4 ${getVATStatus(report.vat.liability).color}`}>
                    {React.createElement(getVATStatus(report.vat.liability).icon)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(report.vat.liability)}</div>
                  <p className="text-xs text-muted-foreground">
                    {getVATStatus(report.vat.liability).status}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* VAT Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  VAT Summary
                  <Info className="h-4 w-4 ml-2 text-gray-400" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(report.vat.collected)}</div>
                      <div className="text-sm text-green-600">VAT Collected</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(report.vat.paid)}</div>
                      <div className="text-sm text-blue-600">VAT Paid</div>
                    </div>
                    <div className={`text-center p-4 rounded-lg ${report.vat.liability > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                      <div className={`text-2xl font-bold ${report.vat.liability > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(report.vat.liability)}
                      </div>
                      <div className={`text-sm ${report.vat.liability > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        Net VAT {report.vat.liability > 0 ? 'Payable' : 'Refundable'}
                      </div>
                    </div>
                  </div>
                  
                  {/* VAT Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'VAT Collected', value: report.vat.collected, fill: chartColors.revenue },
                        { name: 'VAT Paid', value: report.vat.paid, fill: chartColors.expenses },
                        { name: 'Net Liability', value: report.vat.liability, fill: report.vat.liability > 0 ? chartColors.expenses : chartColors.revenue }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={formatChartCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="value" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Financial Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={report.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={formatChartCurrency} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke={chartColors.revenue} fill={chartColors.revenue} fillOpacity={0.3} name="Revenue" />
                      <Area type="monotone" dataKey="expenses" stackId="1" stroke={chartColors.expenses} fill={chartColors.expenses} fillOpacity={0.3} name="Expenses" />
                      <Line type="monotone" dataKey="profit" stroke={chartColors.profit} strokeWidth={3} name="Profit" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Revenue Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Gross Revenue:</span>
                        <span className="font-semibold">{formatCurrency(report.revenue.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT Collected:</span>
                        <span className="font-semibold">{formatCurrency(report.revenue.vat)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Net Revenue:</span>
                        <span className="font-semibold">{formatCurrency(report.revenue.net)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Order Statistics</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Orders:</span>
                        <span className="font-semibold">{report.revenue.orders}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average Order Value:</span>
                        <span className="font-semibold">{formatCurrency(report.revenue.averageOrderValue)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Product List */}
                  <div className="space-y-4">
                    {report.topProducts.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {product.quantity} units sold
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(product.revenue)}</div>
                          <div className="text-sm text-green-600">
                            {formatCurrency(product.profit)} profit
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Product Revenue Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={report.topProducts} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={formatChartCurrency} />
                        <YAxis type="category" dataKey="name" width={80} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="revenue" fill={chartColors.revenue} name="Revenue" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-4">Expense Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Expenses:</span>
                        <span className="font-semibold">{formatCurrency(report.expenses.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT Paid:</span>
                        <span className="font-semibold">{formatCurrency(report.expenses.vat)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Net Expenses:</span>
                        <span className="font-semibold">{formatCurrency(report.expenses.net)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Expense Count</h3>
                    <div className="text-3xl font-bold text-blue-600">{report.expenses.count}</div>
                    <div className="text-sm text-gray-600">Total expenses in period</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Expenses by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Category List */}
                  <div className="space-y-4">
                    {report.expenses.byCategory.map((category, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: chartColors.categories[index % chartColors.categories.length] }}
                          />
                          <div className="flex-1">
                            <div className="font-semibold">{category.category}</div>
                            <div className="text-sm text-gray-600">
                              {formatPercentage(category.percentage)} of total
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(category.amount)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Expense Categories Pie Chart */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={report.expenses.byCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {report.expenses.byCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={chartColors.categories[index % chartColors.categories.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={formatChartTooltip} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Trends Chart */}
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={report.monthlyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={formatChartCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke={chartColors.revenue} strokeWidth={3} name="Revenue" />
                        <Line type="monotone" dataKey="expenses" stroke={chartColors.expenses} strokeWidth={3} name="Expenses" />
                        <Line type="monotone" dataKey="profit" stroke={chartColors.profit} strokeWidth={3} name="Profit" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Trends Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Month</th>
                          <th className="text-right p-3 font-semibold text-green-600">Revenue</th>
                          <th className="text-right p-3 font-semibold text-red-600">Expenses</th>
                          <th className="text-right p-3 font-semibold">Profit</th>
                          <th className="text-right p-3 font-semibold">Margin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.monthlyTrends.map((trend, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{trend.month}</td>
                            <td className="p-3 text-right text-green-600">{formatCurrency(trend.revenue)}</td>
                            <td className="p-3 text-right text-red-600">{formatCurrency(trend.expenses)}</td>
                            <td className={`p-3 text-right font-semibold ${trend.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(trend.profit)}
                            </td>
                            <td className="p-3 text-right">
                              {trend.revenue > 0 ? formatPercentage((trend.profit / trend.revenue) * 100) : '0%'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
      </div>
    </TooltipProvider>
  );
};

export default ReportsPage; 