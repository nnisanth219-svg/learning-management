'use client';

import { ButtonSpinner, PageLoader } from '@/components/ui';
import { PasswordField } from '@/components/auth/password-field';
import { StudentLoginPanel } from '@/components/auth/student-login-panel';
import { APP_BRAND } from '@/lib/branding';
import { REMEMBER_STUDENT_EMAIL_KEY } from '@/lib/auth/constants';
import { setSessionUser } from '@/lib/auth/session';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowLeft, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

type FieldErrors = { email?: string; password?: string };

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email.trim()) errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
  if (!password) errors.password = 'Password is required.';
  else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
  return errors;
}

function UserLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/student';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_STUDENT_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const errors = validate(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      if (rememberMe) localStorage.setItem(REMEMBER_STUDENT_EMAIL_KEY, email.trim());
      else localStorage.removeItem(REMEMBER_STUDENT_EMAIL_KEY);

      const res = await fetch('/api/auth/student/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
      });
      const data = (await res.json()) as {
        error?: string;
        user?: { id: string; name: string; email: string; studentCode?: string };
      };
      if (!res.ok) throw new Error(data.error ?? 'Invalid email or password.');
      if (data.user) setSessionUser({ ...data.user, role: 'student' });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <StudentLoginPanel />

      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-8 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hero-gradient">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-lg font-bold">{APP_BRAND.name}</span>
            </Link>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">Student Login</h2>
            <p className="mt-2 text-sm text-muted">
              Use the email and password from your course enrollment to access your account.
            </p>
          </div>

          {error ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-medium">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldErrors((f) => ({ ...f, email: undefined }));
                }}
                placeholder="you@email.com"
                className={cn('enterprise-input mt-1.5', fieldErrors.email && 'border-danger focus:border-danger focus:ring-danger/20')}
              />
              {fieldErrors.email ? <p className="mt-1.5 text-xs text-danger">{fieldErrors.email}</p> : null}
            </div>

            <PasswordField
              label="Password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setFieldErrors((f) => ({ ...f, password: undefined }));
              }}
              error={fieldErrors.password}
              minLength={6}
            />

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                Remember me
              </label>
              <Link href="/user/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
              {loading ? <ButtonSpinner /> : null}
              Sign in to My Dashboard
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted">
            Haven&apos;t enrolled yet?{' '}
            <Link href="/courses" className="font-semibold text-primary hover:underline">Browse courses</Link>
          </p>

          <p className="mt-6 text-center text-sm text-muted">
            Admin or staff?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">Admin Login</Link>
          </p>

          <p className="mt-4 text-center text-sm text-muted">
            <Link href="/" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UserLoginPage() {
  return (
    <Suspense fallback={<PageLoader className="min-h-screen" />}>
      <UserLoginForm />
    </Suspense>
  );
}
