'use client';

import { AdminLoginPanel } from '@/components/auth/admin-login-panel';
import { ButtonSpinner, PageLoader } from '@/components/ui';
import { PasswordField } from '@/components/auth/password-field';
import { APP_BRAND } from '@/lib/branding';
import { REMEMBER_EMAIL_KEY } from '@/lib/auth/constants';
import { setSessionUser } from '@/lib/auth/session';
import { DEMO_USER } from '@/lib/demo/credentials';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  ArrowLeft,
  Copy,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
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

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showDemoPassword, setShowDemoPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  function applyDemoCredentials() {
    setEmail(DEMO_USER.email);
    setPassword(DEMO_USER.password);
    setFieldErrors({});
    setError('');
  }

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      /* ignore */
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const errors = validate(email, password);
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setLoading(true);
    try {
      if (rememberMe) localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
      else localStorage.removeItem(REMEMBER_EMAIL_KEY);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password, rememberMe }),
      });
      const data = (await res.json()) as { error?: string; user?: { id: string; name: string; email: string } };
      if (!res.ok) throw new Error(data.error ?? 'Invalid email or password.');
      if (data.user) setSessionUser({ ...data.user, role: 'admin' });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDemoLogin() {
    setDemoLoading(true);
    setError('');
    setFieldErrors({});
    applyDemoCredentials();
    try {
      const res = await fetch('/api/auth/demo', { method: 'POST', credentials: 'include' });
      const data = (await res.json()) as { error?: string; user?: { id: string; name: string; email: string } };
      if (!res.ok) throw new Error(data.error ?? 'Demo setup failed. Check Firebase configuration.');
      if (data.user) setSessionUser({ ...data.user, role: 'admin' });
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed.');
    } finally {
      setDemoLoading(false);
    }
  }

  const busy = loading || demoLoading;

  return (
    <div className="flex min-h-screen bg-canvas">
      <AdminLoginPanel />

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
            <h2 className="font-display text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-sm text-muted">Sign in to access your admin CRM dashboard.</p>
          </div>

          {error ? (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/5 px-4 py-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
                }}
                placeholder="admin@eduvantage.com"
                className={cn('enterprise-input mt-1.5', fieldErrors.email && 'border-danger focus:border-danger focus:ring-danger/20')}
              />
              {fieldErrors.email ? <p className="mt-1.5 text-xs text-danger">{fieldErrors.email}</p> : null}
            </div>

            <PasswordField
              label="Password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
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
              <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={busy} className="btn-primary flex w-full items-center justify-center gap-2">
              {loading ? <ButtonSpinner /> : null}
              Sign in to Dashboard
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-primary/15 bg-primary-soft/40 p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Demo Credentials</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              Use these credentials for testing, or click Quick Demo Login to bootstrap sample data and sign in automatically.
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2 rounded-lg bg-surface/80 px-3 py-2">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Email</dt>
                  <dd className="font-mono text-xs">{DEMO_USER.email}</dd>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(DEMO_USER.email)}
                  className="rounded-lg p-1.5 text-muted hover:bg-subtle hover:text-foreground"
                  aria-label="Copy email"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 rounded-lg bg-surface/80 px-3 py-2">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">Password</dt>
                  <dd className="font-mono text-xs">
                    {showDemoPassword ? DEMO_USER.password : '••••••••••••'}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowDemoPassword((v) => !v)}
                    className="rounded-lg px-2 py-1 text-[10px] font-semibold text-primary hover:bg-subtle"
                  >
                    {showDemoPassword ? 'Hide' : 'Show'}
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(DEMO_USER.password)}
                    className="rounded-lg p-1.5 text-muted hover:bg-subtle hover:text-foreground"
                    aria-label="Copy password"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </dl>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={applyDemoCredentials} disabled={busy} className="btn-outline flex-1 text-sm">
                Fill credentials
              </button>
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={busy}
                className="btn-primary flex flex-1 items-center justify-center gap-2 text-sm"
              >
                {demoLoading ? <ButtonSpinner /> : null}
                Quick Demo Login
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Are you a student?{' '}
            <Link href="/user/login" className="font-semibold text-primary hover:underline">Student Login</Link>
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

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={<PageLoader className="min-h-screen bg-canvas" />}
    >
      <AdminLoginForm />
    </Suspense>
  );
}
