import { buildSampleCertificateExport } from '@/lib/export/admin-exports';

export async function GET() {
  return buildSampleCertificateExport();
}
