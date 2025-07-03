'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Receipt, 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { ReceiptScanner } from './ReceiptScanner';
import { ReceiptData } from '@/lib/ocr';
import { toast } from 'sonner';

interface ExpenseFormWithOCRProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  categories: Array<{ id: string; name: string }>;
  suppliers: Array<{ id: string; name: string }>;
}

export const ExpenseFormWithOCR: React.FC<ExpenseFormWithOCRProps> = ({
  onSubmit,
  onCancel,
  categories,
  suppliers
}) => {
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    vendorName: '',
    amount: '',
    vatAmount: '',
    vatRate: '15',
    categoryId: '',
    supplierId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    notes: '',
    items: ''
  });

  const handleOCRDataExtracted = (data: ReceiptData) => {
    setFormData({
      vendorName: data.vendor,
      amount: data.amount.toString(),
      vatAmount: data.vatAmount.toString(),
      vatRate: '15',
      categoryId: formData.categoryId,
      supplierId: formData.supplierId,
      expenseDate: data.date.toISOString().split('T')[0],
      notes: data.items.join('\n'),
      items: data.items.join('\n')
    });
    
    setShowScanner(false);
    toast.success('Receipt data imported successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendorName || !formData.amount || !formData.categoryId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    
    try {
      const expenseData = {
        vendorName: formData.vendorName,
        amount: parseFloat(formData.amount),
        vatAmount: parseFloat(formData.vatAmount),
        vatRate: parseFloat(formData.vatRate),
        categoryId: formData.categoryId,
        supplierId: formData.supplierId || undefined,
        expenseDate: new Date(formData.expenseDate),
        notes: formData.notes
      };

      await onSubmit(expenseData);
      toast.success('Expense created successfully!');
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to create expense');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateVAT = (amount: string) => {
    const numAmount = parseFloat(amount) || 0;
    const vatRate = parseFloat(formData.vatRate) || 15;
    return (numAmount * vatRate / 100).toFixed(2);
  };

  const handleAmountChange = (value: string) => {
    setFormData({
      ...formData,
      amount: value,
      vatAmount: calculateVAT(value)
    });
  };

  if (showScanner) {
    return (
      <ReceiptScanner
        onDataExtracted={handleOCRDataExtracted}
        onCancel={() => setShowScanner(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* OCR Scanner Button */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Receipt Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowScanner(true)}
              className="h-32 flex flex-col gap-2"
            >
              <Camera className="h-8 w-8" />
              <span>Scan Receipt</span>
              <span className="text-sm text-gray-500">Use camera or upload</span>
            </Button>
            
            <div className="h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Manual Entry</p>
                <p className="text-xs text-gray-500">Fill form below</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Form */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor and Amount Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vendorName">Vendor Name *</Label>
                <Input
                  id="vendorName"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({
                    ...formData,
                    vendorName: e.target.value
                  })}
                  placeholder="Enter vendor name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (R) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* VAT Row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="vatRate">VAT Rate (%)</Label>
                <Select
                  value={formData.vatRate}
                  onValueChange={(value) => {
                    setFormData({
                      ...formData,
                      vatRate: value,
                      vatAmount: calculateVAT(formData.amount)
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="vatAmount">VAT Amount (R)</Label>
                <Input
                  id="vatAmount"
                  type="number"
                  step="0.01"
                  value={formData.vatAmount}
                  onChange={(e) => setFormData({
                    ...formData,
                    vatAmount: e.target.value
                  })}
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <Label>Total (R)</Label>
                <div className="h-10 px-3 py-2 border rounded-md bg-gray-50 flex items-center">
                  <span className="font-semibold">
                    R{((parseFloat(formData.amount) || 0) + (parseFloat(formData.vatAmount) || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Category and Supplier Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    categoryId: value
                  })}
                >
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
                <Label htmlFor="supplier">Supplier (Optional)</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => setFormData({
                    ...formData,
                    supplierId: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No supplier</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="expenseDate">Expense Date</Label>
              <Input
                id="expenseDate"
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData({
                  ...formData,
                  expenseDate: e.target.value
                })}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Notes / Items</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  notes: e.target.value
                })}
                placeholder="Enter additional notes or items from receipt..."
                rows={3}
              />
            </div>

            {/* Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Expense Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Vendor:</span>
                  <span className="font-medium">{formData.vendorName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span className="font-medium">R{parseFloat(formData.amount || '0').toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({formData.vatRate}%):</span>
                  <span className="font-medium">R{parseFloat(formData.vatAmount || '0').toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>R{((parseFloat(formData.amount) || 0) + (parseFloat(formData.vatAmount) || 0)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button type="submit" disabled={isProcessing} className="flex-1">
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Expense
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tips */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Tip:</strong> Use the receipt scanner to automatically extract expense details from photos. 
          The OCR technology can recognize vendor names, amounts, dates, and items from most receipt formats.
        </AlertDescription>
      </Alert>
    </div>
  );
}; 