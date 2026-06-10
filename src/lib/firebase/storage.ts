import { getAdminApp } from '@/lib/firebase/admin';

export const STORAGE_FOLDERS = {
  profiles: 'profiles',
  documents: 'documents',
  certificates: 'certificates',
  courses: 'courses',
  uploads: 'uploads',
} as const;

export type StorageCategory = keyof typeof STORAGE_FOLDERS;

/** Canonical object paths inside the default Firebase Storage bucket. */
export function storagePath(
  category: StorageCategory,
  segments: string[],
  filename: string,
): string {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return [STORAGE_FOLDERS[category], ...segments, safeName].filter(Boolean).join('/');
}

export function profilePhotoPath(userId: string, filename: string) {
  return storagePath('profiles', [userId], filename);
}

export function studentDocumentPath(ownerId: string, studentId: string, filename: string) {
  return storagePath('documents', [ownerId, studentId], filename);
}

export function certificateFilePath(ownerId: string, certificateId: string, filename: string) {
  return storagePath('certificates', [ownerId, certificateId], filename);
}

export function courseAssetPath(ownerId: string, courseId: string, filename: string) {
  return storagePath('courses', [ownerId, courseId], filename);
}

export function generalUploadPath(ownerId: string, subfolder: string, filename: string) {
  return storagePath('uploads', [ownerId, subfolder], filename);
}

export function getStorageBucketName(): string | undefined {
  const fromEnv =
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.trim();
  if (fromEnv) return fromEnv;

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  if (projectId) return `${projectId}.firebasestorage.app`;

  return undefined;
}

export function getAdminStorageBucket() {
  const bucketName = getStorageBucketName();
  const storage = getAdminApp().storage();
  return bucketName ? storage.bucket(bucketName) : storage.bucket();
}

export async function uploadBuffer(params: {
  path: string;
  buffer: Buffer;
  contentType: string;
  metadata?: Record<string, string>;
  makePublic?: boolean;
}) {
  const bucket = getAdminStorageBucket();
  const file = bucket.file(params.path);
  await file.save(params.buffer, {
    metadata: {
      contentType: params.contentType,
      metadata: params.metadata ?? {},
    },
    resumable: false,
  });
  if (params.makePublic) {
    try {
      await file.makePublic();
    } catch {
      /* bucket may use uniform access; URL may still work with token rules */
    }
  }
  return {
    bucket: bucket.name,
    path: params.path,
    publicUrl: getPublicFileUrl(bucket.name, params.path),
  };
}

export function getPublicFileUrl(bucketName: string, path: string): string {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(path)}?alt=media`;
}

export async function getSignedDownloadUrl(path: string, expiresMs = 60 * 60 * 1000) {
  const bucket = getAdminStorageBucket();
  const file = bucket.file(path);
  const [exists] = await file.exists();
  if (!exists) return null;
  const [url] = await file.getSignedUrl({ action: 'read', expires: Date.now() + expiresMs });
  return url;
}

export async function verifyStorageConnection(): Promise<{ ok: boolean; bucket?: string; error?: string }> {
  try {
    const bucket = getAdminStorageBucket();
    await bucket.getMetadata();
    return { ok: true, bucket: bucket.name };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
