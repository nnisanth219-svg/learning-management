import type { DocumentData } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type { Trainer } from '@/data/types';
import { TRAINERS } from '@/data/mock';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { listByOwner, OWNER_ID_FIELD } from '@/lib/firestore/helpers';

const TABLE = 'trainers';

function toTrainer(id: string, data: DocumentData): Trainer {
  const d = data;
  return {
    id,
    name: String(d.name ?? ''),
    title: String(d.title ?? ''),
    bio: String(d.bio ?? ''),
    photo: String(d.photo ?? ''),
    experience: String(d.experience ?? ''),
    courses: Number(d.courses ?? 0),
    students: Number(d.students ?? 0),
    rating: Number(d.rating ?? 0),
    skills: Array.isArray(d.skills) ? (d.skills as string[]) : [],
    certifications: Array.isArray(d.certifications) ? (d.certifications as string[]) : [],
    social: (d.social as Trainer['social']) ?? {},
    availability: (d.availability as Trainer['availability']) ?? 'available',
  };
}

export async function listTrainers(ownerId: string): Promise<Trainer[]> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const items = await listByOwner(TABLE, ownerId, toTrainer);
  return items.length ? items : TRAINERS;
}

export async function createTrainer(
  ownerId: string,
  input: {
    name: string;
    title: string;
    bio: string;
    photo?: string;
    experience: string;
    skills?: string[];
    availability: Trainer['availability'];
  },
): Promise<Trainer> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, TABLE).doc();
  const now = FieldValue.serverTimestamp();

  await ref.set({
    name: input.name.trim(),
    title: input.title.trim(),
    bio: input.bio.trim(),
    photo: input.photo ?? TRAINERS[0]?.photo ?? '',
    experience: input.experience.trim(),
    courses: 0,
    students: 0,
    rating: 0,
    skills: input.skills ?? [],
    certifications: [],
    social: {},
    availability: input.availability,
    [OWNER_ID_FIELD]: ownerId,
    createdAt: now,
    updatedAt: now,
  });

  const snap = await ref.get();
  return toTrainer(snap.id, snap.data()!);
}

export async function seedTrainerWithId(ownerId: string, id: string, data: Omit<Trainer, 'id'>) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, TABLE).doc(id).set(
    { ...data, [OWNER_ID_FIELD]: ownerId, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() },
    { merge: true },
  );
}
