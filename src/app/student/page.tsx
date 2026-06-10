'use client';

import { Badge, Card, PageLoader } from '@/components/ui';
import type { EnrollmentRequest, StudentDashboardData } from '@/data/types';
import { apiJson } from '@/lib/http/client';
import { BookOpen, CheckCircle2, Clock, GraduationCap, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const statusVariant: Record<string, 'success' | 'warning' | 'muted' | 'danger' | 'primary'> = {
  approved: 'success',
  pending: 'warning',
  new: 'primary',
  rejected: 'danger',
};

function EnrollmentRow({ enrollment }: { enrollment: EnrollmentRequest }) {
  return (
    <div className="rounded-xl border border-border/60 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium">{enrollment.courseName}</p>
          <p className="mt-1 text-xs text-muted">Applied {new Date(enrollment.createdAt).toLocaleDateString()}</p>
          {enrollment.status === 'approved' && enrollment.approvedBy ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Approved by {enrollment.approvedBy}
              {enrollment.approvedAt ? ` on ${new Date(enrollment.approvedAt).toLocaleDateString()}` : ''}
            </p>
          ) : null}
          {enrollment.status === 'pending' ? (
            <p className="mt-2 text-xs text-warning">Awaiting admin approval — you can track status here.</p>
          ) : null}
          {enrollment.status === 'rejected' && enrollment.rejectedBy ? (
            <p className="mt-2 text-xs text-danger">Reviewed by {enrollment.rejectedBy}</p>
          ) : null}
        </div>
        <Badge variant={statusVariant[enrollment.status] ?? 'muted'} className="capitalize shrink-0">
          {enrollment.status}
        </Badge>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiJson<StudentDashboardData>('/api/student/dashboard')
      .then(setData)
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Unable to load dashboard.');
        setData(null);
      });
  }, []);

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-danger">{error}</p>
        <Link href="/user/login" className="btn-primary mt-4 inline-flex">Sign in again</Link>
      </div>
    );
  }

  if (!data) {
    return <PageLoader />;
  }

  const hasApproved = data.enrollments.some((e) => e.status === 'approved');
  const avgProgress = Math.round(
    data.progress.reduce((a, p) => a + p.progress, 0) / Math.max(data.progress.length, 1),
  );

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Welcome back, {data.profile.name}</h1>
        <p className="mt-1 text-muted">
          Student ID: <span className="font-semibold text-primary">{data.profile.studentCode}</span>
        </p>
        {!hasApproved ? (
          <p className="mt-3 rounded-xl bg-warning/10 px-4 py-3 text-sm text-warning">
            Your enrollment is being reviewed. You&apos;ll get full course access once an admin approves your application.
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'My Courses', value: data.courses.length, icon: BookOpen },
          { label: 'Enrollments', value: data.enrollments.length, icon: GraduationCap },
          { label: 'Avg Progress', value: `${avgProgress}%`, icon: TrendingUp },
          { label: 'Certificates', value: data.certificates.length, icon: Clock },
        ].map((stat) => (
          <Card key={stat.label} padding="md" className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted">{stat.label}</p>
              <p className="font-display text-xl font-bold">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="md" className="mt-8">
        <h2 className="font-display text-lg font-bold">Enrollment Status</h2>
        <div className="mt-4 space-y-3">
          {data.enrollments.length === 0 ? (
            <p className="text-sm text-muted">
              No enrollments yet. <Link href="/courses" className="text-primary">Browse courses</Link>
            </p>
          ) : (
            data.enrollments.map((e) => <EnrollmentRow key={e.id} enrollment={e} />)
          )}
        </div>
      </Card>

      {data.courses.length > 0 ? (
        <Card padding="md" className="mt-8">
          <h2 className="font-display text-lg font-bold">Your Courses</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {data.courses.map((course) => (
              <div key={course.id} className="rounded-xl border border-border/60 p-4">
                <p className="font-medium">{course.title}</p>
                <p className="mt-1 text-xs text-muted">{course.category} · {course.duration}</p>
                <p className="mt-2 text-sm text-primary">{course.instructor}</p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link href="/student/courses" className="premium-card p-5 text-center hover:shadow-premium">My Courses →</Link>
        <Link href="/student/progress" className="premium-card p-5 text-center hover:shadow-premium">Learning Progress →</Link>
        <Link href="/student/profile" className="premium-card p-5 text-center hover:shadow-premium">Profile →</Link>
      </div>
    </>
  );
}
