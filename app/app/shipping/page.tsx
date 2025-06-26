
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Truck, MapPin, Clock, Package } from 'lucide-react'

export const metadata = {
  title: 'Shipping Information - The House Plant Store',
  description: 'Learn about our shipping options, delivery times, and rates across South Africa.',
}

export default function ShippingPage() {
  const provinces = [
    { name: 'Gauteng', rate: 'R85', time: '1-2 business days' },
    { name: 'Western Cape', rate: 'R120', time: '2-3 business days' },
    { name: 'KwaZulu-Natal', rate: 'R110', time: '2-3 business days' },
    { name: 'Eastern Cape', rate: 'R130', time: '3-4 business days' },
    { name: 'Free State', rate: 'R105', time: '2-3 business days' },
    { name: 'Limpopo', rate: 'R140', time: '3-4 business days' },
    { name: 'Mpumalanga', rate: 'R125', time: '2-3 business days' },
    { name: 'North West', rate: 'R115', time: '2-3 business days' },
    { name: 'Northern Cape', rate: 'R150', time: '3-5 business days' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4">Shipping Information</h1>
              <p className="text-lg text-muted-foreground">
                Fast, reliable delivery across all South African provinces
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <Truck className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground">On orders over R500</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Nationwide</h3>
                  <p className="text-sm text-muted-foreground">All 9 SA provinces</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Fast Delivery</h3>
                  <p className="text-sm text-muted-foreground">1-5 business days</p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <Package className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Safe Packaging</h3>
                  <p className="text-sm text-muted-foreground">Plant-friendly boxes</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              {/* Shipping Rates */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Rates by Province</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {provinces.map((province) => (
                      <div key={province.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-semibold">{province.name}</h4>
                          <p className="text-sm text-muted-foreground">{province.time}</p>
                        </div>
                        <Badge variant="outline">{province.rate}</Badge>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Free shipping</strong> automatically applies to orders over R500 to any province!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Standard Delivery</h4>
                    <p className="text-muted-foreground">
                      Plants are carefully packaged and delivered to your door via our trusted courier partners.
                      Delivery times vary by province as shown above.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Collection (Johannesburg)</h4>
                    <p className="text-muted-foreground">
                      Save on shipping costs! Collect your order from our Johannesburg location.
                      We'll notify you when your order is ready for collection.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Packaging Info */}
              <Card>
                <CardHeader>
                  <CardTitle>How We Package Your Plants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Secure Pot Wrapping</h4>
                      <p className="text-muted-foreground">Each pot is wrapped to prevent soil spillage and protect roots.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Protective Boxing</h4>
                      <p className="text-muted-foreground">Plants are placed in specially designed boxes with cushioning.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Care Instructions</h4>
                      <p className="text-muted-foreground">Every order includes detailed care instructions for your new plants.</p>
                    </div>
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
