import { NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { listIssuedCertificates } from '@/lib/firestore/enrollments';
import { apiError } from '@/lib/http/api-error';

export async function GET() {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  try {
    const certificates = await listIssuedCertificates(session.workspaceOwnerId);
    return NextResponse.json({ certificates });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load certificates.', 500);
  }
}
