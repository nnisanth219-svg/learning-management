import type { DocumentData } from 'firebase-admin/firestore';
import { FieldValue } from 'firebase-admin/firestore';
import type { PlatformUser } from '@/data/types';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { listByOwner, OWNER_ID_FIELD, timestampToIso } from '@/lib/firestore/helpers';

const TABLE = 'users';

function toPlatformUser(id: string, data: DocumentData): PlatformUser {
  const d = data;
  return {
    id,
    authUid: String(d.authUid ?? id),
    displayName: String(d.displayName ?? d.name ?? ''),
    email: String(d.email ?? ''),
    role: d.role === 'student' ? 'student' : 'admin',
    studentId: typeof d.studentId === 'string' ? d.studentId : undefined,
    studentCode: typeof d.studentCode === 'string' ? d.studentCode : undefined,
    lastLoginAt: timestampToIso(d.lastLoginAt ?? d.updatedAt),
    createdAt: timestampToIso(d.createdAt),
  };
}

export async function trackUserLogin(
  ownerId: string,
  user: {
    uid: string;
    email: string;
    name: string;
    role: PlatformUser['role'];
    studentId?: string;
    studentCode?: string;
  },
) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, TABLE).doc(user.uid);
  const existing = await ref.get();
  const now = FieldValue.serverTimestamp();

  await ref.set(
    {
      authUid: user.uid,
      displayName: user.name,
      email: user.email.trim().toLowerCase(),
      role: user.role,
      studentId: user.studentId ?? null,
      studentCode: user.studentCode ?? null,
      lastLoginAt: now,
      updatedAt: now,
      [OWNER_ID_FIELD]: ownerId,
      ...(existing.exists ? {} : { createdAt: now }),
    },
    { merge: true },
  );
}

export async function listPlatformUsers(ownerId: string): Promise<PlatformUser[]> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const items = await listByOwner(TABLE, ownerId, toPlatformUser);
  return items.sort((a, b) => b.lastLoginAt.localeCompare(a.lastLoginAt));
}
