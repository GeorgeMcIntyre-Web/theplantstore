// app/api/admin/customers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      (session.user.role !== 'SUPER_ADMIN' &&
        session.user.role !== 'PLANT_MANAGER')
    ) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const customers = await db.user.findMany({
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