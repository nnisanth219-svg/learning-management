import type { DocumentData } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type { Student, StudentStatus } from '@/data/types';
import { STUDENTS } from '@/data/mock';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { generateStudentCode, listByOwner, OWNER_ID_FIELD, resolveRecordRef, timestampToIso } from '@/lib/firestore/helpers';

const TABLE = 'students';

function toStudent(id: string, data: DocumentData): Student {
  const d = data;
  return {
    id,
    studentCode: String(d.studentCode ?? ''),
    authUid: typeof d.authUid === 'string' ? d.authUid : undefined,
    name: String(d.name ?? ''),
    email: String(d.email ?? ''),
    phone: typeof d.phone === 'string' ? d.phone : undefined,
    qualification: typeof d.qualification === 'string' ? d.qualification : undefined,
    avatar: String(d.avatar ?? ''),
    status: (d.status as StudentStatus) ?? 'active',
    enrolledCourses: Number(d.enrolledCourses ?? 0),
    completedCourses: Number(d.completedCourses ?? 0),
    progress: Number(d.progress ?? 0),
    attendance: Number(d.attendance ?? 0),
    joinedAt: String(d.joinedAt ?? timestampToIso(d.createdAt)),
    lastActive: String(d.lastActive ?? 'Recently'),
    certificates: Number(d.certificates ?? 0),
    courseIds: Array.isArray(d.courseIds) ? (d.courseIds as string[]) : [],
  };
}

export async function listStudents(ownerId: string, filters?: { search?: string; courseId?: string; status?: StudentStatus }) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  let items = await listByOwner(TABLE, ownerId, toStudent);
  if (!items.length) items = STUDENTS.map((s) => ({ ...s, studentCode: s.id, courseIds: [] }));

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.studentCode ?? '').toLowerCase().includes(q),
    );
  }
  if (filters?.courseId) {
    items = items.filter((s) => s.courseIds?.includes(filters.courseId!));
  }
  if (filters?.status) {
    items = items.filter((s) => s.status === filters.status);
  }
  return items;
}

export async function getStudentByAuthUid(ownerId: string, authUid: string): Promise<Student | null> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const snap = await appCollection(db, TABLE)
    .where(OWNER_ID_FIELD, '==', ownerId)
    .where('authUid', '==', authUid)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return toStudent(doc.id, doc.data());
}

export async function getStudent(ownerId: string, id: string): Promise<Student | null> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const resolved = await resolveRecordRef(TABLE, id, ownerId);
  if (!resolved) return null;
  return toStudent(resolved.snap.id, resolved.snap.data()!);
}

export async function createAdminStudent(
  ownerId: string,
  params: {
    name: string;
    email: string;
    phone?: string;
    qualification?: string;
    status?: StudentStatus;
  },
): Promise<Student> {
  const db = getAdminFirestore();
  await ensureAppTables(db);

  const normalizedEmail = params.email.trim().toLowerCase();
  const existing = await listStudents(ownerId);
  if (existing.some((s) => s.email.toLowerCase() === normalizedEmail)) {
    throw new Error('A student with this email already exists.');
  }

  const studentCode = await generateStudentCode(ownerId);
  const now = FieldValue.serverTimestamp();
  const ref = appCollection(db, TABLE).doc();
  const today = new Date().toISOString().slice(0, 10);

  await ref.set({
    studentCode,
    name: params.name.trim(),
    email: normalizedEmail,
    phone: params.phone?.trim() ?? '',
    qualification: params.qualification?.trim() ?? '',
    avatar: '',
    status: params.status ?? 'active',
    enrolledCourses: 0,
    completedCourses: 0,
    progress: 0,
    attendance: 0,
    joinedAt: today,
    lastActive: today,
    certificates: 0,
    courseIds: [],
    [OWNER_ID_FIELD]: ownerId,
    createdAt: now,
    updatedAt: now,
  });

  const snap = await ref.get();
  return toStudent(snap.id, snap.data()!);
}

export async function createStudentFromEnrollment(
  ownerId: string,
  params: {
    authUid: string;
    name: string;
    email: string;
    phone: string;
    qualification: string;
    courseId: string;
  },
): Promise<Student> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const studentCode = await generateStudentCode(ownerId);
  const now = FieldValue.serverTimestamp();
  const ref = appCollection(db, TABLE).doc();
  const today = new Date().toISOString().slice(0, 10);

  await ref.set({
    studentCode,
    authUid: params.authUid,
    name: params.name,
    email: params.email,
    phone: params.phone,
    qualification: params.qualification,
    avatar: '',
    status: 'active',
    enrolledCourses: 1,
    completedCourses: 0,
    progress: 0,
    attendance: 0,
    joinedAt: today,
    lastActive: today,
    certificates: 0,
    courseIds: [params.courseId],
    [OWNER_ID_FIELD]: ownerId,
    createdAt: now,
    updatedAt: now,
  });

  const snap = await ref.get();
  return toStudent(snap.id, snap.data()!);
}

export async function updateStudentStatus(ownerId: string, id: string, status: StudentStatus) {
  const db = getAdminFirestore();
  const resolved = await resolveRecordRef(TABLE, id, ownerId);
  if (!resolved) return null;
  await resolved.ref.set({ status, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return getStudent(ownerId, id);
}

export async function addCourseToStudent(ownerId: string, studentId: string, courseId: string) {
  const student = await getStudent(ownerId, studentId);
  if (!student) return null;
  const courseIds = Array.from(new Set([...(student.courseIds ?? []), courseId]));
  const db = getAdminFirestore();
  await appCollection(db, TABLE).doc(studentId).set(
    { courseIds, enrolledCourses: courseIds.length, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  return getStudent(ownerId, studentId);
}

export async function seedStudentWithId(ownerId: string, id: string, data: Student) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const { id: _id, ...rest } = data;
  await appCollection(db, TABLE).doc(id).set(
    { ...rest, studentCode: rest.studentCode || `EV-STU-2025-${id}`, [OWNER_ID_FIELD]: ownerId, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
}
