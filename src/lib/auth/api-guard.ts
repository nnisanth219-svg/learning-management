import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, SESSION_ROLE_COOKIE } from '@/lib/auth/constants';
import type { SessionUser } from '@/lib/auth/session';
import { requireFirebaseAdmin, verifySessionCookie } from '@/lib/auth/server';
import { resolveWorkspaceOwnerId } from '@/lib/auth/workspace';
import { getStudentByAuthUid } from '@/lib/firestore/students';
import { apiError } from '@/lib/http/api-error';

export type AuthorizedSession = SessionUser & { workspaceOwnerId: string };

export async function requireApiSession(): Promise<SessionUser | Response> {
  try {
    requireFirebaseAdmin();
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Firebase is not configured.', 503);
  }
  const cookieStore = await cookies();
  const user = await verifySessionCookie(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!user) return apiError('Sign in required.', 401);
  const role = cookieStore.get(SESSION_ROLE_COOKIE)?.value;
  if (role === 'admin' || role === 'student') {
    user.role = role;
  }
  return user;
}

export async function requireAuthorizedSession(): Promise<AuthorizedSession | Response> {
  const session = await requireApiSession();
  if (session instanceof Response) return session;

  const cookieStore = await cookies();
  const role = cookieStore.get(SESSION_ROLE_COOKIE)?.value;
  if (role !== 'admin') {
    return apiError('Admin access required.', 403);
  }

  const ownerId = await resolveWorkspaceOwnerId();
  if (!ownerId) return apiError('Workspace not configured. Run demo bootstrap first.', 503);
  return { ...session, workspaceOwnerId: ownerId, role: 'admin' };
}

export async function requireStudentSession(): Promise<(SessionUser & { workspaceOwnerId: string; studentId: string }) | Response> {
  const session = await requireApiSession();
  if (session instanceof Response) return session;

  const cookieStore = await cookies();
  const role = cookieStore.get(SESSION_ROLE_COOKIE)?.value;
  if (role !== 'student') {
    return apiError('Student access required.', 403);
  }

  const workspaceOwnerId = await resolveWorkspaceOwnerId();
  if (!workspaceOwnerId) return apiError('Workspace not configured.', 503);
  const student = await getStudentByAuthUid(workspaceOwnerId, session.id);
  if (!student) return apiError('Student profile not found.', 403);
  if (student.status === 'inactive' || student.status === 'suspended') {
    return apiError('Your account is not active.', 403);
  }
  return {
    ...session,
    workspaceOwnerId,
    studentId: student.id,
    role: 'student',
    studentCode: student.studentCode,
  };
}

export function isApiGuardResponse(value: unknown): value is Response {
  return value instanceof Response;
}
