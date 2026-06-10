import { NextRequest, NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { getStudent, updateStudentStatus } from '@/lib/firestore/students';
import { listStudentEnrollments } from '@/lib/firestore/enrollment-requests';
import { listProgress } from '@/lib/firestore/enrollments';
import { apiError } from '@/lib/http/api-error';
import { updateStudentStatusSchema } from '@/lib/validation/enrollment';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;
  const { id } = await context.params;

  const student = await getStudent(session.workspaceOwnerId, id);
  if (!student) return apiError('Student not found.', 404);

  const [enrollments, progress] = await Promise.all([
    listStudentEnrollments(session.workspaceOwnerId, id),
    listProgress(session.workspaceOwnerId, id),
  ]);

  return NextResponse.json({ student, enrollments, progress });
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

  const parsed = updateStudentStatusSchema.safeParse(body);
  if (!parsed.success) return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);

  const student = await updateStudentStatus(session.workspaceOwnerId, id, parsed.data.status);
  if (!student) return apiError('Student not found.', 404);
  return NextResponse.json({ student });
}
