import { NextRequest, NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { createCourse, listAdminCourses } from '@/lib/firestore/courses';
import { apiError } from '@/lib/http/api-error';
import { courseInputSchema } from '@/lib/validation/courses';

export async function GET() {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;
  try {
    const courses = await listAdminCourses(session.workspaceOwnerId);
    return NextResponse.json({ courses });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load courses.', 500);
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

  const parsed = courseInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);
  }

  try {
    const course = await createCourse(session.workspaceOwnerId, parsed.data);
    return NextResponse.json({ course }, { status: 201 });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to create course.', 500);
  }
}
