import type { DecodedIdToken } from 'firebase-admin/auth';
import { resolveWorkspaceOwnerId } from '@/lib/auth/workspace';
import { trackUserLogin } from '@/lib/firestore/users';

export async function recordLoginSession(
  decoded: DecodedIdToken,
  role: 'admin' | 'student',
  extra?: { studentId?: string; studentCode?: string; workspaceOwnerId?: string },
) {
  const workspaceOwnerId =
    extra?.workspaceOwnerId ?? (await resolveWorkspaceOwnerId()) ?? decoded.uid;

  await trackUserLogin(workspaceOwnerId, {
    uid: decoded.uid,
    email: decoded.email ?? '',
    name: decoded.name || decoded.email?.split('@')[0] || 'User',
    role,
    studentId: extra?.studentId,
    studentCode: extra?.studentCode,
  });
}
