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
      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/27821234567?text=Hi%20there!%20I%20have%20a%20question%20about%20your%20plants."
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 rounded-full shadow-lg bg-[#25D366] hover:bg-[#128C7E] transition-colors w-14 h-14 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-600"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="white"
          aria-hidden="true"
        >
          <path d="M16 3C9.373 3 4 8.373 4 15c0 2.637.86 5.08 2.36 7.13L4 29l7.13-2.36A11.93 11.93 0 0 0 16 27c6.627 0 12-5.373 12-12S22.627 3 16 3zm0 22c-1.98 0-3.89-.58-5.51-1.67l-.39-.25-4.23 1.4 1.4-4.23-.25-.39A9.94 9.94 0 0 1 6 15c0-5.514 4.486-10 10-10s10 4.486 10 10-4.486 10-10 10zm5.29-7.71c-.29-.15-1.71-.84-1.97-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.91 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.16-.01-.36-.01-.56-.01-.19 0-.51.07-.78.36-.27.29-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.21 3.05.15.19 2.09 3.19 5.08 4.34.71.25 1.26.4 1.69.51.71.18 1.36.16 1.87.1.57-.07 1.71-.7 1.95-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34z"/>
        </svg>
      </a>
    </>
  );
}
