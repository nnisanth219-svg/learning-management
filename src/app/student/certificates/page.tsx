'use client';

import { Card, PageLoader } from '@/components/ui';
import { CertificateDownloadButton } from '@/components/student/certificate-download-button';
import type { StudentDashboardData } from '@/data/types';
import { apiJson } from '@/lib/http/client';
import { Award } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<StudentDashboardData['certificates']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson<StudentDashboardData>('/api/student/dashboard')
      .then((d) => setCertificates(d.certificates))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader variant="compact" />;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold">My Certificates</h1>
        {certificates.length > 0 ? (
          <CertificateDownloadButton label="Download All" />
        ) : null}
      </div>
      <div className="mt-8 space-y-4">
        {certificates.length === 0 ? (
          <Card padding="md" className="text-center">
            <Award className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 text-muted">Complete a course to earn your first certificate.</p>
          </Card>
        ) : (
          certificates.map((cert) => (
            <Card key={cert.id} padding="md" className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold">{cert.programTitle}</p>
                <p className="text-sm text-muted">Issued {cert.issuedAt}</p>
              </div>
              <div className="flex items-center gap-3">
                <code className="rounded-lg bg-subtle px-3 py-1 text-sm font-mono">{cert.publicCode}</code>
                <CertificateDownloadButton certificateId={cert.id} iconOnly label="Download certificate" />
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
