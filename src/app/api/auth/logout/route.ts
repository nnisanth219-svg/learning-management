import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/auth/constants';
import { clearSessionCookie, verifySessionCookie } from '@/lib/auth/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const user = await verifySessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  return NextResponse.json({ authenticated: Boolean(user), user });
}
