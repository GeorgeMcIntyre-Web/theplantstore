"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplets, Sun, Scissors, Heart } from "lucide-react";
import { motion } from "framer-motion";

const careGuides = [
  {
    icon: Droplets,
    title: "Watering Guide",
    description: "Learn the perfect watering schedule for each type of plant",
    tips: [
      "Check soil moisture",
      "Water deeply but less frequently",
      "Use room temperature water",
    ],
    color: "text-blue-600",
  },
  {
    icon: Sun,
    title: "Light Requirements",
    description: "Understanding light needs for healthy plant growth",
    tips: [
      "Identify light levels",
      "Rotate plants regularly",
      "Use grow lights if needed",
    ],
    color: "text-yellow-600",
  },
  {
    icon: Scissors,
    title: "Pruning & Care",
    description: "Keep your plants healthy with proper maintenance",
    tips: ["Remove dead leaves", "Prune for shape", "Clean leaves regularly"],
    color: "text-green-600",
  },
  {
    icon: Heart,
    title: "Troubleshooting",
    description: "Common problems and how to solve them",
    tips: ["Yellowing leaves", "Pest management", "Root rot prevention"],
    color: "text-red-600",
  },
];

export function PlantCareSection() {
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
            Plant Care Made Simple
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Expert tips and guides to help you keep your plants thriving. From
            beginners to plant enthusiasts, we've got you covered.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {careGuides.map((guide, index) => (
            <motion.div
              key={guide.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full card-hover">
                <CardHeader className="text-center">
                  <div
                    className={`mx-auto p-3 rounded-full bg-muted mb-4 w-fit`}
                  >
                    <guide.icon className={`h-8 w-8 ${guide.color}`} />
                  </div>
                  <CardTitle className="text-lg">{guide.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4 text-center">
                    {guide.description}
                  </p>
                  <ul className="space-y-2">
                    {guide.tips.map((tip, tipIndex) => (
                      <li key={tipIndex} className="text-sm flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button asChild size="lg" variant="outline">
            <Link href="/plant-care">View Complete Care Guide</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
