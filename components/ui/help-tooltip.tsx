"use client";

import * as React from "react";
import { HelpCircle, X } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
  variant?: "default" | "info" | "warning" | "success";
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function HelpTooltip({
  content,
  title,
  position = "top",
  className,
  variant = "default",
  showIcon = true,
  children
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const variantStyles = {
    default: "bg-popover text-popover-foreground",
    info: "bg-blue-50 text-blue-900 border-blue-200",
    warning: "bg-yellow-50 text-yellow-900 border-yellow-200",
    success: "bg-green-50 text-green-900 border-green-200"
  };

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          {children || (
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-4 w-4 p-0", className)}
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(!isOpen);
              }}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent
          side={position}
          className={cn(
            "max-w-sm p-4 border shadow-lg",
            variantStyles[variant]
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              {title && (
                <div className="font-semibold mb-2">{title}</div>
              )}
              <div className="text-sm leading-relaxed">
                {content}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 ml-2"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Predefined help content for common admin actions
export const AdminHelpContent = {
  products: {
    title: "Product Management",
    content: (
      <div>
        <p className="mb-2">Manage your product catalog efficiently:</p>
        <ul className="text-xs space-y-1">
          <li>• Upload 4-6 high-quality images (800x800px minimum)</li>
          <li>• Write compelling descriptions with care instructions</li>
          <li>• Set accurate pricing and stock levels</li>
          <li>• Monitor low stock alerts daily</li>
        </ul>
      </div>
    )
  },
  orders: {
    title: "Order Processing",
    content: (
      <div>
        <p className="mb-2">Process orders efficiently:</p>
        <ul className="text-xs space-y-1">
          <li>• Review order details and customer information</li>
          <li>• Check inventory availability before processing</li>
          <li>• Update order status promptly</li>
          <li>• Send tracking information to customers</li>
        </ul>
      </div>
    )
  },
  accounting: {
    title: "Financial Management",
    content: (
      <div>
        <p className="mb-2">Manage finances and expenses:</p>
        <ul className="text-xs space-y-1">
          <li>• Review and approve expense requests</li>
          <li>• Monitor budget vs actual spending</li>
          <li>• Track VAT liability (15% rate)</li>
          <li>• Generate financial reports regularly</li>
        </ul>
      </div>
    )
  },
  customers: {
    title: "Customer Service",
    content: (
      <div>
        <p className="mb-2">Provide excellent customer support:</p>
        <ul className="text-xs space-y-1">
          <li>• Respond to inquiries within 2 hours</li>
          <li>• Handle order modifications and returns</li>
          <li>• Maintain customer satisfaction</li>
          <li>• Follow up on delivery issues</li>
        </ul>
      </div>
    )
  }
}; 