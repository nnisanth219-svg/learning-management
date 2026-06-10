import type { DashboardStats } from '@/data/types';
import { COURSES, DASHBOARD_STATS, ENROLLMENT_BY_CATEGORY, REVENUE_DATA } from '@/data/mock';
import { listAdminCourses } from '@/lib/firestore/courses';
import { listEnrollmentRequests } from '@/lib/firestore/enrollment-requests';
import { listIssuedCertificates } from '@/lib/firestore/enrollments';
import { listStudents } from '@/lib/firestore/students';
import { listTrainers } from '@/lib/firestore/trainers';

export type ChartPoint = { month: string; revenue: number; enrollments: number };
export type PieSlice = { name: string; value: number; color: string };

const CATEGORY_COLORS: Record<string, string> = {
  Technology: '#1E40AF',
  Business: '#4F46E5',
  Design: '#7C3AED',
  'Data Science': '#10B981',
  Leadership: '#F59E0B',
};

export async function getDashboardStats(ownerId: string): Promise<DashboardStats> {
  const [students, courses, enrollments, certificates] = await Promise.all([
    listStudents(ownerId),
    listAdminCourses(ownerId),
    listEnrollmentRequests(ownerId),
    listIssuedCertificates(ownerId),
  ]);

  const published = courses.filter((c) => c.status === 'published');
  const activeStudents = students.filter((s) => s.status === 'active').length;
  const approved = enrollments.filter((e) => e.status === 'approved').length;
  const pending = enrollments.filter((e) => e.status === 'pending' || e.status === 'new').length;
  const revenue = published.reduce((sum, c) => sum + c.price * Math.min(c.enrollments, 500), 0);

  if (!students.length && !courses.length) return DASHBOARD_STATS;

  return {
    totalStudents: students.length,
    activeStudents,
    trainers: (await listTrainers(ownerId)).length,
    courses: published.length,
    revenue,
    enrollments: approved,
    certificatesIssued: certificates.length,
    pendingApprovals: pending,
  };
}

export async function getRevenueChartData(_ownerId: string): Promise<ChartPoint[]> {
  return REVENUE_DATA.slice(-7).map((d) => ({ month: d.month, revenue: d.revenue, enrollments: d.enrollments }));
}

export async function getCategoryPieData(ownerId: string): Promise<PieSlice[]> {
  const courses = await listAdminCourses(ownerId);
  if (!courses.length) {
    return ENROLLMENT_BY_CATEGORY.map((d) => ({ name: d.name, value: d.value, color: d.color }));
  }

  const totals: Record<string, number> = {};
  for (const course of courses) {
    if (course.status !== 'published') continue;
    totals[course.category] = (totals[course.category] ?? 0) + course.enrollments;
  }
  const entries = Object.entries(totals);
  const sum = entries.reduce((a, [, v]) => a + v, 0) || 1;
  return entries.map(([name, value]) => ({
    name,
    value: Math.round((value / sum) * 100),
    color: CATEGORY_COLORS[name] ?? '#64748B',
  }));
}

export async function getCourseStatusPieData(ownerId: string): Promise<PieSlice[]> {
  const courses = await listAdminCourses(ownerId);
  if (!courses.length) {
    return [
      { name: 'Published', value: 70, color: '#10B981' },
      { name: 'Draft', value: 20, color: '#F59E0B' },
      { name: 'Archived', value: 10, color: '#94A3B8' },
    ];
  }

  const counts = { published: 0, draft: 0, archived: 0 };
  for (const c of courses) {
    if (c.status === 'published') counts.published++;
    else if (c.status === 'archived') counts.archived++;
    else counts.draft++;
  }
  const total = courses.length || 1;
  return [
    { name: 'Published', value: Math.round((counts.published / total) * 100), color: '#10B981' },
    { name: 'Draft', value: Math.round((counts.draft / total) * 100), color: '#F59E0B' },
    { name: 'Archived', value: Math.round((counts.archived / total) * 100), color: '#94A3B8' },
  ];
}

export async function getTopTrainers(ownerId: string) {
  const trainers = await listTrainers(ownerId);
  return [...trainers].sort((a, b) => b.rating - a.rating).slice(0, 5);
}

export async function getCourseRatingAverage(ownerId: string) {
  const courses = await listAdminCourses(ownerId);
  const list = courses.length ? courses : COURSES;
  return list.reduce((a, c) => a + c.rating, 0) / Math.max(list.length, 1);
}
