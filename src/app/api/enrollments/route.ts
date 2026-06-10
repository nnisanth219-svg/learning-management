import { NextRequest, NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { listEnrollmentRequests } from '@/lib/firestore/enrollment-requests';
import { apiError } from '@/lib/http/api-error';
import type { EnrollmentStatus } from '@/data/types';

export async function GET(request: NextRequest) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  const status = request.nextUrl.searchParams.get('status') as EnrollmentStatus | null;
  try {
    const enrollments = await listEnrollmentRequests(
      session.workspaceOwnerId,
      status ?? undefined,
    );
    return NextResponse.json({ enrollments });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load enrollments.', 500);
  }
}

export async function PATCH(request: NextRequest) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;
  return apiError('Use PATCH /api/enrollments/[id] to update status.', 405);
}
