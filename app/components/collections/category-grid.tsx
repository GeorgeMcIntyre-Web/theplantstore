
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const categories = [
  {
    name: 'Indoor Plants',
    href: '/collections/indoor-plants',
    image: 'https://i.pinimg.com/originals/81/1d/d4/811dd40d4702a1417e931771fc1859ef.jpg',
    description: 'Perfect for every room in your home',
    itemCount: '15+ varieties',
    featured: ['Monstera', 'Snake Plant', 'Peace Lily', 'Fiddle Leaf Fig']
  },
  {
    name: 'Outdoor Plants',
    href: '/collections/outdoor-plants',
    image: 'https://i.pinimg.com/originals/ab/93/6c/ab936cc07364187e67e4a18a0130cb76.jpg',
    description: 'Transform your garden and outdoor spaces',
    itemCount: '10+ varieties',
    featured: ['Lavender', 'Rosemary', 'Bougainvillea', 'Geranium']
  },
  {
    name: 'Succulents',
    href: '/collections/succulents',
    image: 'https://i.pinimg.com/originals/d0/7b/c5/d07bc5eacebc095eeb600684da0aeec7.jpg',
    description: 'Low maintenance, high impact',
    itemCount: '5+ varieties',
    featured: ['Aloe Vera', 'Jade Plant', 'Echeveria', 'String of Pearls']
  },
  {
    name: 'Accessories',
    href: '/collections/accessories',
    image: 'https://i.pinimg.com/originals/91/38/d0/9138d08e5e29ad4f0bdd6ce12363a8d5.png',
    description: 'Everything you need for plant care',
    itemCount: '10+ items',
    featured: ['Ceramic Pots', 'Plant Food', 'Watering Can', 'Pruning Shears']
  }
]

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {categories.map((category, index) => (
        <motion.div
          key={category.name}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="group cursor-pointer card-hover h-full">
            <Link href={category.href}>
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  
                  {/* Overlay Content */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-sm mb-2 opacity-90">{category.description}</p>
                      <p className="text-xs opacity-75 mb-4">{category.itemCount}</p>
                      
                      {/* Featured Items */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {category.featured.slice(0, 3).map((item) => (
                          <span
                            key={item}
                            className="text-xs bg-white/20 px-2 py-1 rounded"
                          >
                            {item}
                          </span>
                        ))}
                        {category.featured.length > 3 && (
                          <span className="text-xs bg-white/20 px-2 py-1 rounded">
                            +{category.featured.length - 3} more
                          </span>
                        )}
                      </div>
                      
                      <Button variant="secondary" size="sm" className="w-full group-hover:bg-white group-hover:text-black transition-colors">
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
