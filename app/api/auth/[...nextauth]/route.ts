// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
// Import the centralized authOptions from our new file
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };