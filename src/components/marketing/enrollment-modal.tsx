'use client';

import { ButtonSpinner } from '@/components/ui';
import type { Course } from '@/data/types';
import { cn } from '@/lib/utils';
import { GraduationCap, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Step = 'enroll' | 'register' | 'success';

type Props = {
  course: Course | null;
  open: boolean;
  onClose: () => void;
};

export function EnrollmentModal({ course, open, onClose }: Props) {
  const [step, setStep] = useState<Step>('enroll');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enrollmentId, setEnrollmentId] = useState('');
  const [studentCode, setStudentCode] = useState('');

  if (!open || !course) return null;

  async function handleEnroll(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/public/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.get('fullName'),
          email: form.get('email'),
          phone: form.get('phone'),
          courseId: course!.id,
          qualification: form.get('qualification'),
          notes: form.get('notes') || undefined,
        }),
      });
      const data = (await res.json()) as { error?: string; enrollmentId?: string };
      if (!res.ok) throw new Error(data.error ?? 'Enrollment failed.');
      setEnrollmentId(data.enrollmentId ?? '');
      setStep('register');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrollment failed.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password'));
    const confirmPassword = String(form.get('confirmPassword'));
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/public/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enrollmentId, password, confirmPassword }),
      });
      const data = (await res.json()) as { error?: string; user?: { studentCode?: string } };
      if (!res.ok) throw new Error(data.error ?? 'Registration failed.');
      setStudentCode(data.user?.studentCode ?? '');
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setStep('enroll');
    setError('');
    setEnrollmentId('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface shadow-premium">
        <div className="sticky top-0 flex items-center justify-between border-b border-border/60 bg-surface px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold">Course Enrollment</h2>
              <p className="text-xs text-muted line-clamp-1">{course.title}</p>
            </div>
          </div>
          <button type="button" onClick={handleClose} className="rounded-lg p-2 hover:bg-subtle">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {step === 'enroll' && (
            <>
              <p className="mb-6 text-sm text-muted">
                Complete the form below to apply for this course. You&apos;ll create your student account in the next step.
              </p>
              <form onSubmit={handleEnroll} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Full Name *</label>
                  <input name="fullName" required className="enterprise-input mt-1.5" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="text-sm font-medium">Email Address *</label>
                  <input name="email" type="email" required className="enterprise-input mt-1.5" placeholder="jane@email.com" />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number *</label>
                  <input name="phone" type="tel" required className="enterprise-input mt-1.5" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="text-sm font-medium">Selected Course</label>
                  <input readOnly value={course.title} className="enterprise-input mt-1.5 bg-subtle" />
                </div>
                <div>
                  <label className="text-sm font-medium">Education Qualification *</label>
                  <select name="qualification" required className="enterprise-input mt-1.5">
                    <option value="">Select qualification</option>
                    <option>High School</option>
                    <option>Associate Degree</option>
                    <option>Bachelor&apos;s Degree</option>
                    <option>Master&apos;s Degree</option>
                    <option>Doctorate</option>
                    <option>Professional Certification</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Additional Notes</label>
                  <textarea name="notes" rows={3} className="enterprise-input mt-1.5 !h-auto resize-none" placeholder="Optional message..." />
                </div>
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                <button type="submit" disabled={loading} className="btn-primary inline-flex w-full items-center justify-center gap-2">
                  {loading ? <ButtonSpinner /> : null}
                  Continue to Registration
                </button>
              </form>
            </>
          )}

          {step === 'register' && (
            <>
              <p className="mb-6 text-sm text-muted">Create your password to complete registration. Your enrollment will be reviewed by our team.</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Password *</label>
                  <input name="password" type="password" required minLength={6} className="enterprise-input mt-1.5" />
                </div>
                <div>
                  <label className="text-sm font-medium">Confirm Password *</label>
                  <input name="confirmPassword" type="password" required minLength={6} className="enterprise-input mt-1.5" />
                </div>
                {error ? <p className="text-sm text-danger">{error}</p> : null}
                <button type="submit" disabled={loading} className="btn-primary inline-flex w-full items-center justify-center gap-2">
                  {loading ? <ButtonSpinner /> : null}
                  Create Student Account
                </button>
              </form>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <GraduationCap className="h-8 w-8 text-success" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">Welcome to EduVantage!</h3>
              {studentCode ? (
                <p className="mt-2 text-sm text-muted">
                  Your Student ID: <span className="font-bold text-primary">{studentCode}</span>
                </p>
              ) : null}
              <p className="mt-2 text-sm text-muted">
                Your enrollment is pending admin approval. Sign in anytime at{' '}
                <Link href="/user/login" className="text-primary hover:underline">Student Login</Link>{' '}
                to track your status.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a href="/student" className="btn-primary">Go to My Dashboard</a>
                <button type="button" onClick={handleClose} className="btn-outline">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
