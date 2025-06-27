// app/admin/users/page.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { prisma } from '@/lib/db'; // Corrected: changed db to prisma
import { Badge } from '@/components/ui/badge';

async function getUsers() {
  return prisma.user.findMany({ // Corrected: changed db to prisma
    where: {
      role: {
        not: 'CUSTOMER',
      },
    },
    orderBy: {
      role: 'asc',
    },
  });
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold">Admin Users</h1>
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
                <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}