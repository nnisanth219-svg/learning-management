'use client';

/** Trigger a file download from an authenticated export API route. */
export async function downloadExport(
  type: string,
  params?: Record<string, string>,
  fallbackFilename?: string,
) {
  const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
  const res = await fetch(`/api/exports/${type}${qs}`, { credentials: 'include' });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Export failed.');
  }

  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackFilename ?? `${type}-export.xlsx`;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/** Download a file from Firebase Storage via the admin download API. */
export async function downloadStorageFile(path: string, fallbackFilename?: string) {
  const res = await fetch(`/api/storage/download?path=${encodeURIComponent(path)}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? 'Download failed.');
  }
  const blob = await res.blob();
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match?.[1] ?? fallbackFilename ?? path.split('/').pop() ?? 'download';

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
