// app/admin/page.tsx

import Link from 'next/link';
import {
  Activity,
  CreditCard,
  Package,
  Users,
  Warehouse,
  LineChart,
} from 'lucide-react';
// Import OrderStatus directly from the generated Prisma client package
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/db';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getServerSession } from 'next-auth';

// This tells Next.js to render the page dynamically at request time
export const dynamic = 'force-dynamic';

async function getAdminDashboardData() {
  const [productCount, orderCount, customerCount, totalRevenue] =
    await Promise.all([
      prisma.product.count(),
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.order.aggregate({
        _sum: {
          totalAmount: true,
        },
        where: {
          // THIS IS THE CORRECTED LINE - Using the correct enum value
          status: OrderStatus.DELIVERED,
        },
      }),
    ]);

  return {
    productCount,
    orderCount,
    customerCount,
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
  };
}

export default async function AdminDashboard() {
  const session = await getServerSession();
  const data = await getAdminDashboardData();
  const userRole = (session?.user as any)?.role;

  const dashboardCards = [
    {
      title: 'Product Management',
      description:
        'Add, edit, and manage store products. Monitor inventory levels and product performance.',
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      link: '/admin/products',
      buttonText: 'Manage Product',
      value: data.productCount,
      show: ['SUPER_ADMIN', 'PLANT_MANAGER'],
    },
    {
      title: 'Order Management',
      description:
        'View and process customer orders. Track order status and manage fulfillment.',
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
      link: '/admin/orders',
      buttonText: 'Manage Order',
      value: data.orderCount,
      show: ['SUPER_ADMIN', 'PLANT_MANAGER'],
    },
    {
      title: 'Customer Management',
      description:
        'View customer details and order history. Manage customer accounts and support.',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      link: '/admin/customers',
      buttonText: 'Manage Customer',
      value: data.customerCount,
      show: ['SUPER_ADMIN', 'PLANT_MANAGER'],
    },
    {
      title: 'Inventory Overview',
      description:
        'Monitor stock levels and manage inventory. Track low stock alerts and reorder points.',
      icon: <Warehouse className="h-4 w-4 text-muted-foreground" />,
      link: '/admin/products',
      buttonText: 'Manage Inventory',
      value: data.productCount, // Inventory is tied to products
      show: ['SUPER_ADMIN', 'PLANT_MANAGER'],
    },
    {
      title: 'Sales Analytics',
      description:
        'Review sales reports and performance metrics. Analyze trends and revenue data.',
      icon: <LineChart className="h-4 w-4 text-muted-foreground" />,
      link: '/admin/sales', // Assuming a future sales page
      buttonText: 'Manage Sales',
      value: `R${data.totalRevenue.toFixed(2)}`,
      subtext: "Today's Revenue",
      show: ['SUPER_ADMIN'],
    },
    {
      title: 'User Management',
      description:
        'Manage admin user accounts and roles. Control access permissions and security settings.',
      icon: <Activity className="h-4 w-4 text-muted-foreground" />,
      link: '/admin/users',
      buttonText: 'Manage User',
      show: ['SUPER_ADMIN'],
    },
  ];

  const visibleCards = dashboardCards.filter(
    (card) => userRole && card.show.includes(userRole)
  );

  return (
    <div className="flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
        <div className="w-full flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session?.user?.name}
            {userRole && (
              <Badge variant="outline" className="ml-2">
                {userRole}
              </Badge>
            )}
          </p>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                {card.icon}
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">
                  {card.description}
                </CardDescription>
                <div className="text-2xl font-bold mt-2">{card.value}</div>
                {card.subtext && (
                  <p className="text-xs text-muted-foreground">
                    {card.subtext}
                  </p>
                )}
                <Button className="mt-4 w-full" asChild>
                  <Link href={card.link}>{card.buttonText}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}