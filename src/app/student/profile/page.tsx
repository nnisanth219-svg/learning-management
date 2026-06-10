'use client';

import { Badge, Card, PageLoader } from '@/components/ui';
import type { StudentDashboardData } from '@/data/types';
import { apiJson } from '@/lib/http/client';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StudentProfilePage() {
  const [data, setData] = useState<StudentDashboardData | null>(null);

  useEffect(() => {
    apiJson<StudentDashboardData>('/api/student/dashboard').then(setData).catch(() => {});
  }, []);

  if (!data) return <PageLoader />;

  const { profile, enrollments } = data;

  return (
    <>
      <h1 className="font-display text-2xl font-bold">Profile</h1>
      <Card padding="md" className="mt-8 max-w-xl">
        <dl className="space-y-4 text-sm">
          <div><dt className="text-muted">Student ID</dt><dd className="font-bold text-primary">{profile.studentCode}</dd></div>
          <div><dt className="text-muted">Full Name</dt><dd className="font-medium">{profile.name}</dd></div>
          <div><dt className="text-muted">Email</dt><dd className="font-medium">{profile.email}</dd></div>
          <div><dt className="text-muted">Phone</dt><dd className="font-medium">{profile.phone ?? '—'}</dd></div>
          <div><dt className="text-muted">Qualification</dt><dd className="font-medium">{profile.qualification ?? '—'}</dd></div>
          <div><dt className="text-muted">Account Status</dt><dd><Badge variant={profile.status === 'active' ? 'success' : 'muted'} className="capitalize">{profile.status}</Badge></dd></div>
          <div><dt className="text-muted">Member Since</dt><dd className="font-medium">{profile.joinedAt}</dd></div>
        </dl>
      </Card>

      <Card padding="md" className="mt-6 max-w-xl">
        <h2 className="font-display font-bold">Enrollment History</h2>
        <ul className="mt-4 space-y-3">
          {enrollments.map((e) => (
            <li key={e.id} className="rounded-xl border border-border/60 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{e.courseName}</span>
                <Badge variant={e.status === 'approved' ? 'success' : e.status === 'pending' ? 'warning' : e.status === 'rejected' ? 'danger' : 'primary'} className="capitalize">
                  {e.status}
                </Badge>
              </div>
              {e.approvedBy ? (
                <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  Approved by {e.approvedBy}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
