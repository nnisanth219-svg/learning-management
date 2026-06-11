import { NextRequest, NextResponse } from 'next/server';
import { mapAdminAuthError } from '@/lib/auth/errors';
import { signInWithEmailPassword } from '@/lib/auth/firebase-rest';
import { buildAuthResponse, requireFirebaseAuth, sessionUserFromToken } from '@/lib/auth/server';
import { resolveWorkspaceOwnerId } from '@/lib/auth/workspace';
import { recordLoginSession } from '@/lib/auth/track-login';
import { getStudentByAuthUid } from '@/lib/firestore/students';
import { apiError } from '@/lib/http/api-error';
import { studentLoginSchema } from '@/lib/validation/enrollment';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    requireFirebaseAuth();
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Firebase is not configured.', 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body.', 400);
  }

  const parsed = studentLoginSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);

  const ownerId = await resolveWorkspaceOwnerId();
  if (!ownerId) return apiError('Platform is not ready.', 503);

  try {
    const signIn = await signInWithEmailPassword(parsed.data.email, parsed.data.password);
    const decoded = await getAdminAuth().verifyIdToken(signIn.idToken);
    const student = await getStudentByAuthUid(ownerId, decoded.uid);
    if (!student) return apiError('No student account found for this email.', 403);

    const user = sessionUserFromToken(decoded, {
      role: 'student',
      studentId: student.id,
      studentCode: student.studentCode,
    });
    await recordLoginSession(decoded, 'student', {
      workspaceOwnerId: ownerId,
      studentId: student.id,
      studentCode: student.studentCode,
    });
    return buildAuthResponse(user, signIn.idToken, { rememberMe: parsed.data.rememberMe });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : mapAdminAuthError(e), 401);
  }
}
