import { Timestamp, type DocumentData, type Firestore } from 'firebase-admin/firestore';

import { appCollection } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';

export const OWNER_ID_FIELD = 'ownerId';

export function timestampToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value && typeof value === 'object' && 'toDate' in value) {
    return (value as Timestamp).toDate().toISOString();
  }
  if (typeof value === 'string') return value;
  return new Date().toISOString();
}

function recordOwnedBy(data: DocumentData | undefined, ownerId: string): boolean {
  if (!data) return false;
  return data[OWNER_ID_FIELD] === ownerId;
}

export async function resolveRecordRef(tableKey: string, idOrCode: string, ownerId: string) {
  const db = getAdminFirestore();
  const col = appCollection(db, tableKey);
  const normalized = decodeURIComponent(idOrCode).trim();

  const byId = await col.doc(normalized).get();
  if (byId.exists && recordOwnedBy(byId.data(), ownerId)) {
    return { ref: byId.ref, snap: byId };
  }

  const byCode = await col
    .where(OWNER_ID_FIELD, '==', ownerId)
    .where('studentCode', '==', normalized.toUpperCase())
    .limit(1)
    .get();
  if (!byCode.empty) {
    const snap = byCode.docs[0];
    return { ref: snap.ref, snap };
  }

  return null;
}

export async function listByOwner<T>(
  tableKey: string,
  ownerId: string,
  mapDoc: (id: string, data: DocumentData) => T,
): Promise<T[]> {
  const db = getAdminFirestore();
  const snap = await appCollection(db, tableKey).where(OWNER_ID_FIELD, '==', ownerId).get();
  return snap.docs.map((doc) => mapDoc(doc.id, doc.data()));
}

export async function generateStudentCode(ownerId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `EV-STU-${year}-`;
  const db = getAdminFirestore();
  const col = appCollection(db, 'students');
  for (let i = 0; i < 10; i++) {
    const suffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const code = `${prefix}${suffix}`;
    const existing = await col
      .where(OWNER_ID_FIELD, '==', ownerId)
      .where('studentCode', '==', code)
      .limit(1)
      .get();
    if (existing.empty) return code;
  }
  return `${prefix}${Date.now().toString(36).toUpperCase().slice(-5)}`;
}
