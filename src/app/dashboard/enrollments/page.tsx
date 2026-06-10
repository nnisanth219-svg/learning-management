'use client';

import { ExportButton } from '@/components/dashboard/export-button';
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge, Button, Card, PageLoader } from '@/components/ui';
import type { EnrollmentRequest, EnrollmentStatus } from '@/data/types';
import { apiJson } from '@/lib/http/client';
import { Check, X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

const TABS = [
  { id: 'new', label: 'New', href: '/dashboard/enrollments?tab=new' },
  { id: 'pending', label: 'Pending', href: '/dashboard/enrollments?tab=pending' },
  { id: 'approved', label: 'Approved', href: '/dashboard/enrollments?tab=approved' },
  { id: 'rejected', label: 'Rejected', href: '/dashboard/enrollments?tab=rejected' },
] as const;

const statusVariant: Record<EnrollmentStatus, 'primary' | 'warning' | 'success' | 'danger'> = {
  new: 'primary',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
};

export default function EnrollmentsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <EnrollmentsContent />
    </Suspense>
  );
}

function EnrollmentsContent() {
  const searchParams = useSearchParams();
  const tab = (TABS.some((t) => t.id === searchParams.get('tab')) ? searchParams.get('tab') : 'new') as EnrollmentStatus;
  const [enrollments, setEnrollments] = useState<EnrollmentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { enrollments: data } = await apiJson<{ enrollments: EnrollmentRequest[] }>(
        `/api/enrollments?status=${tab}`,
      );
      setEnrollments(data);
    } catch {
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: 'approved' | 'rejected') {
    await apiJson(`/api/enrollments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    load();
  }

  return (
    <>
      <PageHeader
        title="Enrollment Management"
        subtitle="Review and manage student enrollment requests from the website."
        actions={<ExportButton exportType="enrollments" params={{ status: tab }} label="Export Excel" />}
      />
      <DashboardTabs tabs={[...TABS]} activeTab={tab} />

      <Card padding="md">
        {loading ? (
          <PageLoader variant="compact" />
        ) : enrollments.length === 0 ? (
          <p className="text-sm text-muted">No {tab} enrollments.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="pb-3 pr-4">Applicant</th>
                  <th className="pb-3 pr-4">Course</th>
                  <th className="pb-3 pr-4">Qualification</th>
                  <th className="pb-3 pr-4">Student ID</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id} className="enterprise-table-row">
                    <td className="py-3.5 pr-4">
                      <p className="font-medium">{e.fullName}</p>
                      <p className="text-xs text-muted">{e.email} · {e.phone}</p>
                    </td>
                    <td className="py-3.5 pr-4">{e.courseName}</td>
                    <td className="py-3.5 pr-4">{e.qualification}</td>
                    <td className="py-3.5 pr-4 font-mono text-xs">{e.studentCode ?? '—'}</td>
                    <td className="py-3.5 pr-4">
                      <Badge variant={statusVariant[e.status]} className="capitalize">{e.status}</Badge>
                    </td>
                    <td className="py-3.5">
                      {(e.status === 'pending' || e.status === 'new') && e.studentId ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateStatus(e.id, 'approved')}>
                            <Check className="h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(e.id, 'rejected')}>
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      ) : e.status === 'new' ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted">Awaiting student registration</span>
                          <Button size="sm" variant="outline" onClick={() => updateStatus(e.id, 'rejected')}>
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
