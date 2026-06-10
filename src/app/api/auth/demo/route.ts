import { NextResponse } from 'next/server';
import { mapAdminAuthError } from '@/lib/auth/errors';
import { signInWithEmailPassword } from '@/lib/auth/firebase-rest';
import { buildAuthResponse, requireFirebaseAuth, sessionUserFromToken } from '@/lib/auth/server';
import { clearWorkspaceOwnerCache } from '@/lib/auth/workspace';
import { seedDemoData } from '@/lib/demo/seed';
import { DEMO_USER } from '@/lib/demo/credentials';
import { apiError } from '@/lib/http/api-error';
import { getAdminAuth } from '@/lib/firebase/admin';

export async function POST() {
  try {
    requireFirebaseAuth();
    clearWorkspaceOwnerCache();
    const result = await seedDemoData();
    if (!result.ok) return apiError(result.message ?? 'Demo setup failed.', 503);
    const signIn = await signInWithEmailPassword(DEMO_USER.email, DEMO_USER.password);
    const decoded = await getAdminAuth().verifyIdToken(signIn.idToken);
    return buildAuthResponse(sessionUserFromToken(decoded, { role: 'admin' }), signIn.idToken);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : mapAdminAuthError(e), 500);
  }
}
