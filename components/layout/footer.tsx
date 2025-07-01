import React from "react";
import Link from "next/link";
import {
  Leaf,
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <>
      <footer className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center space-x-2">
                <Leaf className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">The House Plant Store</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                South Africa's premier destination for beautiful indoor plants,
                outdoor plants, and succulents. Bringing nature to your home.
              </p>
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Twitter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold">Shop</h4>
              <div className="space-y-2 text-sm">
                <Link
                  href="/collections/indoor-plants"
                  className="block hover:text-primary"
                >
                  Indoor Plants
                </Link>
                <Link
                  href="/collections/outdoor-plants"
                  className="block hover:text-primary"
                >
                  Outdoor Plants
                </Link>
                <Link
                  href="/collections/succulents"
                  className="block hover:text-primary"
                >
                  Succulents
                </Link>
                <Link
                  href="/collections/accessories"
                  className="block hover:text-primary"
                >
                  Accessories
                </Link>
              </div>
            </div>

            {/* Customer Service */}
            <div className="space-y-4">
              <h4 className="font-semibold">Customer Service</h4>
              <div className="space-y-2 text-sm">
                <Link href="/shipping" className="block hover:text-primary">
                  Shipping Information
                </Link>
                <Link href="/returns" className="block hover:text-primary">
                  Returns & Exchanges
                </Link>
                <Link href="/plant-care" className="block hover:text-primary">
                  Plant Care Guides
                </Link>
                <Link href="/contact" className="block hover:text-primary">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="font-semibold">Get in Touch</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>houseplantstore@gmail.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>064 836 0876</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Durban, South Africa</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Contact: Bodene van Niekerk</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 The House Plant Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
