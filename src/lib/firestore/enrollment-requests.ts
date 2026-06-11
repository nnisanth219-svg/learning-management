import type { DocumentData } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type { EnrollmentRequest, EnrollmentStatus } from '@/data/types';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { listByOwner, OWNER_ID_FIELD, timestampToIso } from '@/lib/firestore/helpers';
import { createProgressFromEnrollment } from '@/lib/firestore/enrollments';
import { addCourseToStudent } from '@/lib/firestore/students';
import { createNotification } from '@/lib/firestore/notifications';
import type { EnrollInput } from '@/lib/validation/enrollment';
import { getPublishedCourse } from '@/lib/firestore/courses';

const TABLE = 'enrollment_requests';

function toEnrollment(id: string, data: DocumentData): EnrollmentRequest {
  const d = data;
  return {
    id,
    studentId: typeof d.studentId === 'string' ? d.studentId : undefined,
    studentCode: typeof d.studentCode === 'string' ? d.studentCode : undefined,
    authUid: typeof d.authUid === 'string' ? d.authUid : undefined,
    courseId: String(d.courseId ?? ''),
    courseName: String(d.courseName ?? ''),
    fullName: String(d.fullName ?? ''),
    email: String(d.email ?? ''),
    phone: String(d.phone ?? ''),
    qualification: String(d.qualification ?? ''),
    notes: typeof d.notes === 'string' ? d.notes : undefined,
    status: (d.status as EnrollmentStatus) ?? 'new',
    createdAt: timestampToIso(d.createdAt),
    updatedAt: timestampToIso(d.updatedAt),
    approvedBy: typeof d.approvedBy === 'string' ? d.approvedBy : undefined,
    approvedAt: typeof d.approvedAt === 'string' ? d.approvedAt : undefined,
    rejectedBy: typeof d.rejectedBy === 'string' ? d.rejectedBy : undefined,
    rejectedAt: typeof d.rejectedAt === 'string' ? d.rejectedAt : undefined,
  };
}

export async function findOpenEnrollmentByEmailAndCourse(ownerId: string, email: string, courseId: string) {
  const items = await listEnrollmentRequests(ownerId);
  return (
    items.find(
      (e) =>
        e.email.toLowerCase() === email.toLowerCase() &&
        e.courseId === courseId &&
        (e.status === 'new' || e.status === 'pending'),
    ) ?? null
  );
}

export async function createEnrollmentRequest(ownerId: string, input: EnrollInput): Promise<EnrollmentRequest> {
  const course = await getPublishedCourse(input.courseId);
  if (!course) throw new Error('Selected course is not available.');

  const existing = await findOpenEnrollmentByEmailAndCourse(ownerId, input.email, input.courseId);
  if (existing) return existing;
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const now = FieldValue.serverTimestamp();
  const ref = appCollection(db, TABLE).doc();

  await ref.set({
    ...input,
    courseName: course.title,
    status: 'new',
    [OWNER_ID_FIELD]: ownerId,
    createdAt: now,
    updatedAt: now,
  });

  await createNotification(ownerId, {
    title: 'New Enrollment Application',
    message: `${input.fullName} applied for ${course.title}.`,
    type: 'enrollment',
  });

  return toEnrollment(ref.id, (await ref.get()).data()!);
}

export async function listEnrollmentRequests(ownerId: string, status?: EnrollmentStatus) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  let items = await listByOwner(TABLE, ownerId, toEnrollment);
  if (status) items = items.filter((e) => e.status === status);
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getEnrollmentRequest(ownerId: string, id: string) {
  const db = getAdminFirestore();
  const snap = await appCollection(db, TABLE).doc(id).get();
  if (!snap.exists || snap.data()?.[OWNER_ID_FIELD] !== ownerId) return null;
  return toEnrollment(snap.id, snap.data()!);
}

export async function linkEnrollmentToStudent(
  ownerId: string,
  enrollmentId: string,
  params: { studentId: string; studentCode: string; authUid: string },
) {
  const db = getAdminFirestore();
  const ref = appCollection(db, TABLE).doc(enrollmentId);
  await ref.set(
    {
      studentId: params.studentId,
      studentCode: params.studentCode,
      authUid: params.authUid,
      status: 'pending',
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return getEnrollmentRequest(ownerId, enrollmentId);
}

export async function updateEnrollmentStatus(
  ownerId: string,
  id: string,
  status: EnrollmentStatus,
  reviewer?: { name: string },
) {
  const enrollment = await getEnrollmentRequest(ownerId, id);
  if (!enrollment) return null;

  const db = getAdminFirestore();
  const now = new Date().toISOString();
  const reviewFields =
    status === 'approved' && reviewer
      ? { approvedBy: reviewer.name, approvedAt: now, rejectedBy: FieldValue.delete(), rejectedAt: FieldValue.delete() }
      : status === 'rejected' && reviewer
        ? { rejectedBy: reviewer.name, rejectedAt: now }
        : {};

  await appCollection(db, TABLE).doc(id).set(
    { status, updatedAt: FieldValue.serverTimestamp(), ...reviewFields },
    { merge: true },
  );

  if (status === 'approved' && enrollment.studentId) {
    await addCourseToStudent(ownerId, enrollment.studentId, enrollment.courseId);
    const course = await getPublishedCourse(enrollment.courseId);
    await createProgressFromEnrollment(ownerId, {
      studentId: enrollment.studentId,
      studentName: enrollment.fullName,
      courseId: enrollment.courseId,
      courseName: enrollment.courseName,
      totalLessons: course?.lessons ?? 0,
    });
  }

  return getEnrollmentRequest(ownerId, id);
}

export async function seedEnrollmentRequestWithId(
  ownerId: string,
  id: string,
  data: Omit<EnrollmentRequest, 'id'>,
) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const now = FieldValue.serverTimestamp();
  await appCollection(db, TABLE).doc(id).set(
    {
      ...data,
      [OWNER_ID_FIELD]: ownerId,
      createdAt: data.createdAt ? data.createdAt : now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function listStudentEnrollments(ownerId: string, studentId: string) {
  const items = await listEnrollmentRequests(ownerId);
  return items.filter((e) => e.studentId === studentId);
}

export async function listStudentEnrollmentsByEmail(ownerId: string, email: string) {
  const items = await listEnrollmentRequests(ownerId);
  return items.filter((e) => e.email.toLowerCase() === email.toLowerCase());
}
