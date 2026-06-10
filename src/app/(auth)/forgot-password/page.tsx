'use client';

import { AdminLoginPanel } from '@/components/auth/admin-login-panel';
import { ButtonSpinner } from '@/components/ui';
import { APP_BRAND } from '@/lib/branding';
import { cn } from '@/lib/utils';
import { AlertCircle, ArrowLeft, CheckCircle2, GraduationCap, Mail } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setFieldError('');

    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error ?? 'Unable to send reset email.');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reset email.');
    } finally {
      setLoading(false);
    }
  }

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

          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold">Check your inbox</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                If an account exists for <span className="font-semibold text-foreground">{email}</span>, we&apos;ve sent password reset instructions.
              </p>
              <Link href="/login" className="btn-primary mt-8 inline-flex">
                Return to sign in
              </Link>
            </div>
          ) : (
            <>
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <h2 className="mt-5 font-display text-3xl font-bold tracking-tight">Forgot password?</h2>
                <p className="mt-2 text-sm text-muted">
                  Enter your admin email and we&apos;ll send you a link to reset your password.
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
                  <label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldError('');
                    }}
                    placeholder="admin@eduvantage.com"
                    className={cn(
                      'enterprise-input mt-1.5',
                      fieldError && 'border-danger focus:border-danger focus:ring-danger/20',
                    )}
                  />
                  {fieldError ? <p className="mt-1.5 text-xs text-danger">{fieldError}</p> : null}
                </div>

                <button type="submit" disabled={loading} className="btn-primary flex w-full items-center justify-center gap-2">
                  {loading ? <ButtonSpinner /> : null}
                  Send reset link
                </button>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-sm text-muted">
            <Link href="/login" className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
