"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Indoor Plants",
    href: "/collections/indoor-plants",
    image:
      "https://i.pinimg.com/736x/75/e4/11/75e411c96ada8740a447e2a028865873.jpg",
    description: "Perfect for every room in your home",
    itemCount: "15+ varieties",
  },
  {
    name: "Outdoor Plants",
    href: "/collections/outdoor-plants",
    image:
      "https://i.pinimg.com/originals/ab/93/6c/ab936cc07364187e67e4a18a0130cb76.jpg",
    description: "Transform your garden and outdoor spaces",
    itemCount: "10+ varieties",
  },
  {
    name: "Succulents",
    href: "/collections/succulents",
    image:
      "https://i.pinimg.com/originals/d0/7b/c5/d07bc5eacebc095eeb600684da0aeec7.jpg",
    description: "Low maintenance, high impact",
    itemCount: "5+ varieties",
  },
  {
    name: "Accessories",
    href: "/collections/accessories",
    image:
      "https://i.pinimg.com/originals/91/38/d0/9138d08e5e29ad4f0bdd6ce12363a8d5.png",
    description: "Everything you need for plant care",
    itemCount: "10+ items",
  },
];

export function FeaturedCategories() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our carefully curated collection of plants and accessories,
            perfect for every space and skill level
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="group cursor-pointer card-hover border-0 shadow-md">
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
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        {category.description}
                      </p>
                      <p className="text-xs text-primary font-medium mb-4">
                        {category.itemCount}
                      </p>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto group-hover:text-primary"
                      >
                        Explore Collection
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
