"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, Users, Send, TestTube } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function EmailManagement() {
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  // Newsletter form state
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [testEmail, setTestEmail] = useState('');

  // Custom email form state
  const [customTo, setCustomTo] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customHtml, setCustomHtml] = useState('');

  useEffect(() => {
    fetchSubscriberCount();
  }, []);

  const fetchSubscriberCount = async () => {
    try {
      const response = await fetch('/api/email/newsletter');
      if (response.ok) {
        const data = await response.json();
        setSubscriberCount(data.subscriberCount);
      }
    } catch (error) {
      console.error('Failed to fetch subscriber count:', error);
    }
  };

  const sendNewsletter = async (isTest: boolean = false) => {
    if (!newsletterSubject.trim() || !newsletterContent.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in both subject and content',
        variant: 'destructive',
      });
      return;
    }

    if (isTest && !testEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a test email address',
        variant: 'destructive',
      });
      return;
    }

    setNewsletterLoading(true);

    try {
      const response = await fetch('/api/email/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: newsletterSubject,
          content: newsletterContent,
          testEmail: isTest ? testEmail : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message,
        });
        
        if (!isTest) {
          // Reset form after successful send
          setNewsletterSubject('');
          setNewsletterContent('');
        }
      } else {
        throw new Error(data.error || 'Failed to send newsletter');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send newsletter',
        variant: 'destructive',
      });
    } finally {
      setNewsletterLoading(false);
    }
  };

  const sendCustomEmail = async () => {
    if (!customTo.trim() || !customSubject.trim() || !customHtml.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: customTo,
          subject: customSubject,
          html: customHtml,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: data.message,
        });
        
        // Reset form
        setCustomTo('');
        setCustomSubject('');
        setCustomHtml('');
      } else {
        throw new Error(data.error || 'Failed to send email');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send email',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-muted-foreground">Newsletter Subscribers:</span>
              <Badge variant="secondary">{subscriberCount}</Badge>
            </div>
          </div>

          <Tabs defaultValue="newsletter" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
              <TabsTrigger value="custom">Custom Email</TabsTrigger>
            </TabsList>

            <TabsContent value="newsletter" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="newsletter-subject">Subject</Label>
                  <Input
                    id="newsletter-subject"
                    placeholder="Newsletter subject..."
                    value={newsletterSubject}
                    onChange={(e) => setNewsletterSubject(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="test-email">Test Email (optional)</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="newsletter-content">Content (HTML)</Label>
                <Textarea
                  id="newsletter-content"
                  placeholder="Enter newsletter content in HTML format..."
                  value={newsletterContent}
                  onChange={(e) => setNewsletterContent(e.target.value)}
                  rows={10}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => sendNewsletter(true)}
                  disabled={newsletterLoading}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Send Test
                </Button>
                <Button
                  onClick={() => sendNewsletter(false)}
                  disabled={newsletterLoading}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {newsletterLoading ? 'Sending...' : `Send to ${subscriberCount} subscribers`}
                </Button>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Newsletter Tips:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Use HTML formatting for rich content</li>
                  <li>• Always test before sending to all subscribers</li>
                  <li>• Include plant care tips and seasonal advice</li>
                  <li>• Keep content engaging and informative</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div>
                <Label htmlFor="custom-to">To (Email addresses, comma-separated)</Label>
                <Input
                  id="custom-to"
                  type="email"
                  placeholder="user@example.com, another@example.com"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="custom-subject">Subject</Label>
                <Input
                  id="custom-subject"
                  placeholder="Email subject..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="custom-html">Content (HTML)</Label>
                <Textarea
                  id="custom-html"
                  placeholder="Enter email content in HTML format..."
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  rows={10}
                />
              </div>

              <Button
                onClick={sendCustomEmail}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {loading ? 'Sending...' : 'Send Email'}
              </Button>

              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">Custom Email Tips:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Use HTML formatting for professional emails</li>
                  <li>• Include your brand colors and styling</li>
                  <li>• Test with a small group first</li>
                  <li>• Ensure mobile-friendly formatting</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
} 