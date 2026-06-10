import { NextRequest, NextResponse } from 'next/server';
import { mapAdminAuthError } from '@/lib/auth/errors';
import { sendPasswordResetEmail } from '@/lib/auth/firebase-rest';
import { requireFirebaseAuth } from '@/lib/auth/server';
import { apiError } from '@/lib/http/api-error';
import { forgotPasswordSchema } from '@/lib/validation/auth';

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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);

  try {
    await sendPasswordResetEmail(parsed.data.email);
    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email, a reset link has been sent.',
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : mapAdminAuthError(e), 400);
  }
}
