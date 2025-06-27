// app/admin/page.tsx

import Link from 'next/link';
import {
  Activity,
  CreditCard,
  Package,
  Users,
  Warehouse,
  LineChart,
  ShieldAlert,
} from 'lucide-react';
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
// THIS IS THE CORRECTED IMPORT PATH
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function getAdminDashboardData() {
  try {
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
  } catch (error) {
    console.error("Failed to fetch admin dashboard data:", error);
    return {
      productCount: 0,
      orderCount: 0,
      customerCount: 0,
      totalRevenue: 0,
    }
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  const data = await getAdminDashboardData();
  const userRole = (session?.user as any)?.role;

  const dashboardCards = [
    {
      title: 'Product Management',
      description: 'Add, edit, and manage store products. Monitor inventory levels and product performance.',
      icon: <Package className="h-4 w-4 text-muted-foreground" />,
      link: '/admin/products',
      buttonText: 'Manage Product',
      value: data.productCount,
      show: ['SUPER_ADMIN', 'PLANT_MANAGER'],
    },
    {
      title: 'Order Management',
      description: 'View and process customer orders. Track order status and manage fulfillment.',
      icon: <CreditCard className="h-4 w-4 text-muted-foreground" />,
      link: '/admin/orders',
      buttonText: 'Manage Order',
      value: data.orderCount,
      show: ['SUPER_ADMIN', 'PLANT_MANAGER'],
    },
    // ... other cards remain the same ...
  ];

  const visibleCards = dashboardCards.filter(
    (card) => userRole && card.show.includes(userRole)
  );

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-auto items-center gap-4 border-b bg-muted/40 px-4 py-4 lg:h-[70px] lg:px-6">
        <div className="w-full flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {session?.user?.name || 'Admin'}
            {userRole && (
              <Badge variant="destructive" className="ml-2">
                {userRole}
              </Badge>
            )}
          </p>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        {visibleCards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* The mapping of cards remains the same */}
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
            <div className="flex flex-col items-center gap-1 text-center">
                <ShieldAlert className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-2xl font-bold tracking-tight">
                No Permissions
              </h3>
              <p className="text-sm text-muted-foreground">
                You do not have the required role to view any dashboard content. Your current role is: {userRole || 'Not Assigned'}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}