import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, SESSION_ROLE_COOKIE } from '@/lib/auth/constants';
import { verifySessionCookie } from '@/lib/auth/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const session = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const role = request.cookies.get(SESSION_ROLE_COOKIE)?.value;

  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    if (role === 'student') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith('/student')) {
    if (pathname === '/student/login') {
      return NextResponse.redirect(new URL('/user/login', request.url));
    }
    if (!session) {
      return NextResponse.redirect(new URL('/user/login', request.url));
    }
    if (role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/login' || pathname === '/register' || pathname === '/forgot-password') {
    if (session && role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if (session && role === 'student') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    return NextResponse.next();
  }

  if (pathname === '/user/login' || pathname === '/user/forgot-password') {
    if (session && role === 'student') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    if (session && role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/student/:path*',
    '/login',
    '/register',
    '/forgot-password',
    '/user/login',
    '/user/forgot-password',
  ],
};
