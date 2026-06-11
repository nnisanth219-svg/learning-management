import { FieldValue } from 'firebase-admin/firestore';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { DEMO_USER } from '@/lib/demo/credentials';

const TABLE = 'app_settings';
const PLATFORM_DOC = 'platform';

export type PlatformSettings = {
  ownerId: string;
  ownerEmail: string;
  ownerName: string;
};

export async function getPlatformSettings(): Promise<PlatformSettings | null> {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const snap = await appCollection(db, TABLE).doc(PLATFORM_DOC).get();
  if (!snap.exists) return null;
  const d = snap.data()!;
  if (typeof d.ownerId !== 'string') return null;
  return {
    ownerId: d.ownerId,
    ownerEmail: String(d.ownerEmail ?? ''),
    ownerName: String(d.ownerName ?? ''),
  };
}

export async function ensurePlatformSettings(
  ownerId: string,
  profile?: { email?: string; name?: string },
) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  await appCollection(db, TABLE).doc(PLATFORM_DOC).set(
    {
      ownerId,
      ownerEmail: profile?.email ?? DEMO_USER.email,
      ownerName: profile?.name ?? DEMO_USER.name,
      sampleDataVersion: 1,
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}

export async function isPlatformAdmin(uid: string, email: string): Promise<boolean> {
  if (email.toLowerCase() === DEMO_USER.email.toLowerCase()) return true;

  const platform = await getPlatformSettings();
  if (platform?.ownerId === uid) return true;

  const db = getAdminFirestore();
  await ensureAppTables(db);
  const snap = await appCollection(db, 'users').doc(uid).get();
  return snap.exists && snap.data()?.role === 'admin';
}
