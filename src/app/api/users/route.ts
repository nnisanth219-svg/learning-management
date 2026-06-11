import { NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { listPlatformUsers } from '@/lib/firestore/users';
import { apiError } from '@/lib/http/api-error';

export async function GET() {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  try {
    const users = await listPlatformUsers(session.workspaceOwnerId);
    return NextResponse.json({ users });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load users.', 500);
  }
}
