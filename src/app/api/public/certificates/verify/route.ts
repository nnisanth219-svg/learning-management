import { NextRequest, NextResponse } from 'next/server';
import { resolveWorkspaceOwnerId } from '@/lib/auth/workspace';
import { verifyCertificateByCode } from '@/lib/firestore/enrollments';
import { apiError } from '@/lib/http/api-error';
import { isFirebaseConfigured } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.trim();
  if (!code) return apiError('Certificate code is required.', 400);

  if (!isFirebaseConfigured()) {
    if (code.toUpperCase() === 'EV-2025-A1B2C') {
      return NextResponse.json({
        valid: true,
        holderName: 'Carol Davis',
        programTitle: 'Executive Leadership Certificate',
        issuedAt: '2025-05-20',
      });
    }
    return NextResponse.json({ valid: false });
  }

  const ownerId = await resolveWorkspaceOwnerId();
  if (!ownerId) return NextResponse.json({ valid: false });

  const cert = await verifyCertificateByCode(ownerId, code);
  if (!cert) return NextResponse.json({ valid: false });
  return NextResponse.json({
    valid: true,
    holderName: cert.holderName,
    programTitle: cert.programTitle,
    issuedAt: cert.issuedAt,
  });
}
