import { NextResponse } from 'next/server';
import { isApiGuardResponse, requireStudentSession } from '@/lib/auth/api-guard';
import { listPublishedCourses } from '@/lib/firestore/courses';
import { listStudentEnrollments } from '@/lib/firestore/enrollment-requests';
import { listProgress, listStudentCertificates } from '@/lib/firestore/enrollments';
import { getStudent } from '@/lib/firestore/students';
import { apiError } from '@/lib/http/api-error';

export async function GET() {
  const session = await requireStudentSession();
  if (isApiGuardResponse(session)) return session;

  try {
    const [student, enrollments, progress, certificates, allCourses] = await Promise.all([
      getStudent(session.workspaceOwnerId, session.studentId),
      listStudentEnrollments(session.workspaceOwnerId, session.studentId),
      listProgress(session.workspaceOwnerId, session.studentId),
      listStudentCertificates(session.workspaceOwnerId, session.studentId),
      listPublishedCourses(),
    ]);

    if (!student) return apiError('Student not found.', 404);

    const courseIds = new Set(student.courseIds ?? []);
    const courses = allCourses.filter((c) => courseIds.has(c.id) || enrollments.some((e) => e.courseId === c.id && e.status === 'approved'));

    return NextResponse.json({
      profile: {
        id: student.id,
        studentCode: student.studentCode,
        name: student.name,
        email: student.email,
        phone: student.phone,
        qualification: student.qualification,
        status: student.status,
        joinedAt: student.joinedAt,
      },
      enrollments,
      courses,
      progress,
      certificates,
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load dashboard.', 500);
  }
}
