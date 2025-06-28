'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'
import { Product } from '@/lib/types'

interface ProductFormProps {
  product?: Product
}

const CARE_LEVELS = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'ADVANCED', label: 'Advanced' }
]

const LIGHT_REQUIREMENTS = [
  { value: 'LOW', label: 'Low Light' },
  { value: 'MEDIUM', label: 'Medium Light' },
  { value: 'BRIGHT', label: 'Bright Light' },
  { value: 'DIRECT_SUN', label: 'Direct Sun' }
]

const WATERING_FREQUENCIES = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BI_WEEKLY', label: 'Bi-weekly' },
  { value: 'MONTHLY', label: 'Monthly' }
]

const PLANT_SIZES = [
  { value: 'SMALL', label: 'Small' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LARGE', label: 'Large' }
]

const GROWTH_RATES = [
  { value: 'SLOW', label: 'Slow' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'FAST', label: 'Fast' }
]

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    price: product?.price?.toString() || '',
    compareAtPrice: product?.compareAtPrice?.toString() || '',
    sku: product?.sku || '',
    stockQuantity: product?.stockQuantity?.toString() || '',
    lowStockThreshold: product?.lowStockThreshold?.toString() || '10',
    weight: product?.weight?.toString() || '',
    dimensions: product?.dimensions || '',
    categoryId: product?.categoryId || '',
    isFeatured: product?.isFeatured || false,
    careLevel: product?.careLevel || '',
    lightRequirement: product?.lightRequirement || '',
    wateringFrequency: product?.wateringFrequency || '',
    isPetSafe: product?.isPetSafe || false,
    plantSize: product?.plantSize || '',
    growthRate: product?.growthRate || '',
    careInstructions: product?.careInstructions || '',
    metaTitle: product?.metaTitle || '',
    metaDescription: product?.metaDescription || ''
  })

  // Load categories on component mount
  useState(() => {
    async function loadCategories() {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories || [])
        }
      } catch (error) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const url = product 
        ? `/api/admin/products/${product.id}` 
        : '/api/admin/products'
      
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Product ${product ? 'updated' : 'created'} successfully`
        })
        router.push('/admin/products')
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save product')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save product',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Product Name*</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange('sku', e.target.value)}
                placeholder="e.g., MON-001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange('shortDescription', e.target.value)}
              placeholder="Brief description for product cards"
            />
          </div>

          <div>
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              placeholder="Detailed product description"
            />
          </div>

          <div>
            <Label htmlFor="categoryId">Category*</Label>
            <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
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
        </CardContent>
      </Card>

      {/* Pricing & Inventory */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing & Inventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="price">Price (R)*</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="compareAtPrice">Compare At Price (R)</Label>
              <Input
                id="compareAtPrice"
                type="number"
                step="0.01"
                value={formData.compareAtPrice}
                onChange={(e) => handleInputChange('compareAtPrice', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="stockQuantity">Stock Quantity*</Label>
              <Input
                id="stockQuantity"
                type="number"
                value={formData.stockQuantity}
                onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => handleInputChange('lowStockThreshold', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => handleInputChange('dimensions', e.target.value)}
                placeholder="e.g., 30cm H x 20cm W"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plant Care Information */}
      <Card>
        <CardHeader>
          <CardTitle>Plant Care Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="careLevel">Care Level</Label>
              <Select value={formData.careLevel} onValueChange={(value) => handleInputChange('careLevel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select care level" />
                </SelectTrigger>
                <SelectContent>
                  {CARE_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="lightRequirement">Light Requirement</Label>
              <Select value={formData.lightRequirement} onValueChange={(value) => handleInputChange('lightRequirement', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select light requirement" />
                </SelectTrigger>
                <SelectContent>
                  {LIGHT_REQUIREMENTS.map((req) => (
                    <SelectItem key={req.value} value={req.value}>
                      {req.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="wateringFrequency">Watering Frequency</Label>
              <Select value={formData.wateringFrequency} onValueChange={(value) => handleInputChange('wateringFrequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select watering frequency" />
                </SelectTrigger>
                <SelectContent>
                  {WATERING_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="plantSize">Plant Size</Label>
              <Select value={formData.plantSize} onValueChange={(value) => handleInputChange('plantSize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plant size" />
                </SelectTrigger>
                <SelectContent>
                  {PLANT_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="growthRate">Growth Rate</Label>
              <Select value={formData.growthRate} onValueChange={(value) => handleInputChange('growthRate', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select growth rate" />
                </SelectTrigger>
                <SelectContent>
                  {GROWTH_RATES.map((rate) => (
                    <SelectItem key={rate.value} value={rate.value}>
                      {rate.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isPetSafe"
                checked={formData.isPetSafe}
                onCheckedChange={(checked) => handleInputChange('isPetSafe', checked)}
              />
              <Label htmlFor="isPetSafe">Pet Safe</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="careInstructions">Care Instructions</Label>
            <Textarea
              id="careInstructions"
              value={formData.careInstructions}
              onChange={(e) => handleInputChange('careInstructions', e.target.value)}
              rows={3}
              placeholder="Detailed care instructions for customers"
            />
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formData.isFeatured}
              onCheckedChange={(checked) => handleInputChange('isFeatured', checked)}
            />
            <Label htmlFor="isFeatured">Featured Product</Label>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Meta Title</Label>
            <Input
              id="metaTitle"
              value={formData.metaTitle}
              onChange={(e) => handleInputChange('metaTitle', e.target.value)}
              placeholder="SEO title for search engines"
            />
          </div>
          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              value={formData.metaDescription}
              onChange={(e) => handleInputChange('metaDescription', e.target.value)}
              rows={2}
              placeholder="SEO description for search engines"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/admin/products')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </Button>
      </div>
    </form>
  )
}