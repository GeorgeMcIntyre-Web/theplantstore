import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { PlantCareSection } from "@/components/home/plant-care-section";
import { NewsletterSection } from "@/components/home/newsletter-section";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <FeaturedCategories />
        <FeaturedProducts />
        <PlantCareSection />
        <NewsletterSection />
      </main>
      <Footer />
    </div>
  );
}
