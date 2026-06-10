import type { DecodedIdToken } from 'firebase-admin/auth';
import { NextResponse } from 'next/server';

import {
  ID_TOKEN_COOKIE_MAX_AGE_SEC,
  REMEMBER_ME_MAX_AGE_SEC,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
  SESSION_MAX_AGE_SEC,
  SESSION_ROLE_COOKIE,
} from '@/lib/auth/constants';
import type { SessionUser } from '@/lib/auth/session';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';

export function requireFirebaseAdmin() {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Set FIREBASE_CREDENTIALS in .env.');
  }
}

export function requireFirebaseAuth() {
  requireFirebaseAdmin();
}

export function sessionUserFromToken(decoded: DecodedIdToken, extra?: Partial<SessionUser>): SessionUser {
  return {
    id: decoded.uid,
    name: decoded.name || decoded.email?.split('@')[0] || 'User',
    email: decoded.email ?? '',
    ...extra,
  };
}

export async function createSessionCookie(idToken: string): Promise<string> {
  return getAdminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

export function attachSessionCookie(response: NextResponse, sessionCookie: string, maxAgeSec = SESSION_MAX_AGE_SEC) {
  response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: maxAgeSec,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export function attachRoleCookie(response: NextResponse, role: 'admin' | 'student', maxAgeSec = SESSION_MAX_AGE_SEC) {
  response.cookies.set(SESSION_ROLE_COOKIE, role, {
    maxAge: maxAgeSec,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE_NAME, '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
  response.cookies.set(SESSION_ROLE_COOKIE, '', {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function verifySessionCookie(sessionCookie: string | undefined): Promise<SessionUser | null> {
  if (!sessionCookie || !isFirebaseConfigured()) return null;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(sessionCookie, true);
    return sessionUserFromToken(decoded);
  } catch {
    try {
      const decoded = await getAdminAuth().verifyIdToken(sessionCookie, true);
      return sessionUserFromToken(decoded);
    } catch {
      return null;
    }
  }
}

export async function buildAuthResponse(user: SessionUser, idToken: string, options?: { rememberMe?: boolean }) {
  let cookieValue: string;
  let maxAgeSec = options?.rememberMe ? REMEMBER_ME_MAX_AGE_SEC : SESSION_MAX_AGE_SEC;
  try {
    cookieValue = await createSessionCookie(idToken);
  } catch {
    cookieValue = idToken;
    maxAgeSec = ID_TOKEN_COOKIE_MAX_AGE_SEC;
  }
  const response = NextResponse.json({ user });
  attachSessionCookie(response, cookieValue, maxAgeSec);
  if (user.role) attachRoleCookie(response, user.role, maxAgeSec);
  return response;
}
