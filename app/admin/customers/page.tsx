// app/admin/customers/page.tsx

"use client";
// This line tells Next.js to render this page dynamically
export const dynamic = "force-dynamic";

import CustomerManagement from "@/components/admin/CustomerManagement";

export default function CustomersPage() {
  return <CustomerManagement />;
}
