import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/hooks/use-cart";
import { SessionProvider } from "next-auth/react";
import ClientLayout from "./client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The House Plant Store - South Africa's Premier Plant Shop",
  description:
    "Discover beautiful indoor plants, outdoor plants, succulents and accessories. Premium plant delivery across all South African provinces.",
  keywords:
    "plants, indoor plants, outdoor plants, succulents, plant delivery, South Africa, houseplants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Only show WhatsAppButton on non-admin, non-api pages
  const pathname = typeof window !== "undefined" ? window.location.pathname : "";
  const showWhatsApp =
    !pathname.startsWith("/admin") && !pathname.startsWith("/api");
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
