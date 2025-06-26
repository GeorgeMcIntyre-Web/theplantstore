
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Product, Review } from '@/lib/types'
import { Star, Droplets, Sun, PawPrint, Ruler, TrendingUp, Scissors } from 'lucide-react'

interface ProductTabsProps {
  product: Product & {
    reviews: (Review & {
      user: {
        name: string | null
        image: string | null
      }
    })[]
  }
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description')

  const getCareIcon = (type: string) => {
    switch (type) {
      case 'watering':
        return <Droplets className="h-5 w-5 text-blue-600" />
      case 'light':
        return <Sun className="h-5 w-5 text-yellow-600" />
      case 'pet':
        return <PawPrint className="h-5 w-5 text-green-600" />
      case 'size':
        return <Ruler className="h-5 w-5 text-purple-600" />
      case 'growth':
        return <TrendingUp className="h-5 w-5 text-orange-600" />
      case 'care':
        return <Scissors className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="care">Care Guide</TabsTrigger>
        <TabsTrigger value="reviews">
          Reviews ({product.reviews.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br>') }} />
              ) : (
                <p className="text-muted-foreground">No description available for this product.</p>
              )}
            </div>

            {product.dimensions && (
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Dimensions</h4>
                <p className="text-sm">{product.dimensions}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="care" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6">Plant Care Guide</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {product.careLevel && (
                <div className="flex items-start gap-3">
                  {getCareIcon('care')}
                  <div>
                    <h4 className="font-semibold mb-1">Care Level</h4>
                    <Badge variant="outline" className="mb-2">
                      {product.careLevel.toLowerCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {product.careLevel === 'EASY' && 'Perfect for beginners. Low maintenance and forgiving.'}
                      {product.careLevel === 'MODERATE' && 'Requires some attention but manageable for most plant parents.'}
                      {product.careLevel === 'ADVANCED' && 'Best for experienced plant enthusiasts. Requires specific care.'}
                    </p>
                  </div>
                </div>
              )}

              {product.lightRequirement && (
                <div className="flex items-start gap-3">
                  {getCareIcon('light')}
                  <div>
                    <h4 className="font-semibold mb-1">Light Requirements</h4>
                    <Badge variant="outline" className="mb-2">
                      {product.lightRequirement.replace('_', ' ').toLowerCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {product.lightRequirement === 'LOW' && 'Thrives in low light conditions. Perfect for darker rooms.'}
                      {product.lightRequirement === 'MEDIUM' && 'Prefers bright, indirect light. Most rooms work well.'}
                      {product.lightRequirement === 'BRIGHT' && 'Needs bright, indirect light. Place near windows.'}
                      {product.lightRequirement === 'DIRECT_SUN' && 'Loves direct sunlight. Best in sunny locations.'}
                    </p>
                  </div>
                </div>
              )}

              {product.wateringFrequency && (
                <div className="flex items-start gap-3">
                  {getCareIcon('watering')}
                  <div>
                    <h4 className="font-semibold mb-1">Watering Schedule</h4>
                    <Badge variant="outline" className="mb-2">
                      {product.wateringFrequency.replace('_', ' ').toLowerCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {product.wateringFrequency === 'WEEKLY' && 'Water once a week. Check soil moisture before watering.'}
                      {product.wateringFrequency === 'BI_WEEKLY' && 'Water every two weeks. Allow soil to dry between waterings.'}
                      {product.wateringFrequency === 'MONTHLY' && 'Water once a month. Very drought tolerant.'}
                    </p>
                  </div>
                </div>
              )}

              {product.isPetSafe !== null && (
                <div className="flex items-start gap-3">
                  {getCareIcon('pet')}
                  <div>
                    <h4 className="font-semibold mb-1">Pet Safety</h4>
                    <Badge 
                      variant="outline" 
                      className={`mb-2 ${product.isPetSafe ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}
                    >
                      {product.isPetSafe ? 'Pet Safe' : 'Not Pet Safe'}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {product.isPetSafe 
                        ? 'Safe for cats and dogs. Non-toxic if consumed.'
                        : 'Keep away from pets. Can be toxic if consumed.'
                      }
                    </p>
                  </div>
                </div>
              )}

              {product.plantSize && (
                <div className="flex items-start gap-3">
                  {getCareIcon('size')}
                  <div>
                    <h4 className="font-semibold mb-1">Plant Size</h4>
                    <Badge variant="outline" className="mb-2">
                      {product.plantSize.toLowerCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {product.plantSize === 'SMALL' && 'Compact size, perfect for desks and small spaces.'}
                      {product.plantSize === 'MEDIUM' && 'Medium-sized, great for floor placement or large surfaces.'}
                      {product.plantSize === 'LARGE' && 'Large statement plant, perfect as a focal point.'}
                    </p>
                  </div>
                </div>
              )}

              {product.growthRate && (
                <div className="flex items-start gap-3">
                  {getCareIcon('growth')}
                  <div>
                    <h4 className="font-semibold mb-1">Growth Rate</h4>
                    <Badge variant="outline" className="mb-2">
                      {product.growthRate.toLowerCase()}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {product.growthRate === 'SLOW' && 'Grows slowly. Perfect for maintaining size and shape.'}
                      {product.growthRate === 'MODERATE' && 'Steady growth rate. Manageable with occasional pruning.'}
                      {product.growthRate === 'FAST' && 'Fast-growing. May need regular pruning and repotting.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {product.careInstructions && (
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Additional Care Instructions</h4>
                <div className="text-sm" dangerouslySetInnerHTML={{ 
                  __html: product.careInstructions.replace(/\n/g, '<br>') 
                }} />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reviews" className="mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-6">Customer Reviews</h3>
            
            {product.reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No reviews yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Be the first to share your experience with this plant!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {product.reviews.map((review) => (
                  <div key={review.id} className="border-b border-muted last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={review.user.image || ''} />
                        <AvatarFallback>
                          {review.user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">{review.user.name || 'Anonymous'}</span>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                          {review.isVerified && (
                            <Badge variant="outline" className="text-xs">
                              Verified Purchase
                            </Badge>
                          )}
                        </div>
                        
                        {review.title && (
                          <h4 className="font-semibold mb-2">{review.title}</h4>
                        )}
                        
                        {review.comment && (
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
