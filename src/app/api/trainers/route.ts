import { NextRequest, NextResponse } from 'next/server';
import { isApiGuardResponse, requireAuthorizedSession } from '@/lib/auth/api-guard';
import { createTrainer, listTrainers } from '@/lib/firestore/trainers';
import { apiError } from '@/lib/http/api-error';
import { createTrainerSchema } from '@/lib/validation/people';

export async function GET() {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  try {
    const trainers = await listTrainers(session.workspaceOwnerId);
    return NextResponse.json({ trainers });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to load trainers.', 500);
  }
}

export async function POST(request: NextRequest) {
  const session = await requireAuthorizedSession();
  if (isApiGuardResponse(session)) return session;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError('Invalid JSON body.', 400);
  }

  const parsed = createTrainerSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.errors[0]?.message ?? 'Invalid request.', 400);
  }

  try {
    const trainer = await createTrainer(session.workspaceOwnerId, parsed.data);
    return NextResponse.json({ trainer }, { status: 201 });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : 'Failed to create trainer.', 500);
  }
}
