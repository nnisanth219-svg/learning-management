'use client';

import { ButtonSpinner } from '@/components/ui';
import { APP_BRAND } from '@/lib/branding';
import { setSessionUser } from '@/lib/auth/session';
import { GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function StudentLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string; user?: { id: string; name: string; email: string; studentCode?: string } };
      if (!res.ok) throw new Error(data.error ?? 'Sign in failed.');
      if (data.user) setSessionUser({ ...data.user, role: 'student' });
      router.push('/student');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-gradient px-4">
      <div className="glass-card w-full max-w-md p-8">
        <div className="text-center">
          <GraduationCap className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-3 font-display text-2xl font-bold">{APP_BRAND.name}</h1>
          <p className="text-sm text-muted">Student Portal Sign In</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="enterprise-input mt-1.5" />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="enterprise-input mt-1.5" />
          </div>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button type="submit" disabled={loading} className="btn-primary inline-flex w-full items-center justify-center gap-2">
            {loading ? <ButtonSpinner /> : null}
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">
          New student? <Link href="/courses" className="text-primary hover:underline">Enroll in a course</Link>
        </p>
      </div>
    </div>
  );
}
