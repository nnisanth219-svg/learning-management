import { NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';

export async function GET() {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;
  return NextResponse.json({ user: session });
}
