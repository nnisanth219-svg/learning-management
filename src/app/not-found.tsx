import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="font-display text-2xl font-bold">Page Not Found</h1>
      <p className="max-w-md text-muted">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <div className="flex gap-4">
        <Link href="/" className="btn-primary">Back to Home</Link>
        <Link href="/dashboard" className="btn-outline">Go to Dashboard</Link>
      </div>
    </main>
  );
}
