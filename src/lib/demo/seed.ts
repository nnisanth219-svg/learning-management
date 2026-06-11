import {
  COURSES,
  LEARNING_PROGRESS,
  NOTIFICATIONS,
  STUDENTS,
  TRAINERS,
} from '@/data/mock';
import type { EnrollmentRequest, IssuedCertificate } from '@/data/types';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';
import { ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { seedCourseWithId } from '@/lib/firestore/courses';
import { seedEnrollmentRequestWithId } from '@/lib/firestore/enrollment-requests';
import { seedCertificate, seedProgressWithId } from '@/lib/firestore/enrollments';
import { ownerRecordExists } from '@/lib/firestore/helpers';
import { seedNotificationWithId } from '@/lib/firestore/notifications';
import { ensurePlatformSettings } from '@/lib/firestore/platform';
import { seedStudentWithId } from '@/lib/firestore/students';
import { seedTrainerWithId } from '@/lib/firestore/trainers';
import { DEMO_USER } from './credentials';

const SAMPLE_CERTIFICATES: IssuedCertificate[] = [
  {
    id: 'cert-1',
    publicCode: 'EV-2025-A1B2C',
    holderName: 'Carol Davis',
    programTitle: 'Executive Leadership Certificate',
    studentId: '3',
    issuedAt: '2025-05-20',
    status: 'active',
  },
  {
    id: 'cert-2',
    publicCode: 'EV-2025-D4E5F',
    holderName: 'Alice Johnson',
    programTitle: 'Full-Stack Web Development Masterclass',
    studentId: '1',
    issuedAt: '2025-04-12',
    status: 'active',
  },
];

const SAMPLE_ENROLLMENT_REQUESTS: EnrollmentRequest[] = [
  {
    id: 'enr-1',
    studentId: '1',
    studentCode: 'EV-STU-2025-00001',
    courseId: '1',
    courseName: COURSES[0].title,
    fullName: 'Alice Johnson',
    email: 'alice@email.com',
    phone: '+1 (555) 101-0001',
    qualification: "Bachelor's Degree",
    status: 'pending',
    createdAt: '2025-06-08T10:00:00.000Z',
  },
  {
    id: 'enr-2',
    courseId: '2',
    courseName: COURSES[1].title,
    fullName: 'Nina Patel',
    email: 'nina.patel@email.com',
    phone: '+1 (555) 101-0002',
    qualification: "Master's Degree",
    status: 'new',
    createdAt: '2025-06-09T08:30:00.000Z',
  },
  {
    id: 'enr-3',
    studentId: '3',
    studentCode: 'EV-STU-2025-00003',
    courseId: '3',
    courseName: COURSES[2].title,
    fullName: 'Carol Davis',
    email: 'carol@email.com',
    phone: '+1 (555) 101-0003',
    qualification: 'Professional Certification',
    status: 'approved',
    createdAt: '2025-05-15T14:00:00.000Z',
    approvedBy: DEMO_USER.name,
    approvedAt: '2025-05-16T09:00:00.000Z',
  },
];

export async function ensureDemoAuthUser() {
  const auth = getAdminAuth();
  try {
    const existing = await auth.getUserByEmail(DEMO_USER.email);
    await auth.updateUser(existing.uid, {
      displayName: DEMO_USER.name,
      password: DEMO_USER.password,
      emailVerified: true,
    });
    return existing.uid;
  } catch {
    const created = await auth.createUser({
      email: DEMO_USER.email,
      password: DEMO_USER.password,
      displayName: DEMO_USER.name,
      emailVerified: true,
    });
    return created.uid;
  }
}

/** Restore any missing professional/demo sample records for a workspace owner. */
export async function ensureSampleDataSeeded(
  ownerId: string,
  profile?: { email?: string; name?: string },
): Promise<{ ok: boolean; restored: string[]; message?: string }> {
  if (!isFirebaseConfigured()) {
    return { ok: false, restored: [], message: 'Firebase is not configured.' };
  }

  const db = getAdminFirestore();
  await ensureAppTables(db);
  await ensurePlatformSettings(ownerId, profile);

  const restored: string[] = [];

  for (const course of COURSES) {
    const { id, ...data } = course;
    if (!(await ownerRecordExists('courses', ownerId, id))) {
      await seedCourseWithId(ownerId, id, data);
      restored.push(`course:${id}`);
    }
  }

  for (const trainer of TRAINERS) {
    const { id, ...data } = trainer;
    if (!(await ownerRecordExists('trainers', ownerId, id))) {
      await seedTrainerWithId(ownerId, id, data);
      restored.push(`trainer:${id}`);
    }
  }

  for (const student of STUDENTS) {
    if (!(await ownerRecordExists('students', ownerId, student.id))) {
      await seedStudentWithId(ownerId, student.id, {
        ...student,
        studentCode: `EV-STU-2025-${student.id.padStart(5, '0')}`,
        courseIds: student.id === '1' ? ['1'] : student.id === '3' ? ['3'] : [],
      });
      restored.push(`student:${student.id}`);
    }
  }

  for (const cert of SAMPLE_CERTIFICATES) {
    if (!(await ownerRecordExists('certificates', ownerId, cert.id))) {
      await seedCertificate(ownerId, cert.id, cert);
      restored.push(`certificate:${cert.id}`);
    }
  }

  for (const progress of LEARNING_PROGRESS) {
    if (!(await ownerRecordExists('enrollments', ownerId, progress.id))) {
      await seedProgressWithId(ownerId, progress.id, progress);
      restored.push(`progress:${progress.id}`);
    }
  }

  for (const enrollment of SAMPLE_ENROLLMENT_REQUESTS) {
    const { id, ...data } = enrollment;
    if (!(await ownerRecordExists('enrollment_requests', ownerId, id))) {
      await seedEnrollmentRequestWithId(ownerId, id, data);
      restored.push(`enrollment_request:${id}`);
    }
  }

  for (const notification of NOTIFICATIONS) {
    if (!(await ownerRecordExists('notifications', ownerId, notification.id))) {
      await seedNotificationWithId(ownerId, notification.id, notification);
      restored.push(`notification:${notification.id}`);
    }
  }

  return { ok: true, restored };
}

/** Demo bootstrap: ensure auth user + restore any missing sample data. */
export async function seedDemoData() {
  const ownerId = await ensureDemoAuthUser();
  const result = await ensureSampleDataSeeded(ownerId, {
    email: DEMO_USER.email,
    name: DEMO_USER.name,
  });
  if (!result.ok) return { ok: false as const, message: result.message ?? 'Demo setup failed.' };
  return { ok: true as const, ownerId, restored: result.restored };
}

/** Run after any admin login or session restore. */
export async function ensureAdminSampleData(
  ownerId: string,
  profile?: { email?: string; name?: string },
) {
  return ensureSampleDataSeeded(ownerId, profile);
}
