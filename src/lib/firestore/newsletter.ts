import { FieldValue } from 'firebase-admin/firestore';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { OWNER_ID_FIELD } from '@/lib/firestore/helpers';

const TABLE = 'newsletter_subscribers';

export async function subscribeNewsletter(ownerId: string, email: string, name?: string) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const col = appCollection(db, TABLE);
  const existing = await col
    .where(OWNER_ID_FIELD, '==', ownerId)
    .where('email', '==', email.toLowerCase())
    .limit(1)
    .get();

  if (!existing.empty) {
    return { subscriberId: existing.docs[0].id, alreadySubscribed: true };
  }

  const ref = col.doc();
  await ref.set({
    email: email.toLowerCase(),
    name: name ?? '',
    [OWNER_ID_FIELD]: ownerId,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { subscriberId: ref.id, alreadySubscribed: false };
}
