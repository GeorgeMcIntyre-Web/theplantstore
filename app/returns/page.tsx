
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RotateCcw, Shield, Clock, CheckCircle } from 'lucide-react'

export const metadata = {
  title: 'Returns & Exchanges - The House Plant Store',
  description: 'Learn about our return policy, plant guarantee, and how to exchange or return your plants.',
}

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Returns & Exchanges</h1>
              <p className="text-lg text-muted-foreground">
                Your satisfaction is our priority. Learn about our hassle-free return policy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">30-Day Guarantee</h3>
                  <p className="text-sm text-muted-foreground">Plant health guarantee</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">14-Day Returns</h3>
                  <p className="text-sm text-muted-foreground">Easy return process</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <RotateCcw className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Free Exchanges</h3>
                  <p className="text-sm text-muted-foreground">No exchange fees</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Expert Support</h3>
                  <p className="text-sm text-muted-foreground">Plant care assistance</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              {/* Plant Guarantee */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    30-Day Plant Health Guarantee
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We stand behind the quality of our plants. If your plant arrives damaged, diseased, 
                    or dies within 30 days of delivery despite proper care, we'll replace it free of charge 
                    or provide a full refund.
                  </p>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">What's Covered:</h4>
                    <ul className="text-green-700 space-y-1 text-sm">
                      <li>• Plants that arrive damaged or diseased</li>
                      <li>• Plants that die within 30 days with proper care</li>
                      <li>• Incorrect plants sent (wrong variety or size)</li>
                      <li>• Packaging damage affecting plant health</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-800 mb-2">Please Note:</h4>
                    <ul className="text-amber-700 space-y-1 text-sm">
                      <li>• Photos of the plant's condition may be requested</li>
                      <li>• Proof of following care instructions required</li>
                      <li>• Natural leaf drop or minor cosmetic issues are normal</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Return Policy */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RotateCcw className="h-5 w-5" />
                    14-Day Return Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Not completely satisfied with your purchase? You can return most items within 
                    14 days of delivery for a full refund or exchange.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Returnable Items:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Accessories and plant care products
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Pots and planters (unused)
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Tools and equipment
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Plants (in original condition)
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-3">Return Requirements:</h4>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          Items in original condition
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          Original packaging included
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          Return within 14 days
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                          Valid proof of purchase
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Return Process */}
              <Card>
                <CardHeader>
                  <CardTitle>How to Start a Return</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Contact Us</h4>
                        <p className="text-muted-foreground">
                          Email us at hello@thehouseplantstore.co.za or call +27 11 123 4567 
                          with your order number and reason for return.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Get Return Authorization</h4>
                        <p className="text-muted-foreground">
                          We'll provide you with a return authorization number and shipping instructions.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">3</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Package & Send</h4>
                        <p className="text-muted-foreground">
                          Carefully package your items and send them back using our prepaid return label.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-semibold">4</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">Receive Refund</h4>
                        <p className="text-muted-foreground">
                          Once we receive and inspect your return, we'll process your refund within 3-5 business days.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 text-center">
                    <Button size="lg">
                      Start a Return
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
