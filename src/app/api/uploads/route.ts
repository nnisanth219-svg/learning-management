import { NextRequest, NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession, requireStudentSession } from '@/lib/auth/api-guard';
import {
  certificateFilePath,
  courseAssetPath,
  generalUploadPath,
  profilePhotoPath,
  studentDocumentPath,
  uploadBuffer,
} from '@/lib/firebase/storage';
import { apiError } from '@/lib/http/api-error';
import { isFirebaseConfigured } from '@/lib/firebase/admin';

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!isFirebaseConfigured()) return apiError('Firebase is not configured.', 503);

  const form = await request.formData().catch(() => null);
  if (!form) return apiError('Invalid form data.', 400);

  const file = form.get('file');
  const category = String(form.get('category') ?? 'uploads');
  if (!(file instanceof File)) return apiError('File is required.', 400);
  if (file.size > MAX_BYTES) return apiError('File exceeds 10MB limit.', 400);

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name || 'upload.bin';

  let path: string;

  if (category === 'profile') {
    const session = await requireStudentSession();
    if (isApiGuardResponse(session)) return session;
    path = profilePhotoPath(session.id, filename);
  } else if (category === 'document') {
    const session = await requireStudentSession();
    if (isApiGuardResponse(session)) return session;
    path = studentDocumentPath(session.workspaceOwnerId, session.studentId, filename);
  } else if (category === 'certificate') {
    const session = await requireAuthorizedSession();
    if (isApiGuardResponse(session)) return session;
    const certId = String(form.get('certificateId') ?? 'general');
    path = certificateFilePath(session.workspaceOwnerId, certId, filename);
  } else if (category === 'course') {
    const session = await requireAuthorizedSession();
    if (isApiGuardResponse(session)) return session;
    const courseId = String(form.get('courseId') ?? 'general');
    path = courseAssetPath(session.workspaceOwnerId, courseId, filename);
  } else if (category === 'trainer') {
    const session = await requireAuthorizedSession();
    if (isApiGuardResponse(session)) return session;
    path = generalUploadPath(session.workspaceOwnerId, 'trainers', filename);
  } else {
    const session = await requireAuthorizedSession();
    if (isApiGuardResponse(session)) return session;
    path = generalUploadPath(session.workspaceOwnerId, category, filename);
  }

  try {
    const result = await uploadBuffer({
      path,
      buffer,
      contentType: file.type || 'application/octet-stream',
      makePublic: category === 'course' || category === 'trainer',
    });
    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Upload failed.', 500);
  }
}
