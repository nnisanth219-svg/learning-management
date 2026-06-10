import { NextRequest, NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { deleteCourse, getAdminCourse, updateCourse } from '@/lib/firestore/courses';
import { apiError } from '@/lib/http/api-error';
import { courseUpdateSchema } from '@/lib/validation/courses';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  const { id } = await context.params;
  const course = await getAdminCourse(session.workspaceOwnerId, id);
  if (!course) return apiError('Course not found.', 404);
  return NextResponse.json({ course });
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

  const parsed = courseUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);
  }

  try {
    const course = await updateCourse(session.workspaceOwnerId, id, parsed.data);
    if (!course) return apiError('Course not found.', 404);
    return NextResponse.json({ course });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to update course.', 500);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  const { id } = await context.params;
  try {
    const ok = await deleteCourse(session.workspaceOwnerId, id);
    if (!ok) return apiError('Course not found.', 404);
    return NextResponse.json({ success: true });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to delete course.', 500);
  }
}
