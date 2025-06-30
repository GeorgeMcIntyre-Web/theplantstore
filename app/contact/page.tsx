import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Contact Us - The House Plant Store",
  description:
    "Get in touch with The House Plant Store. We're here to help with all your plant questions and orders.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
              <p className="text-lg text-muted-foreground">
                We're here to help with all your plant questions and orders. Get
                in touch!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Get in Touch
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-start gap-4">
                      <Mail className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Email</h3>
                        <p className="text-muted-foreground">
                          houseplantstore@gmail.com
                        </p>
                        <p className="text-sm text-muted-foreground">
                          We typically respond within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <Phone className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Phone</h3>
                        <p className="text-muted-foreground">+27 11 123 4567</p>
                        <p className="text-sm text-muted-foreground">
                          Mon-Fri: 9AM-5PM, Sat: 9AM-2PM
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Contact Person: Bodene van Niekerk, Cell: 064 836 0876
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Location</h3>
                        <p className="text-muted-foreground">
                          Johannesburg, South Africa
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Delivery available nationwide
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold">
                        How do I care for my new plant?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Each plant comes with detailed care instructions. You
                        can also visit our Plant Care Guide page.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        What is your delivery policy?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        We deliver nationwide across all 9 South African
                        provinces. Free delivery on orders over R500.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold">
                        Do you offer plant guarantees?
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Yes! We offer a 30-day plant guarantee and easy returns
                        within 14 days.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" placeholder="Your first name" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Your last name" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="How can we help you?" />
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your question or feedback..."
                        className="min-h-[120px]"
                      />
                    </div>

                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
