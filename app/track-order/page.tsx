import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TrackingComponent } from '@/components/shipping/tracking-component';

export const metadata = {
  title: 'Track Your Order - The House Plant Store',
  description: 'Track your plant delivery with real-time shipping updates.',
};

export default function TrackOrderPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Track Your Order</h1>
            <p className="text-lg text-muted-foreground">
              Enter your tracking number to see real-time delivery updates
            </p>
          </div>
          <TrackingComponent />
        </div>
      </main>
      <Footer />
    </div>
  );
} 