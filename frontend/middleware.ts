import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DASHBOARD_PREFIX = [
  '/analytics',
  '/hub',
  '/notifications',
  '/payments',
  '/rider',
  '/shipments',
  '/admin',
  '/agent',
  '/finance',
  '/support',
  '/merchant',
  '/pickups',
  '/users',
  '/audit',
  '/sla',
  '/tracking',
  '/settings',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboardRoute =
    pathname === '/dashboard' ||
    DASHBOARD_PREFIX.some((p) => pathname.startsWith(p));

  if (isDashboardRoute) {
    // Auth state lives in localStorage — check a lightweight "logged-in" cookie
    // set by the auth service on login (non-httpOnly so JS can write it).
    const loggedIn = request.cookies.get('fastx_logged_in')?.value;

    if (!loggedIn) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  const response = NextResponse.next();

  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|track).*)',
  ],
};
