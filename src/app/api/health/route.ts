import { NextResponse } from 'next/server';

import { getAdminFirestore, isFirebaseConfigured } from '@/lib/firebase/admin';
import { ensureAppTables } from '@/lib/firebase/collections';
import { verifyStorageConnection } from '@/lib/firebase/storage';

const API_ROUTES = [
  '/api/health',
  '/api/dashboard',
  '/api/courses',
  '/api/students',
  '/api/students/[id]',
  '/api/enrollments',
  '/api/enrollments/[id]',
  '/api/public/courses',
  '/api/public/enroll',
  '/api/public/register',
  '/api/public/contact',
  '/api/public/newsletter',
  '/api/public/certificates/verify',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/session',
  '/api/auth/demo',
  '/api/auth/forgot-password',
  '/api/auth/student/login',
  '/api/users',
  '/api/student/dashboard',
  '/api/uploads',
] as const;

const STORAGE_LAYOUT = {
  profiles: 'profiles/{userId}/',
  documents: 'documents/{ownerId}/{studentId}/',
  certificates: 'certificates/{ownerId}/{certificateId}/',
  courses: 'courses/{ownerId}/{courseId}/',
  uploads: 'uploads/{ownerId}/{subfolder}/',
} as const;

export async function GET() {
  const checks: Record<string, 'ok' | 'skip' | 'fail'> = {};
  let ok = true;

  const body: {
    ok: boolean;
    status: string;
    firebase: 'connected' | 'not_configured' | 'error';
    storage: 'connected' | 'not_configured' | 'error';
    firebaseError?: string;
    storageError?: string;
    storageBucket?: string;
    apiRoutes: typeof API_ROUTES;
    storageLayout: typeof STORAGE_LAYOUT;
    timestamp: string;
  } = {
    ok: true,
    status: 'running',
    firebase: 'not_configured',
    storage: 'not_configured',
    apiRoutes: API_ROUTES,
    storageLayout: STORAGE_LAYOUT,
    timestamp: new Date().toISOString(),
  };

  if (!isFirebaseConfigured()) {
    return NextResponse.json(body);
  }

  try {
    const db = getAdminFirestore();
    await ensureAppTables(db);
    body.firebase = 'connected';
    checks.firestore = 'ok';
  } catch (e) {
    ok = false;
    body.firebase = 'error';
    body.firebaseError = e instanceof Error ? e.message : String(e);
    checks.firestore = 'fail';
  }

  const storage = await verifyStorageConnection();
  if (storage.ok) {
    body.storage = 'connected';
    body.storageBucket = storage.bucket;
    checks.storage = 'ok';
  } else if (isFirebaseConfigured()) {
    body.storage = 'error';
    body.storageError = storage.error;
    checks.storage = 'fail';
    ok = false;
  } else {
    body.storage = 'not_configured';
    checks.storage = 'skip';
  }

  body.ok = ok && body.firebase === 'connected';
  if (body.storage === 'error') body.ok = false;
  if (!ok) return NextResponse.json(body, { status: 503 });
  return NextResponse.json(body);
}
