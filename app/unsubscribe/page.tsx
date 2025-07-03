"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

function UnsubscribeForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [unsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleUnsubscribe = async (e: React.FormEvent) => {
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
    setError('');

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setUnsubscribed(true);
        toast({
          title: 'Success',
          description: 'You have been unsubscribed from our newsletter',
        });
      } else {
        setError(data.error || 'Failed to unsubscribe');
        toast({
          title: 'Error',
          description: data.error || 'Failed to unsubscribe',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setError('An error occurred while unsubscribing');
      toast({
        title: 'Error',
        description: 'An error occurred while unsubscribing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (unsubscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-red-800 mb-2">
              Unsubscribed Successfully
            </h1>
            <p className="text-red-700 mb-4">
              You have been removed from our newsletter mailing list. 
              We're sorry to see you go!
            </p>
            <p className="text-sm text-gray-600 mb-4">
              If you change your mind, you can always resubscribe by visiting our homepage.
            </p>
            <Button
              onClick={() => window.location.href = '/'}
              className="bg-red-600 hover:bg-red-700"
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-800">
            Unsubscribe from Newsletter
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            We're sorry to see you go! Enter your email address to unsubscribe from our newsletter.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div>
              <Label htmlFor="unsubscribe-email">Email Address</Label>
              <Input
                id="unsubscribe-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Unsubscribing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Unsubscribe
                </div>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 mb-2">
              Changed your mind?
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="text-sm"
            >
              Return to Homepage
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">Loading...</div>}>
      <UnsubscribeForm />
    </Suspense>
  );
} 