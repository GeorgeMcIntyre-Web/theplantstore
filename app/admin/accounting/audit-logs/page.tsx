'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Eye, Search, Filter, Download, RefreshCw, Calendar, User, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

interface AuditLog {
  id: string;
  expenseId: string;
  expense: {
    description: string;
    amount: number;
    status: string;
  };
  userId: string;
  user: {
    name?: string;
    email: string;
  };
  action: string;
  before: any;
  after: any;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const AuditLogsPage = () => {
  const { data: session } = useSession();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Filter state
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const hasAccess = session?.user?.role === 'SUPER_ADMIN' || 
                   session?.user?.role === 'FINANCIAL_MANAGER' || 
                   session?.user?.role === 'ACCOUNTANT';

  useEffect(() => {
    if (hasAccess) {
      fetchAuditLogs();
    }
  }, [hasAccess, pagination.page]);

  // Fetch audit logs when filters change
  useEffect(() => {
    if (hasAccess) {
      setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
      fetchAuditLogs(1);
    }
    // eslint-disable-next-line
  }, [filterAction, filterUser, filterStartDate, filterEndDate, searchTerm]);

  const fetchAuditLogs = async (pageOverride?: number) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('page', String(pageOverride || pagination.page));
      params.append('limit', String(pagination.limit));
      
      const actionParam = filterAction === 'all' ? '' : filterAction;
      const userParam = filterUser === 'all' ? '' : filterUser;
      if (actionParam) params.append('action', actionParam);
      if (userParam) params.append('userId', userParam);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/accounting/audit-logs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.auditLogs);
        setPagination(data.pagination);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch audit logs');
        toast.error(errorData.error || 'Failed to fetch audit logs');
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setError('Failed to fetch audit logs');
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAuditLogs();
    setRefreshing(false);
    toast.success('Audit logs refreshed');
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR' 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionBadge = (action: string) => {
    const actionConfig = {
      CREATE: { color: 'bg-green-100 text-green-800', label: 'Created' },
      UPDATE: { color: 'bg-blue-100 text-blue-800', label: 'Updated' },
      DELETE: { color: 'bg-red-100 text-red-800', label: 'Deleted' },
      APPROVE: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      REJECT: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    };
    
    const config = actionConfig[action as keyof typeof actionConfig] || { color: 'bg-gray-100 text-gray-800', label: action };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams();
      params.append('format', 'csv');
      const actionParam = filterAction === 'all' ? '' : filterAction;
      const userParam = filterUser === 'all' ? '' : filterUser;
      if (actionParam) params.append('action', actionParam);
      if (userParam) params.append('userId', userParam);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/accounting/audit-logs/export?${params.toString()}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const filename = `audit-logs-${new Date().toISOString().slice(0,10)}.csv`;
        saveAs(blob, filename);
        toast.success('Audit logs exported to CSV');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to export audit logs');
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const renderChangeDetails = (before: any, after: any, action: string) => {
    if (action === 'CREATE') {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-green-600">New Record Created</div>
          {after && (
            <div className="text-sm text-gray-600">
              <div>Description: {after.description}</div>
              <div>Amount: {formatCurrency(after.amount)}</div>
              <div>Status: {after.status}</div>
            </div>
          )}
        </div>
      );
    }

    if (action === 'DELETE') {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-red-600">Record Deleted</div>
          {before && (
            <div className="text-sm text-gray-600">
              <div>Description: {before.description}</div>
              <div>Amount: {formatCurrency(before.amount)}</div>
              <div>Status: {before.status}</div>
            </div>
          )}
        </div>
      );
    }

    if (action === 'UPDATE' || action === 'APPROVE' || action === 'REJECT') {
      return (
        <div className="space-y-2">
          <div className="text-sm font-medium text-blue-600">Changes Made</div>
          {before && after && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-600">Before:</div>
                <div>Description: {before.description}</div>
                <div>Amount: {formatCurrency(before.amount)}</div>
                <div>Status: {before.status}</div>
              </div>
              <div>
                <div className="font-medium text-gray-600">After:</div>
                <div>Description: {after.description}</div>
                <div>Amount: {formatCurrency(after.amount)}</div>
                <div>Status: {after.status}</div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return <div className="text-sm text-gray-600">No change details available</div>;
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view audit logs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-gray-600">Complete audit trail of all financial activities</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportToCSV} disabled={!auditLogs.length}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <div>
              <Label>Action</Label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Created</SelectItem>
                  <SelectItem value="UPDATE">Updated</SelectItem>
                  <SelectItem value="DELETE">Deleted</SelectItem>
                  <SelectItem value="APPROVE">Approved</SelectItem>
                  <SelectItem value="REJECT">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>User</Label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All Users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {/* This would be populated with actual users */}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
            <div className="lg:col-span-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search in descriptions, users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setFilterAction('all');
                setFilterUser('all');
                setFilterStartDate('');
                setFilterEndDate('');
                setSearchTerm('');
              }}
            >
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => fetchAuditLogs()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No audit logs found for the selected criteria.
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getActionBadge(log.action)}
                        <span className="font-semibold">{log.expense.description}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{log.user.name || log.user.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Amount:</span> {formatCurrency(log.expense.amount)}
                        </div>
                        <div>
                          <span className="font-medium">Status:</span> {log.expense.status}
                        </div>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Action</Label>
                              <div className="flex items-center gap-2 mt-1">
                                {getActionBadge(log.action)}
                              </div>
                            </div>
                            <div>
                              <Label>Date & Time</Label>
                              <p className="text-sm mt-1">{formatDate(log.createdAt)}</p>
                            </div>
                          </div>
                          <div>
                            <Label>User</Label>
                            <p className="text-sm mt-1">{log.user.name || log.user.email}</p>
                          </div>
                          <div>
                            <Label>Expense</Label>
                            <p className="text-sm mt-1">{log.expense.description}</p>
                          </div>
                          <div>
                            <Label>Change Details</Label>
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              {renderChangeDetails(log.before, log.after, log.action)}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} audit logs
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage; 