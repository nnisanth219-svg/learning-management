'use client';

import { CompactPieChart, CompactPieChartSkeleton } from '@/components/dashboard/compact-pie-chart';
import { EnrollmentChart, RevenueChart } from '@/components/dashboard/charts';
import { PageHeader } from '@/components/dashboard/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import type { DashboardStats } from '@/data/types';
import type { PieSlice } from '@/lib/firestore/dashboard-stats';
import { apiJson } from '@/lib/http/client';
import { BookOpen, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

type DashboardPayload = {
  stats: DashboardStats;
  charts: { categoryPie: PieSlice[]; courseStatusPie: PieSlice[] };
};

export function DashboardOverview() {
  const [data, setData] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    apiJson<DashboardPayload>('/api/dashboard').then(setData).catch(() => setData(null));
  }, []);

  const stats = data?.stats;

  return (
    <>
      <PageHeader title="Overview" subtitle="Key metrics and trends at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Students"
          value={(stats?.totalStudents ?? 0).toLocaleString()}
          change={`${stats?.activeStudents ?? 0} active`}
          icon={Users}
          trend="up"
          iconTone="blue"
        />
        <StatCard
          label="Active Enrollments"
          value={(stats?.enrollments ?? 0).toLocaleString()}
          change={`${stats?.pendingApprovals ?? 0} pending review`}
          icon={TrendingUp}
          trend="up"
          iconTone="green"
        />
        <StatCard
          label="Published Courses"
          value={(stats?.courses ?? 0).toLocaleString()}
          change={`${stats?.trainers ?? 0} trainers`}
          icon={BookOpen}
          trend="neutral"
          iconTone="purple"
        />
        <StatCard
          label="Revenue"
          value={`$${(stats?.revenue ?? 0).toLocaleString()}`}
          change={`${stats?.certificatesIssued ?? 0} certificates`}
          icon={DollarSign}
          trend="up"
          iconTone="indigo"
        />
      </div>

      <section className="mt-8">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-muted">Performance Trends</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <RevenueChart />
          <EnrollmentChart />
        </div>
      </section>

      <section className="mt-8 rounded-[20px] border border-border/60 bg-surface p-5 shadow-card sm:p-6">
        <div className="mb-5 flex flex-col gap-1 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-base font-bold text-primary">Analytics</h2>
            <p className="text-sm text-muted">Category mix, catalog status, and operational snapshot.</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-3">
            {data ? (
              <CompactPieChart
                title="Enrollments by Category"
                description="Course category distribution"
                data={data.charts.categoryPie}
              />
            ) : (
              <CompactPieChartSkeleton title="Enrollments by Category" />
            )}
          </div>
          <div className="lg:col-span-3">
            {data ? (
              <CompactPieChart
                title="Course Catalog Status"
                description="Published vs draft vs archived"
                data={data.charts.courseStatusPie}
              />
            ) : (
              <CompactPieChartSkeleton title="Course Catalog Status" />
            )}
          </div>
          <div className="lg:col-span-6">
            <div className="h-full rounded-[16px] border border-border/60 bg-canvas-deep p-5">
              <h3 className="font-display text-sm font-bold">Platform Snapshot</h3>
              <p className="mt-0.5 text-xs text-muted">Live counts from your workspace</p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-surface p-4 shadow-sm">
                  <dt className="text-xs font-medium text-muted">Pending Approvals</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-primary">{stats?.pendingApprovals ?? '—'}</dd>
                </div>
                <div className="rounded-xl bg-surface p-4 shadow-sm">
                  <dt className="text-xs font-medium text-muted">Certificates Issued</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-primary">{stats?.certificatesIssued ?? '—'}</dd>
                </div>
                <div className="rounded-xl bg-surface p-4 shadow-sm">
                  <dt className="text-xs font-medium text-muted">Active Students</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-primary">{stats?.activeStudents ?? '—'}</dd>
                </div>
                <div className="rounded-xl bg-surface p-4 shadow-sm">
                  <dt className="text-xs font-medium text-muted">Published Courses</dt>
                  <dd className="mt-1 font-display text-2xl font-bold text-primary">{stats?.courses ?? '—'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
