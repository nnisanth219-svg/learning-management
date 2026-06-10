import { NextRequest, NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { createAdminStudent, listStudents } from '@/lib/firestore/students';
import { apiError } from '@/lib/http/api-error';
import { createStudentSchema } from '@/lib/validation/people';
import type { StudentStatus } from '@/data/types';

export async function GET(request: NextRequest) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  const search = request.nextUrl.searchParams.get('search') ?? undefined;
  const courseId = request.nextUrl.searchParams.get('courseId') ?? undefined;
  const status = request.nextUrl.searchParams.get('status') as StudentStatus | undefined;

  try {
    const students = await listStudents(session.workspaceOwnerId, { search, courseId, status });
    return NextResponse.json({ students });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load students.', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body.', 400);
  }

  const parsed = createStudentSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);
  }

  try {
    const student = await createAdminStudent(session.workspaceOwnerId, parsed.data);
    return NextResponse.json({ student }, { status: 201 });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to create student.', 500);
  }
}

export async function PATCH() {
  return apiError('Use PATCH /api/students/[id] to update a student.', 405);
}
