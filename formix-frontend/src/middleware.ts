import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/forms', '/settings'];
const authRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/confirm-email', '/check-email'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/forms', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
