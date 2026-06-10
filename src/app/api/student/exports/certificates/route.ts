import { NextRequest } from 'next/server';
import { isApiGuardResponse, requireStudentSession } from '@/lib/auth/api-guard';
import { buildStudentCertificatesExport } from '@/lib/export/admin-exports';
import { apiError } from '@/lib/http/api-error';

export async function GET(request: NextRequest) {
  const session = await requireStudentSession();
  if (isApiGuardResponse(session)) return session;

  const certificateId = request.nextUrl.searchParams.get('certificateId') ?? undefined;

  try {
    return buildStudentCertificatesExport(session.workspaceOwnerId, session.studentId, certificateId);
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Export failed.', 500);
  }
}
