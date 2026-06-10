'use client';

import { ButtonSpinner } from '@/components/ui';
import { Download } from 'lucide-react';
import { useState } from 'react';

export function SampleCertificateDownload() {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await fetch('/api/public/certificates/sample');
      if (!res.ok) throw new Error('Download failed.');
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? 'sample-certificate.xlsx';
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.alert('Unable to download sample certificate. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="btn-outline mx-auto mt-6 flex items-center gap-2 disabled:opacity-50"
    >
      {loading ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
      Download Sample
    </button>
  );
}
