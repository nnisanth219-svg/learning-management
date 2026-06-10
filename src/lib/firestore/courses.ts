import type { DocumentData } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type { Course, CourseStatus, Difficulty } from '@/data/types';
import { COURSES } from '@/data/mock';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { listByOwner, OWNER_ID_FIELD, resolveRecordRef, timestampToIso } from '@/lib/firestore/helpers';
import { resolveWorkspaceOwnerId } from '@/lib/auth/workspace';
import type { CourseInput, CourseUpdate } from '@/lib/validation/courses';
import { getCourseImage } from '@/lib/images';

const TABLE = 'courses';

function toCourse(id: string, data: DocumentData): Course {
  const d = data;
  return {
    id,
    title: String(d.title ?? ''),
    description: String(d.description ?? ''),
    category: String(d.category ?? ''),
    instructor: String(d.instructor ?? ''),
    instructorAvatar: String(d.instructorAvatar ?? ''),
    image: String(d.image ?? ''),
    duration: String(d.duration ?? ''),
    difficulty: (d.difficulty as Difficulty) ?? 'Beginner',
    rating: Number(d.rating ?? 0),
    reviews: Number(d.reviews ?? 0),
    enrollments: Number(d.enrollments ?? 0),
    price: Number(d.price ?? 0),
    modules: Number(d.modules ?? 0),
    lessons: Number(d.lessons ?? 0),
    status: (d.status as CourseStatus) ?? 'draft',
    featured: Boolean(d.featured),
    trainerId: typeof d.trainerId === 'string' ? d.trainerId : undefined,
  };
}

export async function listPublishedCourses(): Promise<Course[]> {
  if (!isFirebaseConfigured()) {
    return COURSES.filter((c) => c.status === 'published');
  }
  const ownerId = await resolveWorkspaceOwnerId();
  if (!ownerId) return COURSES.filter((c) => c.status === 'published');

  const db = getAdminFirestore();
  await ensureAppTables(db);
  const items = await listByOwner(TABLE, ownerId, toCourse);
  const published = items.filter((c) => c.status === 'published');
  return published.length ? published : COURSES.filter((c) => c.status === 'published');
}

export async function getPublishedCourse(courseId: string): Promise<Course | null> {
  const courses = await listPublishedCourses();
  return courses.find((c) => c.id === courseId) ?? null;
}

export async function listAdminCourses(ownerId: string): Promise<Course[]> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const items = await listByOwner(TABLE, ownerId, toCourse);
  return items.length ? items : COURSES;
}

export async function getAdminCourse(ownerId: string, courseId: string): Promise<Course | null> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const resolved = await resolveRecordRef(TABLE, courseId, ownerId);
  if (!resolved) {
    const fallback = COURSES.find((c) => c.id === courseId);
    return fallback ?? null;
  }
  return toCourse(resolved.snap.id, resolved.snap.data()!);
}

function normalizeCourseInput(input: CourseInput | CourseUpdate, category?: string) {
  return {
    ...input,
    image: input.image || (category ? getCourseImage(category) : getCourseImage('Technology')),
    instructorAvatar: input.instructorAvatar ?? '',
    rating: input.rating ?? 0,
    reviews: input.reviews ?? 0,
    enrollments: input.enrollments ?? 0,
    modules: input.modules ?? 0,
    lessons: input.lessons ?? 0,
    featured: input.featured ?? false,
  };
}

export async function createCourse(ownerId: string, input: CourseInput): Promise<Course> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, TABLE).doc();
  const now = FieldValue.serverTimestamp();
  await ref.set({
    ...normalizeCourseInput(input, input.category),
    [OWNER_ID_FIELD]: ownerId,
    createdAt: now,
    updatedAt: now,
  });
  return toCourse(ref.id, (await ref.get()).data()!);
}

export async function updateCourse(ownerId: string, courseId: string, input: CourseUpdate): Promise<Course | null> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const resolved = await resolveRecordRef(TABLE, courseId, ownerId);
  if (!resolved) return null;
  await resolved.ref.set(
    { ...input, updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
  return getAdminCourse(ownerId, resolved.snap.id);
}

export async function deleteCourse(ownerId: string, courseId: string): Promise<boolean> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const resolved = await resolveRecordRef(TABLE, courseId, ownerId);
  if (!resolved) return false;
  await resolved.ref.delete();
  return true;
}

export async function seedCourseWithId(ownerId: string, id: string, data: Omit<Course, 'id'>) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const now = FieldValue.serverTimestamp();
  await appCollection(db, TABLE).doc(id).set({ ...data, [OWNER_ID_FIELD]: ownerId, createdAt: now, updatedAt: now }, { merge: true });
}
