"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      // Simulate newsletter signup
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="max-w-2xl mx-auto plant-gradient text-white">
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="mb-6"
              >
                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  Stay in the Loop
                </h2>
                <p className="text-white/90 text-lg">
                  Get plant care tips, new arrivals, and exclusive offers
                  delivered to your inbox
                </p>
              </motion.div>

              {!isSubscribed ? (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  onSubmit={handleSubmit}
                  className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
                >
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/70"
                    required
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isLoading}
                    className="bg-white text-gray-900 hover:bg-white/90"
                  >
                    {isLoading ? (
                      <div className="spinner mr-2" />
                    ) : (
                      <Mail className="mr-2 h-4 w-4" />
                    )}
                    Subscribe
                  </Button>
                </motion.form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-center justify-center gap-3 text-green-200"
                >
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-semibold">
                    Successfully subscribed!
                  </span>
                </motion.div>
              )}

              <p className="text-xs text-white/60 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
