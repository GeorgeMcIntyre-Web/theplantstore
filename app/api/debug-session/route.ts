import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'No session found' }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: session.user?.id,
      name: session.user?.name,
      email: session.user?.email,
    },
    session: session,
  });
} 