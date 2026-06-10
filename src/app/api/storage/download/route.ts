import { NextRequest, NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { getAdminStorageBucket } from '@/lib/firebase/storage';
import { apiError } from '@/lib/http/api-error';

const ALLOWED_PREFIXES = ['profiles/', 'documents/', 'certificates/', 'courses/', 'uploads/'];

export async function GET(request: NextRequest) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  const path = request.nextUrl.searchParams.get('path')?.trim();
  if (!path) return apiError('File path is required.', 400);
  if (path.includes('..')) return apiError('Invalid file path.', 400);

  const ownerId = session.workspaceOwnerId;
  const hasAllowedPrefix = ALLOWED_PREFIXES.some((prefix) => path.startsWith(prefix));
  if (!hasAllowedPrefix) return apiError('You do not have access to this file.', 403);

  const isProfilePath = path.startsWith('profiles/');
  const allowed = isProfilePath || path.includes(ownerId);
  if (!allowed) return apiError('You do not have access to this file.', 403);

  try {
    const bucket = getAdminStorageBucket();
    const file = bucket.file(path);
    const [exists] = await file.exists();
    if (!exists) return apiError('File not found in storage.', 404);

    const [metadata] = await file.getMetadata();
    const [buffer] = await file.download();
    const filename = path.split('/').pop() ?? 'download';
    const contentType = metadata.contentType ?? 'application/octet-stream';

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Download failed.', 500);
  }
}
