import { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CategoryGrid } from "@/components/collections/category-grid";
import { FeaturedProducts } from "@/components/home/featured-products";

export const metadata: Metadata = {
  title: "Shop All Plants - The House Plant Store",
  description:
    "Browse our complete collection of indoor plants, outdoor plants, succulents, and accessories. Find the perfect plants for your home and garden.",
};

export default function CollectionsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Shop All Plants</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our complete collection of beautiful plants and
              accessories. From low-maintenance succulents to statement indoor
              plants, find everything you need to create your green oasis.
            </p>
          </div>

          {/* Category Grid */}
          <CategoryGrid />

          {/* Featured Products */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8">
              Featured Plants
            </h2>
            <FeaturedProducts />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
