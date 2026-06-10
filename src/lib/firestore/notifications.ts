import { FieldValue } from 'firebase-admin/firestore';
import type { Notification } from '@/data/types';
import { NOTIFICATIONS } from '@/data/mock';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { listByOwner, OWNER_ID_FIELD, timestampToIso } from '@/lib/firestore/helpers';
import type { DocumentData } from 'firebase-admin/firestore';

const TABLE = 'notifications';

function toNotification(id: string, data: DocumentData): Notification {
  const d = data;
  return {
    id,
    title: String(d.title ?? ''),
    message: String(d.message ?? ''),
    type: (d.type as Notification['type']) ?? 'system',
    read: Boolean(d.read),
    createdAt: timestampToIso(d.createdAt),
  };
}

export async function listNotifications(ownerId: string) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const items = await listByOwner(TABLE, ownerId, toNotification);
  return items.length ? items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : NOTIFICATIONS;
}

export async function createNotification(
  ownerId: string,
  input: Pick<Notification, 'title' | 'message' | 'type'>,
) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, TABLE).doc();
  await ref.set({
    ...input,
    read: false,
    [OWNER_ID_FIELD]: ownerId,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export async function markNotificationRead(ownerId: string, id: string) {
  const db = getAdminFirestore();
  const ref = appCollection(db, TABLE).doc(id);
  const snap = await ref.get();
  if (!snap.exists || snap.data()?.[OWNER_ID_FIELD] !== ownerId) return null;
  await ref.set({ read: true, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return toNotification(snap.id, (await ref.get()).data()!);
}
