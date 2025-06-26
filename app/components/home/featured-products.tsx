
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Product } from '@/lib/types'
import { Star, Heart, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/use-cart'

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { addItem } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
    }).format(price)
  }

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await fetch('/api/products/featured')
        if (response.ok) {
          const data = await response.json()
          setProducts(data.products || [])
        }
      } catch (error) {
        console.error('Failed to fetch featured products:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Plants</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted rounded-lg aspect-square mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Plants</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hand-picked favorites that are perfect for beginners and experienced plant parents alike
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((product, index) => {
            const primaryImage = product.images.find(img => img.isPrimary) || product.images[0]
            const discountPercent = product.compareAtPrice 
              ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
              : 0

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="group cursor-pointer card-hover">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Link href={`/products/${product.slug}`}>
                        <div className="relative aspect-square overflow-hidden rounded-t-lg">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={primaryImage.altText || product.name}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">No image</span>
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {discountPercent > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            -{discountPercent}%
                          </Badge>
                        )}
                        {product.stockQuantity <= product.lowStockThreshold && (
                          <Badge variant="secondary" className="text-xs">
                            Low Stock
                          </Badge>
                        )}
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex flex-col gap-2">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-semibold mb-2 hover:text-primary transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>

                      {/* Care Level & Pet Safe */}
                      <div className="flex items-center gap-2 mb-3">
                        {product.careLevel && (
                          <Badge variant="outline" className="text-xs">
                            {product.careLevel.toLowerCase()}
                          </Badge>
                        )}
                        {product.isPetSafe && (
                          <Badge variant="outline" className="text-xs text-green-600">
                            Pet Safe
                          </Badge>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="text-lg font-bold currency">
                            {formatPrice(product.price)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="ml-2 text-sm text-muted-foreground line-through">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          )}
                        </div>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-muted-foreground">4.8</span>
                        </div>
                      </div>

                      {/* Add to Cart */}
                      <Button 
                        className="w-full"
                        onClick={() => addItem(product.id)}
                        disabled={product.stockQuantity === 0}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button asChild variant="outline" size="lg">
            <Link href="/collections/indoor-plants">
              View All Plants
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
