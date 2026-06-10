import { COURSES, STUDENTS } from '@/data/mock';
import { getAdminAuth, isFirebaseConfigured } from '@/lib/firebase/admin';
import { seedCourseWithId } from '@/lib/firestore/courses';
import { seedCertificate } from '@/lib/firestore/enrollments';
import { seedStudentWithId } from '@/lib/firestore/students';
import { DEMO_USER } from './credentials';

export async function ensureDemoAuthUser() {
  const auth = getAdminAuth();
  try {
    const existing = await auth.getUserByEmail(DEMO_USER.email);
    await auth.updateUser(existing.uid, { displayName: DEMO_USER.name, password: DEMO_USER.password, emailVerified: true });
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

export async function seedDemoData() {
  if (!isFirebaseConfigured()) {
    return { ok: false, message: 'Firebase is not configured.' };
  }
  const ownerId = await ensureDemoAuthUser();
  for (const course of COURSES) {
    const { id, ...data } = course;
    await seedCourseWithId(ownerId, id, data);
  }
  for (const student of STUDENTS) {
    await seedStudentWithId(ownerId, student.id, { ...student, studentCode: `EV-STU-2025-${student.id.padStart(5, '0')}`, courseIds: [] });
  }
  await seedCertificate(ownerId, 'cert-1', {
    id: 'cert-1',
    publicCode: 'EV-2025-A1B2C',
    holderName: 'Carol Davis',
    programTitle: 'Executive Leadership Certificate',
    studentId: '3',
    issuedAt: '2025-05-20',
    status: 'active',
  });
  return { ok: true, ownerId };
}
