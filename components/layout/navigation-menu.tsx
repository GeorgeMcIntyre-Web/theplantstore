"use client";

import Link from "next/link";
import {
  NavigationMenu as NavMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

const categories = [
  {
    title: "Indoor Plants",
    href: "/collections/indoor-plants",
    description: "Beautiful houseplants perfect for any indoor space",
    subcategories: [
      {
        name: "Foliage Plants",
        href: "/collections/indoor-plants?filter=foliage",
      },
      {
        name: "Flowering Plants",
        href: "/collections/indoor-plants?filter=flowering",
      },
      {
        name: "Air Purifying",
        href: "/collections/indoor-plants?filter=air-purifying",
      },
    ],
  },
  {
    title: "Outdoor Plants",
    href: "/collections/outdoor-plants",
    description: "Hardy plants for your garden and outdoor spaces",
    subcategories: [
      {
        name: "Garden Plants",
        href: "/collections/outdoor-plants?filter=garden",
      },
      {
        name: "Trees & Shrubs",
        href: "/collections/outdoor-plants?filter=trees",
      },
      {
        name: "Herbs & Vegetables",
        href: "/collections/outdoor-plants?filter=herbs",
      },
    ],
  },
  {
    title: "Succulents",
    href: "/collections/succulents",
    description: "Low-maintenance plants perfect for beginners",
    subcategories: [
      { name: "Aloe Varieties", href: "/collections/succulents?filter=aloe" },
      { name: "Cacti", href: "/collections/succulents?filter=cacti" },
      { name: "Jade Plants", href: "/collections/succulents?filter=jade" },
    ],
  },
  {
    title: "Accessories",
    href: "/collections/accessories",
    description: "Everything you need to care for your plants",
    subcategories: [
      { name: "Pots & Planters", href: "/collections/accessories?filter=pots" },
      { name: "Tools", href: "/collections/accessories?filter=tools" },
      {
        name: "Soil & Fertilizers",
        href: "/collections/accessories?filter=soil",
      },
    ],
  },
];

export function NavigationMenu() {
  return (
    <NavMenu>
      <NavigationMenuList>
        {categories.map((category) => (
          <NavigationMenuItem key={category.title}>
            <NavigationMenuTrigger>{category.title}</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <Link
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href={category.href}
                    >
                      <div className="mb-2 mt-4 text-lg font-medium">
                        {category.title}
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        {category.description}
                      </p>
                    </Link>
                  </NavigationMenuLink>
                </li>
                {category.subcategories.map((sub) => (
                  <ListItem key={sub.name} title={sub.name} href={sub.href} />
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        ))}

        <NavigationMenuItem>
          <Link href="/plant-care" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Plant Care
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavMenu>
  );
}

const ListItem = forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { title: string; href: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
