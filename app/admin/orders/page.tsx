// app/admin/orders/[id]/page.tsx - MISSING ORDER DETAILS PAGE
export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { UpdateOrderForm } from '@/components/admin/UpdateOrderForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface OrderDetailsPageProps {
  params: {
    id: string
  }
}

async function getOrder(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            }
          }
        }
      }
    })
    return order
  } catch (error) {
    console.error('Failed to fetch order:', error)
    return null
  }
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const order = await getOrder(params.id)

  if (!order) {
    notFound()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800'
      case 'PROCESSING': return 'bg-purple-100 text-purple-800'
      case 'SHIPPED': return 'bg-orange-100 text-orange-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'FAILED': return 'bg-red-100 text-red-800'
      case 'REFUNDED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Created on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                      {item.product.images[0] ? (
                        <img 
                          src={item.product.images[0].url} 
                          alt={item.productName}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs">No Image</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.productName}</h4>
                      <p className="text-sm text-muted-foreground">
                        SKU: {item.productSku || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Quantity: {item.quantity} × R{Number(item.price).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">R{Number(item.totalPrice).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Order Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R{Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span>R{Number(order.shippingCost).toFixed(2)}</span>
                </div>
                {Number(order.taxAmount) > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>R{Number(order.taxAmount).toFixed(2)}</span>
                  </div>
                )}
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span>-R{Number(order.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>R{Number(order.totalAmount).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer</label>
                  <p className="text-sm">{order.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm">{order.user.email}</p>
                </div>
                {order.shippingAddress && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Shipping Address</label>
                    <div className="text-sm">
                      <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                      {order.shippingAddress.company && <p>{order.shippingAddress.company}</p>}
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                      <p>{order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
                      <p>Phone: {order.shippingAddress.phone}</p>
                    </div>
                  </div>
                )}
                {order.customerNotes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Customer Notes</label>
                    <p className="text-sm">{order.customerNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Order Status & Actions */}
        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                <div className="mt-1">
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>

              {order.paymentMethod && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Method</label>
                  <p className="text-sm mt-1">{order.paymentMethod}</p>
                </div>
              )}

              {order.trackingNumber && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tracking Number</label>
                  <p className="text-sm mt-1 font-mono">{order.trackingNumber}</p>
                </div>
              )}

              {order.paidAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paid At</label>
                  <p className="text-sm mt-1">{new Date(order.paidAt).toLocaleString()}</p>
                </div>
              )}

              {order.shippedAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Shipped At</label>
                  <p className="text-sm mt-1">{new Date(order.shippedAt).toLocaleString()}</p>
                </div>
              )}

              {order.deliveredAt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Delivered At</label>
                  <p className="text-sm mt-1">{new Date(order.deliveredAt).toLocaleString()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Update Order */}
          <UpdateOrderForm order={order} />

          {/* Admin Notes */}
          {order.adminNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{order.adminNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}