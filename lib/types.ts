export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number | null;
  sku?: string | null;
  stockQuantity: number;
  lowStockThreshold: number;
  weight?: number | null;
  dimensions?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  careLevel?: "EASY" | "MODERATE" | "ADVANCED" | null;
  lightRequirement?: "LOW" | "MEDIUM" | "BRIGHT" | "DIRECT_SUN" | null;
  wateringFrequency?: "WEEKLY" | "BI_WEEKLY" | "MONTHLY" | null;
  isPetSafe?: boolean | null;
  plantSize?: "SMALL" | "MEDIUM" | "LARGE" | null;
  growthRate?: "SLOW" | "MODERATE" | "FAST" | null;
  careInstructions?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  reviews: Review[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  parent?: Category;
  children: Category[];
  products: Product[];
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText?: string | null;
  sortOrder: number;
  isPrimary: boolean;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  emailVerified?: Date;
  image?: string;
  password?: string;
  role:
    | "CUSTOMER"
    | "SUPER_ADMIN"
    | "PLANT_MANAGER"
    | "ORDER_MANAGER"
    | "VIEWER";
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  company?: string;
  vatNumber?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  province: Province;
  postalCode: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type Province =
  | "GAUTENG"
  | "WESTERN_CAPE"
  | "KWAZULU_NATAL"
  | "EASTERN_CAPE"
  | "LIMPOPO"
  | "MPUMALANGA"
  | "NORTH_WEST"
  | "NORTHERN_CAPE"
  | "FREE_STATE";

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingMethod: ShippingMethod;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  shippingAddressId?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  paymentReference?: string;
  paidAt?: Date;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  shippingAddress?: Address;
  items: OrderItem[];
}

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentMethod = "YOCO" | "EFT" | "PAYJUSTNOW";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type ShippingMethod = "STANDARD" | "COLLECTION_JHB";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  totalPrice: number;
  productName: string;
  productSku?: string;
  product: Product;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

export interface ShippingRate {
  id: string;
  province: Province;
  rate: number;
  freeThreshold?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactForm {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

// Utility types
export interface CartItemWithProduct extends CartItem {
  product: Product & {
    images: ProductImage[];
  };
}

export interface ProductFilters {
  category?: string;
  careLevel?: string[];
  lightRequirement?: string[];
  isPetSafe?: boolean;
  plantSize?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  sortBy?: "name" | "price" | "created" | "popular";
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
