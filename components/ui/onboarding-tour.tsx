"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  SkipForward,
  CheckCircle,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for highlighting
  position?: "top" | "bottom" | "left" | "right";
  action?: string;
  tips?: string[];
}

interface OnboardingTourProps {
  steps: TourStep[];
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  userRole?: string;
  className?: string;
}

export function OnboardingTour({
  steps,
  isOpen,
  onClose,
  onComplete,
  userRole,
  className
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const progress = ((currentStep + 1) / steps.length) * 100;

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isPlaying, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      setCompletedSteps(prev => new Set(Array.from(prev).concat([steps[currentStep].id])));
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className={cn("w-full max-w-2xl", className)}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">
                Welcome to The Plant Store Admin
              </CardTitle>
              {userRole && (
                <Badge variant="secondary" className="ml-2">
                  {userRole.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center gap-1 mt-3">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepClick(index)}
                className={cn(
                  "w-3 h-3 rounded-full transition-colors",
                  index === currentStep
                    ? "bg-blue-600"
                    : completedSteps.has(step.id)
                    ? "bg-green-500"
                    : "bg-gray-300 hover:bg-gray-400"
                )}
                title={`Step ${index + 1}: ${step.title}`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Current Step Content */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              {currentStepData.title}
              {completedSteps.has(currentStepData.id) && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
            </h3>
            
            <p className="text-muted-foreground mb-4 leading-relaxed">
              {currentStepData.content}
            </p>

            {currentStepData.tips && currentStepData.tips.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-blue-900 mb-2">💡 Quick Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {currentStepData.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentStepData.action && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-medium text-green-900 mb-1">🎯 Action Required:</h4>
                <p className="text-sm text-green-800">{currentStepData.action}</p>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Auto-play
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip Tour
              </Button>
              
              <Button
                onClick={handleNext}
                className="min-w-[100px]"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Predefined tours for different user roles
export const AdminTours = {
  SUPER_ADMIN: [
    {
      id: "dashboard-overview",
      title: "Dashboard Overview",
      content: "Welcome to your admin dashboard! This is your command center for managing The Plant Store. You'll see key metrics, recent activity, and quick access to all features.",
      tips: [
        "Check the analytics charts for business insights",
        "Use the date range picker to view different periods",
        "Monitor system health and user activity"
      ]
    },
    {
      id: "user-management",
      title: "User Management",
      content: "As a Super Admin, you can create and manage all user accounts. Set appropriate roles and permissions for each team member.",
      action: "Go to Users tab and review existing accounts",
      tips: [
        "Create accounts for new team members",
        "Set appropriate roles (Plant Manager, Order Manager, etc.)",
        "Monitor user activity and access"
      ]
    },
    {
      id: "system-settings",
      title: "System Configuration",
      content: "Configure global settings for your store including categories, suppliers, shipping rates, and system preferences.",
      action: "Visit Settings to configure your store",
      tips: [
        "Set up product categories",
        "Add supplier information",
        "Configure shipping rates by province"
      ]
    },
    {
      id: "financial-oversight",
      title: "Financial Oversight",
      content: "Monitor all financial activities including revenue, expenses, and financial reports. Ensure proper VAT compliance.",
      action: "Review the Accounting section",
      tips: [
        "Monitor daily revenue and expenses",
        "Review expense approvals",
        "Generate financial reports"
      ]
    }
  ],
  
  PLANT_MANAGER: [
    {
      id: "product-catalog",
      title: "Product Catalog",
      content: "Manage your plant catalog efficiently. Add new products, update inventory, and ensure quality product information.",
      action: "Go to Products tab to view your catalog",
      tips: [
        "Upload 4-6 high-quality product images",
        "Write compelling descriptions with care instructions",
        "Set accurate pricing and stock levels"
      ]
    },
    {
      id: "inventory-control",
      title: "Inventory Management",
      content: "Monitor stock levels and manage inventory efficiently. Set up alerts for low stock items.",
      action: "Check Low Stock items in Products",
      tips: [
        "Monitor stock levels daily",
        "Set up automatic low stock alerts",
        "Create purchase orders when needed"
      ]
    },
    {
      id: "supplier-management",
      title: "Supplier Relations",
      content: "Manage supplier relationships and track performance. Monitor delivery times and maintain supplier information.",
      action: "Review Suppliers section",
      tips: [
        "Maintain supplier contact information",
        "Track supplier performance",
        "Monitor delivery times"
      ]
    }
  ],

  ORDER_MANAGER: [
    {
      id: "order-processing",
      title: "Order Processing",
      content: "Process customer orders efficiently. Review order details, check inventory, and update order status.",
      action: "Go to Orders tab to view pending orders",
      tips: [
        "Review order details and customer information",
        "Check inventory availability before processing",
        "Update order status promptly"
      ]
    },
    {
      id: "customer-service",
      title: "Customer Service",
      content: "Provide excellent customer support. Handle inquiries, process returns, and maintain customer satisfaction.",
      action: "Review Customers section",
      tips: [
        "Respond to inquiries within 2 hours",
        "Handle order modifications and returns",
        "Follow up on delivery issues"
      ]
    },
    {
      id: "shipping-management",
      title: "Shipping Management",
      content: "Coordinate shipping and tracking. Generate shipping labels and update customers on delivery status.",
      action: "Check Shipping section",
      tips: [
        "Generate shipping labels",
        "Update tracking numbers",
        "Monitor delivery status"
      ]
    }
  ],

  FINANCIAL_MANAGER: [
    {
      id: "financial-dashboard",
      title: "Financial Dashboard",
      content: "Monitor your store's financial health. Track revenue, expenses, and key financial metrics.",
      action: "Review the Accounting dashboard",
      tips: [
        "Monitor daily revenue and expenses",
        "Track profit margins and trends",
        "Review VAT liability"
      ]
    },
    {
      id: "expense-approval",
      title: "Expense Approval",
      content: "Review and approve expense requests. Ensure proper documentation and budget compliance.",
      action: "Check Pending Approvals",
      tips: [
        "Review expense details and documentation",
        "Check budget availability",
        "Approve or reject with comments"
      ]
    },
    {
      id: "financial-reporting",
      title: "Financial Reporting",
      content: "Generate and analyze financial reports. Track trends and ensure compliance.",
      action: "Generate a financial report",
      tips: [
        "Create monthly financial statements",
        "Analyze expense trends",
        "Prepare VAT returns"
      ]
    }
  ]
}; 