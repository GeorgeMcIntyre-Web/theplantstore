
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Package, 
  ShoppingCart, 
  Users, 
  ClipboardList, 
  BarChart, 
  UserCog,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { prisma } from '@/lib/db'

// Import NextAuth configuration
async function getAuthOptions() {
  const { default: NextAuth } = await import('next-auth')
  const CredentialsProvider = (await import('next-auth/providers/credentials')).default
  const { PrismaAdapter } = await import('@next-auth/prisma-adapter')
  const bcrypt = await import('bcryptjs')

  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          })

          if (!user || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        }
      })
    ],
    session: {
      strategy: 'jwt' as const
    },
    callbacks: {
      async jwt({ token, user }: any) {
        if (user) {
          token.role = user.role
        }
        return token
      },
      async session({ session, token }: any) {
        if (session?.user) {
          session.user.id = token.sub
          session.user.role = token.role
        }
        return session
      }
    },
    pages: {
      signIn: '/auth/signin',
    }
  }
}

// Dashboard stats helper function
async function getDashboardStats() {
  try {
    const [
      totalProducts,
      totalOrders,
      totalCustomers,
      lowStockProducts,
      newOrders,
      todayRevenue
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({
        where: {
          isActive: true,
          stockQuantity: { lte: prisma.product.fields.lowStockThreshold }
        }
      }),
      prisma.order.count({
        where: {
          status: 'PENDING',
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.order.aggregate({
        where: {
          status: { in: ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        },
        _sum: { totalAmount: true }
      })
    ])

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      lowStockProducts,
      newOrders,
      todayRevenue: todayRevenue._sum.totalAmount || 0
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      lowStockProducts: 0,
      newOrders: 0,
      todayRevenue: 0
    }
  }
}

type DashboardCardProps = {
  title: string
  description: string
  icon: React.ElementType
  href: string
  stats?: string | number
  badge?: string
  allowedRoles: string[]
  userRole: string
}

function DashboardCard({ 
  title, 
  description, 
  icon: Icon, 
  href, 
  stats, 
  badge, 
  allowedRoles, 
  userRole 
}: DashboardCardProps) {
  // Check if user has permission to see this card
  if (!allowedRoles.includes(userRole)) {
    return null
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 hover:border-primary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-800">{title}</CardTitle>
        <Icon className="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
          {stats && (
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-slate-800">{stats}</span>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
          )}
          <Link href={href}>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Manage {title.split(' ')[0]}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function AdminDashboard() {
  // Get session for authentication
  const authOptions = await getAuthOptions()
  const session = await getServerSession(authOptions)

  // Check if user is authenticated
  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/admin')
  }

  // Check if user has admin role
  const userRole = (session.user as any).role
  const adminRoles = ['SUPER_ADMIN', 'PLANT_MANAGER', 'ORDER_MANAGER', 'VIEWER']
  
  if (!adminRoles.includes(userRole)) {
    redirect('/')
  }

  // Get dashboard statistics
  const stats = await getDashboardStats()

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">
            Welcome back, {session.user?.name || session.user?.email}
          </p>
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              {userRole.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Product Management */}
          <DashboardCard
            title="Product Management"
            description="Add, edit, and manage store products. Monitor inventory levels and product performance."
            icon={Package}
            href="/admin/products"
            stats={stats.totalProducts}
            badge="Active Products"
            allowedRoles={['SUPER_ADMIN', 'PLANT_MANAGER']}
            userRole={userRole}
          />

          {/* Order Management */}
          <DashboardCard
            title="Order Management"
            description="View and process customer orders. Track order status and manage fulfillment."
            icon={ShoppingCart}
            href="/admin/orders"
            stats={stats.newOrders}
            badge="New Orders"
            allowedRoles={['SUPER_ADMIN', 'ORDER_MANAGER']}
            userRole={userRole}
          />

          {/* Customer Management */}
          <DashboardCard
            title="Customer Management"
            description="View customer details and order history. Manage customer accounts and support."
            icon={Users}
            href="/admin/customers"
            stats={stats.totalCustomers}
            badge="Total Customers"
            allowedRoles={['SUPER_ADMIN', 'ORDER_MANAGER']}
            userRole={userRole}
          />

          {/* Inventory Overview */}
          <DashboardCard
            title="Inventory Overview"
            description="Monitor stock levels and manage inventory. Track low stock alerts and reorder points."
            icon={ClipboardList}
            href="/admin/inventory"
            stats={stats.lowStockProducts}
            badge={stats.lowStockProducts > 0 ? "Low Stock" : "Good Stock"}
            allowedRoles={['SUPER_ADMIN', 'PLANT_MANAGER']}
            userRole={userRole}
          />

          {/* Sales Analytics */}
          <DashboardCard
            title="Sales Analytics"
            description="Review sales reports and performance metrics. Analyze trends and revenue data."
            icon={BarChart}
            href="/admin/reports"
            stats={`R${stats.todayRevenue.toFixed(2)}`}
            badge="Today's Revenue"
            allowedRoles={['SUPER_ADMIN', 'VIEWER', 'ORDER_MANAGER', 'PLANT_MANAGER']}
            userRole={userRole}
          />

          {/* User Management - Super Admin Only */}
          <DashboardCard
            title="User Management"
            description="Manage admin user accounts and roles. Control access permissions and security settings."
            icon={UserCog}
            href="/admin/users"
            allowedRoles={['SUPER_ADMIN']}
            userRole={userRole}
          />

        </div>

        {/* Quick Stats Summary - Only for admins who can see multiple sections */}
        {['SUPER_ADMIN'].includes(userRole) && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Quick Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{stats.totalProducts}</div>
                <div className="text-sm text-slate-500">Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{stats.totalOrders}</div>
                <div className="text-sm text-slate-500">Total Orders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">{stats.totalCustomers}</div>
                <div className="text-sm text-slate-500">Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</div>
                <div className="text-sm text-slate-500">Low Stock</div>
              </div>
            </div>
            
            {stats.lowStockProducts > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-800">
                  {stats.lowStockProducts} product{stats.lowStockProducts > 1 ? 's' : ''} running low on stock
                </span>
              </div>
            )}
          </div>
        )}

      </main>

      <Footer />
    </div>
  )
}
