import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Redirect /dashboard to /analytics
  if (request.nextUrl.pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/analytics', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/dashboard',
}; 