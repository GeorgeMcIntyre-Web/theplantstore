import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn(
        "flex items-center space-x-1 text-sm text-muted-foreground",
        className,
      )}
    >
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {index === items.length - 1 ? (
            <span className="text-foreground font-medium">{item.name}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
