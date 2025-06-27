// app/api/admin/users/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Import NextAuth configuration to get session
async function getAuthOptions() {
  const { default: NextAuth } = await import('next-auth');
  const CredentialsProvider = (
    await import('next-auth/providers/credentials')
  ).default;
  const { PrismaAdapter } = await import('@next-auth/prisma-adapter');

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

    if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['SUPER_ADMIN', 'PLANT_MANAGER'],
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Admin user fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authOptions = await getAuthOptions();
    const session = await getServerSession(authOptions);

    if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Admin user creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error while creating user' },
      { status: 500 }
    );
  }
}