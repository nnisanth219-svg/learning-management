import { NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { ensureAdminSampleData } from '@/lib/demo/seed';

export async function GET() {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  await ensureAdminSampleData(session.workspaceOwnerId, {
    email: session.email,
    name: session.name,
  });

  return NextResponse.json({ user: session });
}
