'use client';

import { ButtonSpinner } from '@/components/ui';
import { Download } from 'lucide-react';
import { useState } from 'react';

type Props = {
  certificateId?: string;
  label?: string;
  iconOnly?: boolean;
};

export function CertificateDownloadButton({ certificateId, label = 'Download', iconOnly }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const qs = certificateId ? `?certificateId=${encodeURIComponent(certificateId)}` : '';
      const res = await fetch(`/api/student/exports/certificates${qs}`, { credentials: 'include' });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? 'Download failed.');
      }
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') ?? '';
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] ?? 'certificate.xlsx';
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Download failed.');
    } finally {
      setLoading(false);
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        aria-label={label}
        className="rounded-lg p-2 text-muted hover:bg-subtle hover:text-primary disabled:opacity-50"
      >
        {loading ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={loading}
      className="btn-outline inline-flex items-center gap-2 !py-2 !text-sm disabled:opacity-50"
    >
      {loading ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
      {label}
    </button>
  );
}
