"use client";

import { Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function InstagramShowcase() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Instagram className="h-8 w-8 text-pink-600 mr-3" />
            <h2 className="text-3xl font-bold">Follow Us on Instagram</h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get inspired by beautiful plants, care tips, and behind-the-scenes content. 
            Follow us @houseplantstoresa for daily plant inspiration!
          </p>
        </div>

        {/* Instagram Feed Placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="aspect-square bg-muted rounded-lg flex items-center justify-center"
            >
              <div className="text-center">
                <Instagram className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Instagram Post {item}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Link href="https://www.instagram.com/houseplantstoresa/" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Instagram className="h-5 w-5 mr-2" />
              Follow @houseplantstoresa
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            Join our community of plant lovers! 🌱
          </p>
        </div>
      </div>
    </section>
  );
}