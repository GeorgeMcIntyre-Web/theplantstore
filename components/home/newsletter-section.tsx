"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Leaf, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribed(true);
        setEmail('');
        toast({
          title: 'Success!',
          description: 'You have been subscribed to our newsletter!',
        });
      } else {
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to subscribe to newsletter',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-6">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-800 mb-2">
                Welcome to The Plant Family! 🌱
              </h3>
              <p className="text-green-700 mb-4">
                You're now subscribed to our newsletter. Look out for plant care tips, 
                new arrivals, and exclusive offers in your inbox!
              </p>
              <Button
                variant="outline"
                onClick={() => setSubscribed(false)}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                Subscribe Another Email
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-r from-green-50 to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-green-100 rounded-full">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Stay Green with Our Newsletter 🌿
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Get exclusive plant care tips, new arrivals, seasonal advice, and special offers 
            delivered straight to your inbox. Join our growing community of plant lovers!
          </p>

          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Leaf className="h-5 w-5 text-green-600" />
                Subscribe Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubscribe} className="space-y-4">
                <div>
                  <Label htmlFor="newsletter-email" className="sr-only">
                    Email Address
                  </Label>
                  <Input
                    id="newsletter-email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-center"
                    required
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Subscribing...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Subscribe to Newsletter
                    </div>
                  )}
                </Button>
              </form>
              
              <p className="text-xs text-gray-500 mt-3">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Plant Care Tips</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>New Arrivals</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Exclusive Offers</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
