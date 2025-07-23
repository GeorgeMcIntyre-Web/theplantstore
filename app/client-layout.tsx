"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/hooks/use-cart";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/toaster";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <CartProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </CartProvider>
      </ThemeProvider>
    </SessionProvider>
  );
} 