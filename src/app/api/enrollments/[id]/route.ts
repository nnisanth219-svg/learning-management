import { NextRequest, NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { getEnrollmentRequest, updateEnrollmentStatus } from '@/lib/firestore/enrollment-requests';
import { apiError } from '@/lib/http/api-error';
import { updateEnrollmentSchema } from '@/lib/validation/enrollment';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;
  const { id } = await context.params;
  const enrollment = await getEnrollmentRequest(session.workspaceOwnerId, id);
  if (!enrollment) return apiError('Enrollment not found.', 404);
  return NextResponse.json({ enrollment });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body.', 400);
  }

  const parsed = updateEnrollmentSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);

  try {
    const enrollment = await updateEnrollmentStatus(session.workspaceOwnerId, id, parsed.data.status, {
      name: session.name || session.email,
    });
    if (!enrollment) return apiError('Enrollment not found.', 404);
    return NextResponse.json({ enrollment });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to update enrollment.', 500);
  }
}
