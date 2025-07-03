'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Plus, Eye, CheckCircle, XCircle, ChevronLeft, ChevronRight, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  expenseDate: string;
  categoryId: string;
  category: ExpenseCategory;
  vendorName?: string;
  notes?: string;
  vatAmount?: number;
  vatRate?: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PAID';
  requestedBy: {
    name?: string;
    email: string;
  };
  approvals: Array<{
    id: string;
    status: string;
    comments?: string;
    approver: {
      name?: string;
      email: string;
    };
    approvedAt: string;
  }>;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const ExpenseManagement = () => {
  const { data: session } = useSession();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    categoryId: '',
    vendorName: '',
    notes: '',
    vatRate: '15'
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [approvalComments, setApprovalComments] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [showDeleteId, setShowDeleteId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const allSelected = expenses.length > 0 && selectedIds.length === expenses.length;
  const toggleSelect = (id: string) => setSelectedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  const toggleSelectAll = () => setSelectedIds(allSelected ? [] : expenses.map(e => e.id));
  const clearSelection = () => setSelectedIds([]);

  const hasAccess = session?.user?.role === 'SUPER_ADMIN' || 
                   session?.user?.role === 'FINANCIAL_MANAGER' || 
                   session?.user?.role === 'ACCOUNTANT';
  
  const canApprove = session?.user?.role === 'SUPER_ADMIN' || 
                    session?.user?.role === 'FINANCIAL_MANAGER';

  useEffect(() => {
    if (hasAccess) {
      fetchExpenses();
      fetchCategories();
    }
    // eslint-disable-next-line
  }, [hasAccess, pagination.page]);

  // Fetch expenses when filters change
  useEffect(() => {
    if (hasAccess) {
      setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
      fetchExpenses(1);
    }
    // eslint-disable-next-line
  }, [filterStatus, filterCategory, filterStartDate, filterEndDate]);

  const fetchExpenses = async (pageOverride?: number) => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.append('page', String(pageOverride || pagination.page));
      params.append('limit', String(pagination.limit));
      const statusParam = filterStatus === 'all' ? '' : filterStatus;
      const categoryParam = filterCategory === 'all' ? '' : filterCategory;
      if (statusParam) params.append('status', statusParam);
      if (categoryParam) params.append('categoryId', categoryParam);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);
      const response = await fetch(`/api/accounting/expenses?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
        setPagination(data.pagination);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch expenses');
        toast.error(errorData.error || 'Failed to fetch expenses');
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to fetch expenses');
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/accounting/expense-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        console.error('Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/accounting/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Expense created successfully');
        setFormData({
          description: '',
          amount: '',
          expenseDate: new Date().toISOString().split('T')[0],
          categoryId: '',
          vendorName: '',
          notes: '',
          vatRate: '15'
        });
        setShowForm(false);
        fetchExpenses();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to create expense');
    }
  };

  const handleApprove = async (expenseId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/accounting/expenses/${expenseId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, comments: approvalComments }),
      });

      if (response.ok) {
        toast.success(`Expense ${status.toLowerCase()} successfully`);
        setSelectedExpense(null);
        setApprovalComments('');
        fetchExpenses();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${status.toLowerCase()} expense`);
      }
    } catch (error) {
      console.error('Error approving expense:', error);
      toast.error('Failed to approve expense');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      PENDING_APPROVAL: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Approval' },
      APPROVED: { color: 'bg-green-100 text-green-800', label: 'Approved' },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      PAID: { color: 'bg-blue-100 text-blue-800', label: 'Paid' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', { 
      style: 'currency', 
      currency: 'ZAR' 
    }).format(amount);
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  function exportToCSV(expenses: Expense[]) {
    if (!expenses.length) return;
    const header = [
      'Description', 'Amount', 'VAT Amount', 'VAT Rate', 'Category', 'Date', 'Vendor', 'Notes', 'Status', 'Requested By'
    ];
    const rows = expenses.map(e => [
      e.description,
      e.amount,
      e.vatAmount ?? '',
      e.vatRate ?? '',
      e.category?.name ?? '',
      new Date(e.expenseDate).toLocaleDateString(),
      e.vendorName ?? '',
      e.notes ?? '',
      e.status,
      e.requestedBy?.name || e.requestedBy?.email || ''
    ]);
    const csv = [header, ...rows].map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `expenses-${new Date().toISOString().slice(0,10)}.csv`);
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage expenses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expense Management</h1>
          <p className="text-gray-600">Create and manage business expenses</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter expense description"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (ZAR, VAT Inclusive) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="expenseDate">Expense Date *</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="vendorName">Vendor Name</Label>
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                  placeholder="Enter vendor name"
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Expense</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div>
          <Label>Status</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="PAID">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Category</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setFilterStatus('all');
            setFilterCategory('all');
            setFilterStartDate('');
            setFilterEndDate('');
          }}
        >
          Reset Filters
        </Button>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
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
              <Button onClick={fetchExpenses} variant="outline">
                Try Again
              </Button>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No expenses found. Create your first expense to get started.
            </div>
          ) : (
            <>
              {selectedIds.length > 0 && (
                <div className="mb-4 flex items-center gap-4 bg-gray-50 border p-2 rounded">
                  <span>{selectedIds.length} selected</span>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteId(selectedIds.join(','))}>Delete Selected</Button>
                  <Button variant="outline" size="sm" onClick={clearSelection}>Clear</Button>
                </div>
              )}
              <div className="space-y-4">
                <Button variant="outline" size="sm" onClick={() => exportToCSV(expenses)} disabled={!expenses.length} className="mb-2">Export to CSV</Button>
                {expenses.map((expense) => (
                  <div key={expense.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input type="checkbox" checked={selectedIds.includes(expense.id)} onChange={() => toggleSelect(expense.id)} />
                          <h3 className="font-semibold">{expense.description}</h3>
                          {getStatusBadge(expense.status)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Amount:</span> {formatCurrency(expense.amount)}
                          </div>
                          <div>
                            <span className="font-medium">Category:</span> {expense.category.name}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(expense.expenseDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Requested by:</span> {expense.requestedBy.name || expense.requestedBy.email}
                          </div>
                        </div>
                        {expense.vendorName && (
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Vendor:</span> {expense.vendorName}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Expense Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Description</Label>
                                <p>{expense.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Amount</Label>
                                  <p>{formatCurrency(expense.amount)}</p>
                                </div>
                                <div>
                                  <Label>VAT Amount</Label>
                                  <p>{expense.vatAmount ? formatCurrency(expense.vatAmount) : 'N/A'}</p>
                                </div>
                              </div>
                              <div>
                                <Label>Category</Label>
                                <p>{expense.category.name}</p>
                              </div>
                              {expense.vendorName && (
                                <div>
                                  <Label>Vendor</Label>
                                  <p>{expense.vendorName}</p>
                                </div>
                              )}
                              {expense.notes && (
                                <div>
                                  <Label>Notes</Label>
                                  <p>{expense.notes}</p>
                                </div>
                              )}
                              {expense.approvals.length > 0 && (
                                <div>
                                  <Label>Approval History</Label>
                                  <div className="space-y-2">
                                    {expense.approvals.map((approval) => (
                                      <div key={approval.id} className="text-sm border-l-2 border-gray-200 pl-2">
                                        <div className="flex justify-between">
                                          <span>{approval.approver.name || approval.approver.email}</span>
                                          <Badge className={approval.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                            {approval.status}
                                          </Badge>
                                        </div>
                                        <div className="text-gray-600">
                                          {new Date(approval.approvedAt).toLocaleDateString()}
                                        </div>
                                        {approval.comments && (
                                          <div className="text-gray-600 mt-1">
                                            {approval.comments}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {canApprove && expense.status === 'PENDING_APPROVAL' && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Approve/Reject Expense</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Comments (optional)</Label>
                                  <Textarea
                                    value={approvalComments}
                                    onChange={(e) => setApprovalComments(e.target.value)}
                                    placeholder="Add approval comments..."
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleApprove(expense.id, 'REJECTED')}
                                  >
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                  <Button
                                    onClick={() => handleApprove(expense.id, 'APPROVED')}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditExpense(expense);
                          setEditForm({
                            description: expense.description,
                            amount: String(expense.amount),
                            expenseDate: expense.expenseDate.split('T')[0],
                            categoryId: expense.categoryId,
                            vendorName: expense.vendorName || '',
                            notes: expense.notes || '',
                            vatRate: expense.vatRate ? String(expense.vatRate) : '15',
                            status: expense.status,
                          });
                        }}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => toggleSelect(expense.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-600">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} expenses
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
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
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {expenses.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                  <span className="text-sm">Select All</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!editExpense} onOpenChange={(open) => { if (!open) setEditExpense(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          {editForm && (
            <form onSubmit={async (e) => {
              e.preventDefault();
              setEditLoading(true);
              try {
                const res = await fetch(`/api/accounting/expenses/${editExpense!.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(editForm),
                });
                if (res.ok) {
                  toast.success('Expense updated');
                  setEditExpense(null);
                  fetchExpenses();
                } else {
                  const err = await res.json();
                  toast.error(err.error || 'Failed to update expense');
                }
              } finally {
                setEditLoading(false);
              }
            }} className="space-y-4">
              <div>
                <Label>Description</Label>
                <Input value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required />
              </div>
              <div>
                <Label>Amount</Label>
                <Input type="number" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} required />
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" value={editForm.expenseDate} onChange={e => setEditForm({ ...editForm, expenseDate: e.target.value })} required />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={editForm.categoryId} onValueChange={val => setEditForm({ ...editForm, categoryId: val })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Vendor</Label>
                <Input value={editForm.vendorName} onChange={e => setEditForm({ ...editForm, vendorName: e.target.value })} />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} />
              </div>
              <div>
                <Label>VAT Rate</Label>
                <Input type="number" value={editForm.vatRate} onChange={e => setEditForm({ ...editForm, vatRate: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={val => setEditForm({ ...editForm, status: val })}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditExpense(null)}>Cancel</Button>
                <Button type="submit" disabled={editLoading}>
                  {editLoading ? <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-gray-900 inline-block"></span> : null}
                  Save
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!showDeleteId} onOpenChange={(open) => { if (!open) setShowDeleteId(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Expense{showDeleteId && showDeleteId.includes(',') ? 's' : ''}</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete {showDeleteId && showDeleteId.includes(',') ? 'these expenses' : 'this expense'}? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" disabled={deleteLoading} onClick={async () => {
              setDeleteLoading(true);
              try {
                if (showDeleteId && showDeleteId.includes(',')) {
                  // Bulk delete
                  await Promise.all(showDeleteId.split(',').map(id => fetch(`/api/accounting/expenses/${id}`, { method: 'DELETE' })));
                  toast.success('Expenses deleted');
                } else {
                  // Single delete
                  const res = await fetch(`/api/accounting/expenses/${showDeleteId}`, { method: 'DELETE' });
                  if (res.ok) {
                    toast.success('Expense deleted');
                  } else {
                    const err = await res.json();
                    toast.error(err.error || 'Failed to delete expense');
                  }
                }
                setShowDeleteId(null);
                clearSelection();
                fetchExpenses();
              } finally {
                setDeleteLoading(false);
              }
            }}>
              {deleteLoading ? <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-white inline-block"></span> : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseManagement; 