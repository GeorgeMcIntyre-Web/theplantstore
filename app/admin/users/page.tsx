// app/admin/users/page.tsx

// This line tells Next.js to render this page dynamically
export const dynamic = "force-dynamic";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

async function getUsers() {
  return prisma.user.findMany({
    where: {
      role: {
        not: "CUSTOMER",
      },
    },
    orderBy: {
      role: "asc",
    },
  });
}

export default async function UsersPage() {
  const router = useRouter();
  const users = await getUsers();

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Admin Users</h1>
      <div className="mt-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.role}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
