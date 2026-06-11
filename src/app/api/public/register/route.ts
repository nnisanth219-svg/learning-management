import { NextRequest } from 'next/server';
import { isEmailAlreadyExistsError, mapAdminAuthError } from '@/lib/auth/errors';
import { signInWithEmailPassword, signUpWithEmailPassword } from '@/lib/auth/firebase-rest';
import { buildAuthResponse, requireFirebaseAuth, sessionUserFromToken } from '@/lib/auth/server';
import { resolveWorkspaceOwnerId } from '@/lib/auth/workspace';
import { recordLoginSession } from '@/lib/auth/track-login';
import type { EnrollmentRequest } from '@/data/types';
import { getEnrollmentRequest, linkEnrollmentToStudent } from '@/lib/firestore/enrollment-requests';
import { createStudentFromEnrollment, getStudentByAuthUid } from '@/lib/firestore/students';
import { apiError } from '@/lib/http/api-error';
import { registerSchema } from '@/lib/validation/enrollment';
import { getAdminAuth } from '@/lib/firebase/admin';

async function authenticateStudent(
  email: string,
  password: string,
  displayName: string,
) {
  try {
    return await signUpWithEmailPassword(email, password, displayName);
  } catch (error) {
    if (!isEmailAlreadyExistsError(error)) throw error;
    try {
      return await signInWithEmailPassword(email, password);
    } catch {
      throw new Error(
        'An account with this email already exists. Sign in with your existing password, or use Forgot Password.',
      );
    }
  }
}

async function completeRegistration(
  ownerId: string,
  enrollment: EnrollmentRequest,
  password: string,
) {
  const signIn = await authenticateStudent(enrollment.email, password, enrollment.fullName);
  const decoded = await getAdminAuth().verifyIdToken(signIn.idToken);

  if (decoded.email?.toLowerCase() !== enrollment.email.toLowerCase()) {
    throw new Error('Email mismatch for this enrollment application.');
  }

  let student = await getStudentByAuthUid(ownerId, decoded.uid);
  if (!student) {
    student = await createStudentFromEnrollment(ownerId, {
      authUid: decoded.uid,
      name: enrollment.fullName,
      email: enrollment.email,
      phone: enrollment.phone,
      qualification: enrollment.qualification,
      courseId: enrollment.courseId,
    });
  }

  if (!enrollment.studentId || !enrollment.authUid) {
    await linkEnrollmentToStudent(ownerId, enrollment.id, {
      studentId: student.id,
      studentCode: student.studentCode!,
      authUid: decoded.uid,
    });
  }

  await recordLoginSession(decoded, 'student', {
    workspaceOwnerId: ownerId,
    studentId: student.id,
    studentCode: student.studentCode!,
  });

  const user = sessionUserFromToken(decoded, {
    role: 'student',
    studentId: student.id,
    studentCode: student.studentCode!,
  });

  return { user, idToken: signIn.idToken };
}

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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);
  }

  const ownerId = await resolveWorkspaceOwnerId();
  if (!ownerId) return apiError('Platform is not ready.', 503);

  const enrollment = await getEnrollmentRequest(ownerId, parsed.data.enrollmentId);
  if (!enrollment) return apiError('Enrollment application not found.', 404);
  if (enrollment.authUid && enrollment.studentId && enrollment.status !== 'new') {
    return apiError('This enrollment is already registered.', 409);
  }

  try {
    const { user, idToken } = await completeRegistration(ownerId, enrollment, parsed.data.password);
    return buildAuthResponse(user, idToken);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : mapAdminAuthError(e), 400);
  }
}
