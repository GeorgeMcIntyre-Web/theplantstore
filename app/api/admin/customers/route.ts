// app/api/admin/customers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// Import NextAuth configuration to get session
async function getAuthOptions() {
  const { default: NextAuth } = await import('next-auth');
  const CredentialsProvider = (
    await import('next-auth/providers/credentials')
  ).default;
  const { PrismaAdapter } = await import('@next-auth/prisma-adapter');
  const bcrypt = await import('bcryptjs');

  return {
    adapter: PrismaAdapter(prisma),
    providers: [
      CredentialsProvider({
        name: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user || !user.password) {
            return null;
          }
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        },
      }),
    ],
    session: {
      strategy: 'jwt' as const,
    },
    callbacks: {
      async jwt({ token, user }: any) {
        if (user) {
          token.role = user.role;
        }
        return token;
      },
      async session({ session, token }: any) {
        if (session?.user) {
          session.user.id = token.sub;
          session.user.role = token.role;
        }
        return session;
      },
    },
    pages: {
      signIn: '/auth/signin',
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);

    const userRole = (session?.user as any)?.role;
    if (userRole !== 'SUPER_ADMIN' && userRole !== 'PLANT_MANAGER') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const customers = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Admin customer fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching customers' },
      { status: 500 }
    );
  }
}