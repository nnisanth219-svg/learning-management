import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, SESSION_ROLE_COOKIE } from '@/lib/auth/constants';
import { verifySessionCookie } from '@/lib/auth/server';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const role = cookieStore.get(SESSION_ROLE_COOKIE)?.value;
  const user = await verifySessionCookie(sessionCookie);

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null, role: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: role === 'admin' || role === 'student' ? role : undefined,
    },
    role: role === 'admin' || role === 'student' ? role : null,
  });
}
