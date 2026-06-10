'use client';

import { ExportButton } from '@/components/dashboard/export-button';
import { CompactPieChart, CompactPieChartSkeleton } from '@/components/dashboard/compact-pie-chart';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card } from '@/components/ui';
import type { DashboardStats, Trainer } from '@/data/types';
import type { PieSlice } from '@/lib/firestore/dashboard-stats';
import { apiJson } from '@/lib/http/client';
import { useEffect, useState } from 'react';

type AnalyticsPayload = {
  stats: DashboardStats;
  charts: { categoryPie: PieSlice[]; courseStatusPie: PieSlice[] };
  trainers: Trainer[];
  avgRating: number;
};

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsPayload | null>(null);

  useEffect(() => {
    apiJson<AnalyticsPayload>('/api/dashboard').then(setData).catch(() => setData(null));
  }, []);

  const topTrainers = data?.trainers ?? [];
  const stats = data?.stats;

  return (
    <>
      <PageHeader
        title="Analytics"
        subtitle="Enrollment distribution, catalog insights, and trainer performance."
        actions={<ExportButton exportType="analytics" label="Export Report" className="!inline-flex" />}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        {data ? (
          <>
            <CompactPieChart title="Enrollments by Category" description="Share of enrollments across course categories" data={data.charts.categoryPie} />
            <CompactPieChart title="Course Catalog Status" description="Published, draft, and archived courses" data={data.charts.courseStatusPie} />
          </>
        ) : (
          <>
            <CompactPieChartSkeleton title="Enrollments by Category" />
            <CompactPieChartSkeleton title="Course Catalog Status" />
          </>
        )}
      </section>

      <Card padding="md" className="mt-6">
        <div className="flex flex-col gap-1 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="font-display text-base font-bold">Trainer Performance</h3>
            <p className="text-sm text-muted">Top trainers ranked by rating and student reach.</p>
          </div>
          <p className="text-sm text-muted">{topTrainers.length} active trainers</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <th className="pb-3 pr-4">Trainer</th>
                <th className="pb-3 pr-4">Courses</th>
                <th className="pb-3 pr-4">Students</th>
                <th className="pb-3 pr-4">Rating</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {topTrainers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted">No trainer data available yet.</td>
                </tr>
              ) : (
                topTrainers.map((t) => (
                  <tr key={t.id} className="enterprise-table-row">
                    <td className="py-3 pr-4 font-medium">{t.name}</td>
                    <td className="py-3 pr-4">{t.courses}</td>
                    <td className="py-3 pr-4">{t.students.toLocaleString()}</td>
                    <td className="py-3 pr-4">{t.rating}</td>
                    <td className="py-3 capitalize">{t.availability}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="md" className="mt-6">
        <h3 className="font-display text-base font-bold">Platform Snapshot</h3>
        <p className="mt-0.5 text-sm text-muted">Key operational metrics from your workspace</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Revenue', value: `$${(stats?.revenue ?? 0).toLocaleString()}` },
            { label: 'Total Enrollments', value: (stats?.enrollments ?? 0).toLocaleString() },
            { label: 'Certificates Issued', value: (stats?.certificatesIssued ?? 0).toLocaleString() },
            { label: 'Avg Course Rating', value: (data?.avgRating ?? 0).toFixed(1) },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-canvas-deep p-5 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">{s.label}</p>
              <p className="mt-2 font-display text-2xl font-bold text-primary">{s.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
