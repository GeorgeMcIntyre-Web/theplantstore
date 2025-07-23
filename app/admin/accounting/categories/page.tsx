'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertTriangle, Plus, Pencil, Trash2, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    expenses: number;
  };
}

const CategoriesPage = () => {
  const { data: session } = useSession();
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ExpenseCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  });

  const hasAccess = session?.user?.role === 'SUPER_ADMIN' || 
                   session?.user?.role === 'FINANCIAL_MANAGER' || 
                   session?.user?.role === 'ACCOUNTANT';

  useEffect(() => {
    if (hasAccess) {
      fetchCategories();
    }
  }, [hasAccess]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/accounting/expense-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch categories');
        toast.error(errorData.error || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const url = editingCategory 
        ? `/api/accounting/expense-categories/${editingCategory.id}`
        : '/api/accounting/expense-categories';
      
      const method = editingCategory ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingCategory ? 'Category updated successfully' : 'Category created successfully');
        setFormData({ name: '', description: '', isActive: true });
        setShowForm(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || `Failed to ${editingCategory ? 'update' : 'create'} category`);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(`Failed to ${editingCategory ? 'update' : 'create'} category`);
    }
  };

  const handleDelete = async (category: ExpenseCategory) => {
    try {
      const response = await fetch(`/api/accounting/expense-categories/${category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Category deleted successfully');
        setDeletingCategory(null);
        fetchCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const handleEdit = (category: ExpenseCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', isActive: true });
    setEditingCategory(null);
    setShowForm(false);
  };

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage expense categories.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expense Categories</h1>
          <p className="text-gray-600">Manage expense categories for better organization</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
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
              <Button onClick={fetchCategories} variant="outline">
                Try Again
              </Button>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No categories found. Create your first category to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{category.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          category.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                      )}
                      <div className="text-sm text-gray-500">
                        Created: {new Date(category.createdAt).toLocaleDateString()}
                        {category._count && (
                          <span className="ml-4">
                            {category._count.expenses} expense{category._count.expenses !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingCategory(category)}
                            disabled={category._count && category._count.expenses > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Category</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {category._count && category._count.expenses > 0 ? (
                              <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                  <p className="font-medium text-yellow-800">Cannot Delete Category</p>
                                  <p className="text-sm text-yellow-700">
                                    This category has {category._count.expenses} associated expense{category._count.expenses !== 1 ? 's' : ''}. 
                                    Please reassign or delete the expenses first.
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p>
                                  Are you sure you want to delete the category "{category.name}"? 
                                  This action cannot be undone.
                                </p>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setDeletingCategory(null)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleDelete(category)}
                                  >
                                    Delete Category
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesPage; 