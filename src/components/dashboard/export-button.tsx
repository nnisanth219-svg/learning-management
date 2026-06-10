'use client';

import { ButtonSpinner } from '@/components/ui';
import { downloadExport } from '@/lib/export/download-client';
import { Download } from 'lucide-react';
import { useState } from 'react';

type ExportButtonProps = {
  exportType: string;
  params?: Record<string, string>;
  label?: string;
  variant?: 'outline' | 'ghost';
  size?: 'sm' | 'md';
  iconOnly?: boolean;
  className?: string;
};

export function ExportButton({
  exportType,
  params,
  label = 'Export',
  variant = 'outline',
  size = 'sm',
  iconOnly = false,
  className,
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleClick() {
    setError('');
    setLoading(true);
    try {
      await downloadExport(exportType, params);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Export failed.');
    } finally {
      setLoading(false);
    }
  }

  const btnClass =
    variant === 'ghost'
      ? 'rounded-lg p-2 text-muted hover:bg-subtle hover:text-primary disabled:opacity-50'
      : 'btn-outline !py-2 !text-sm inline-flex items-center gap-2 disabled:opacity-50';

  return (
    <span className={className}>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        aria-label={iconOnly ? label : undefined}
        className={btnClass}
      >
        {loading ? <ButtonSpinner /> : <Download className="h-4 w-4" />}
        {!iconOnly ? label : null}
      </button>
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </span>
  );
}
