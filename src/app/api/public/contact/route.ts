import { NextRequest, NextResponse } from 'next/server';
import { requireFirebaseAdmin } from '@/lib/auth/server';
import { resolveWorkspaceOwnerId } from '@/lib/auth/workspace';
import { createContactInquiry } from '@/lib/firestore/contact-inquiries';
import { apiError } from '@/lib/http/api-error';
import { isFirebaseConfigured } from '@/lib/firebase/admin';
import { contactFormSchema } from '@/lib/validation/auth';

export async function POST(request: NextRequest) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ success: true, message: 'Message received (demo mode).' });
  }
  try {
    requireFirebaseAdmin();
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Firebase is not configured.', 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body.', 400);
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);
  }

  const ownerId = await resolveWorkspaceOwnerId();
  if (!ownerId) return apiError('Platform is not ready.', 503);

  try {
    const result = await createContactInquiry(ownerId, parsed.data);
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to send message.', 500);
  }
}
