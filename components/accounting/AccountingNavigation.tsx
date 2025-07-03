'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Calculator, 
  Receipt, 
  FileText, 
  BarChart3, 
  Banknote,
  Settings,
  History
} from 'lucide-react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin/accounting',
    icon: Calculator,
    description: 'Financial overview'
  },
  {
    name: 'Expenses',
    href: '/admin/accounting/expenses',
    icon: Receipt,
    description: 'Manage expenses'
  },
  {
    name: 'Categories',
    href: '/admin/accounting/categories',
    icon: FileText,
    description: 'Expense categories'
  },
  {
    name: 'Bank Feed',
    href: '/admin/accounting/bank-feed',
    icon: Banknote,
    description: 'Bank integration'
  },
  {
    name: 'Reports',
    href: '/admin/accounting/reports',
    icon: BarChart3,
    description: 'Financial reports'
  },
  {
    name: 'Audit Logs',
    href: '/admin/accounting/audit-logs',
    icon: History,
    description: 'Activity history'
  }
];

export const AccountingNavigation: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="flex space-x-1 mb-6">
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}; 