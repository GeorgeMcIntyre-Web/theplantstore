// app/api/admin/orders/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Admin order fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error while fetching order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const { status, trackingNumber } = body;

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        trackingNumber,
      },
    });

    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Admin order update error:', error);
    return NextResponse.json(
      { error: 'Internal server error while updating order' },
      { status: 500 }
    );
  }
}