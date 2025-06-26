
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Leaf } from 'lucide-react'
import { motion } from 'framer-motion'

export function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://i.ytimg.com/vi/30i2GAzJEgg/maxresdefault.jpg')`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center mb-6"
          >
            <Leaf className="h-12 w-12 text-green-400 mr-3" />
            <span className="text-xl font-semibold">The House Plant Store</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
          >
            Bring Nature 
            <span className="text-green-400"> Home</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-xl md:text-2xl mb-8 text-gray-200"
          >
            Discover South Africa's finest collection of indoor plants, outdoor plants, 
            and succulents delivered nationwide
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white">
              <Link href="/collections/indoor-plants">
                Shop Indoor Plants
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-black">
              <Link href="/plant-care">
                Plant Care Guide
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-10 left-10 hidden lg:block"
      >
        <div className="text-sm text-gray-300">
          <p>🚚 Free delivery nationwide</p>
          <p>🌱 Expert plant care advice</p>
          <p>🇿🇦 Proudly South African</p>
        </div>
      </motion.div>
    </section>
  )
}
