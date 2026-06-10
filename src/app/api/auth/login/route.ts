import { NextRequest } from 'next/server';
import { mapAdminAuthError } from '@/lib/auth/errors';
import { signInWithEmailPassword } from '@/lib/auth/firebase-rest';
import { buildAuthResponse, requireFirebaseAuth, sessionUserFromToken } from '@/lib/auth/server';
import { resolveWorkspaceOwnerId } from '@/lib/auth/workspace';
import { isPlatformAdmin } from '@/lib/firestore/platform';
import { getStudentByAuthUid } from '@/lib/firestore/students';
import { apiError } from '@/lib/http/api-error';
import { loginSchema } from '@/lib/validation/auth';
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

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);

  try {
    const signIn = await signInWithEmailPassword(parsed.data.email, parsed.data.password);
    const decoded = await getAdminAuth().verifyIdToken(signIn.idToken);
    const ownerId = await resolveWorkspaceOwnerId();
    const email = decoded.email ?? parsed.data.email;
    const isAdmin = await isPlatformAdmin(decoded.uid, email);

    if (!isAdmin) {
      if (ownerId) {
        const student = await getStudentByAuthUid(ownerId, decoded.uid);
        if (student) {
          return apiError('This account is registered as a student. Please use the Student Login page.', 403);
        }
      }
      return apiError('You do not have admin access.', 403);
    }

    return buildAuthResponse(sessionUserFromToken(decoded, { role: 'admin' }), signIn.idToken, {
      rememberMe: parsed.data.rememberMe,
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : mapAdminAuthError(e), 401);
  }
}
