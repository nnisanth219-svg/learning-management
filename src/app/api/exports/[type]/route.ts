import { NextRequest } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import {
  buildAnalyticsExport,
  buildCertificatesExport,
  buildCoursesExport,
  buildEnrollmentsExport,
  buildProgressExport,
  buildStudentsExport,
  isExportType,
} from '@/lib/export/admin-exports';
import { apiError } from '@/lib/http/api-error';

type RouteContext = { params: Promise<{ type: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  const { type } = await context.params;
  if (!isExportType(type)) return apiError('Unknown export type.', 404);

  const ownerId = session.workspaceOwnerId;
  const certificateId = request.nextUrl.searchParams.get('certificateId') ?? undefined;
  const status = request.nextUrl.searchParams.get('status') ?? undefined;

  try {
    switch (type) {
      case 'students':
        return buildStudentsExport(ownerId);
      case 'enrollments':
        return buildEnrollmentsExport(ownerId, status);
      case 'courses':
        return buildCoursesExport(ownerId);
      case 'certificates':
        return buildCertificatesExport(ownerId, certificateId);
      case 'progress':
        return buildProgressExport(ownerId);
      case 'analytics':
        return buildAnalyticsExport(ownerId);
      default:
        return apiError('Unknown export type.', 404);
    }
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Export failed.', 500);
  }
}
