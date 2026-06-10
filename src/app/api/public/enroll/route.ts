import { NextRequest, NextResponse } from 'next/server';
import { requireFirebaseAdmin } from '@/lib/auth/server';
import { resolveWorkspaceOwnerId } from '@/lib/auth/workspace';
import { createEnrollmentRequest } from '@/lib/firestore/enrollment-requests';
import { apiError } from '@/lib/http/api-error';
import { isFirebaseConfigured } from '@/lib/firebase/admin';
import { enrollSchema } from '@/lib/validation/enrollment';

export async function POST(request: NextRequest) {
  if (!isFirebaseConfigured()) {
    return apiError('Enrollment is unavailable. Firebase is not configured.', 503);
  }
  try {
    requireFirebaseAdmin();
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Firebase is not configured.', 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body.', 400);
  }

  const parsed = enrollSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);
  }

  const ownerId = await resolveWorkspaceOwnerId();
  if (!ownerId) {
    return apiError('Platform is not ready. Admin must run demo bootstrap first.', 503);
  }

  try {
    const enrollment = await createEnrollmentRequest(ownerId, parsed.data);
    return NextResponse.json(
      { success: true, enrollmentId: enrollment.id, enrollment },
      { status: 201 },
    );
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Enrollment failed.', 500);
  }
}
