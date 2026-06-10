import { FieldValue } from 'firebase-admin/firestore';
import type { IssuedCertificate, LearningProgress } from '@/data/types';
import { LEARNING_PROGRESS } from '@/data/mock';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { listByOwner, OWNER_ID_FIELD, timestampToIso } from '@/lib/firestore/helpers';
import type { DocumentData } from 'firebase-admin/firestore';

const TABLE = 'enrollments';
const CERT_TABLE = 'certificates';

function toProgress(id: string, data: DocumentData): LearningProgress {
  const d = data;
  return {
    id,
    studentId: typeof d.studentId === 'string' ? d.studentId : undefined,
    courseId: typeof d.courseId === 'string' ? d.courseId : undefined,
    studentName: String(d.studentName ?? ''),
    studentAvatar: String(d.studentAvatar ?? ''),
    courseName: String(d.courseName ?? ''),
    progress: Number(d.progress ?? 0),
    completedLessons: Number(d.completedLessons ?? 0),
    totalLessons: Number(d.totalLessons ?? 0),
    lastActivity: String(d.lastActivity ?? 'Recently'),
    performance: Number(d.performance ?? 0),
    enrollmentStatus: d.enrollmentStatus as LearningProgress['enrollmentStatus'],
  };
}

function toCertificate(id: string, data: DocumentData): IssuedCertificate {
  const d = data;
  return {
    id,
    publicCode: String(d.publicCode ?? '').toUpperCase(),
    holderName: String(d.holderName ?? ''),
    programTitle: String(d.programTitle ?? ''),
    studentId: typeof d.studentId === 'string' ? d.studentId : undefined,
    courseId: typeof d.courseId === 'string' ? d.courseId : undefined,
    issuedAt: String(d.issuedAt ?? ''),
    status: (d.status as IssuedCertificate['status']) ?? 'active',
  };
}

export async function createProgressFromEnrollment(
  ownerId: string,
  params: {
    studentId: string;
    studentName: string;
    courseId: string;
    courseName: string;
    totalLessons: number;
  },
) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const now = FieldValue.serverTimestamp();
  await appCollection(db, TABLE).doc().set({
    studentId: params.studentId,
    studentName: params.studentName,
    studentAvatar: '',
    courseId: params.courseId,
    courseName: params.courseName,
    progress: 0,
    completedLessons: 0,
    totalLessons: params.totalLessons,
    lastActivity: 'Just enrolled',
    performance: 0,
    enrollmentStatus: 'approved',
    [OWNER_ID_FIELD]: ownerId,
    createdAt: now,
    updatedAt: now,
  });
}

export async function listProgress(ownerId: string, studentId?: string) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  let items = await listByOwner(TABLE, ownerId, toProgress);
  if (!items.length) items = LEARNING_PROGRESS;
  if (studentId) items = items.filter((p) => p.studentId === studentId);
  return items;
}

export async function listStudentCertificates(ownerId: string, studentId: string) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const snap = await appCollection(db, CERT_TABLE)
    .where(OWNER_ID_FIELD, '==', ownerId)
    .where('studentId', '==', studentId)
    .get();
  return snap.docs.map((doc) => toCertificate(doc.id, doc.data()));
}

export async function listIssuedCertificates(ownerId: string) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const snap = await appCollection(db, CERT_TABLE).where(OWNER_ID_FIELD, '==', ownerId).get();
  return snap.docs.map((doc) => toCertificate(doc.id, doc.data()));
}

export async function verifyCertificateByCode(ownerId: string, code: string) {
  const db = getAdminFirestore();
  const snap = await appCollection(db, CERT_TABLE)
    .where(OWNER_ID_FIELD, '==', ownerId)
    .where('publicCode', '==', code.trim().toUpperCase())
    .limit(1)
    .get();
  if (snap.empty) return null;
  const cert = toCertificate(snap.docs[0].id, snap.docs[0].data());
  return cert.status === 'active' ? cert : null;
}

export async function seedCertificate(ownerId: string, id: string, data: IssuedCertificate) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, CERT_TABLE).doc(id).set(
    { ...data, publicCode: data.publicCode.toUpperCase(), [OWNER_ID_FIELD]: ownerId, createdAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
}
