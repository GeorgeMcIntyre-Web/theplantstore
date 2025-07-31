import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle large file uploads for import routes
  if (request.nextUrl.pathname.startsWith('/api/admin/import/')) {
    // Set headers for large file uploads
    const response = NextResponse.next();
    response.headers.set('max-body-size', '100mb');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/import/:path*',
  ],
}; 