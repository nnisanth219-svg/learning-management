import { AnalyticsDashboard } from '@/components/dashboard/analytics-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Analytics' };

export default function ReportsPage() {
  return <AnalyticsDashboard />;
}
