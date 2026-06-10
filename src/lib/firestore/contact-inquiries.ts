import { FieldValue } from 'firebase-admin/firestore';
import { appCollection, ensureAppTables } from '@/lib/firebase/collections';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { OWNER_ID_FIELD } from '@/lib/firestore/helpers';
import { createNotification } from '@/lib/firestore/notifications';

const TABLE = 'contact_inquiries';

export async function createContactInquiry(
  ownerId: string,
  input: { name: string; email: string; subject?: string; message: string },
) {
  const db = getAdminFirestore();
  await ensureAppTables(db);
  const ref = appCollection(db, TABLE).doc();

  await ref.set({
    name: input.name,
    email: input.email.toLowerCase(),
    subject: input.subject ?? 'General Inquiry',
    message: input.message,
    status: 'new',
    [OWNER_ID_FIELD]: ownerId,
    createdAt: FieldValue.serverTimestamp(),
  });

  await createNotification(ownerId, {
    title: 'New Contact Inquiry',
    message: `${input.name} sent a message: ${input.subject ?? 'General Inquiry'}.`,
    type: 'system',
  });

  return { inquiryId: ref.id };
}
