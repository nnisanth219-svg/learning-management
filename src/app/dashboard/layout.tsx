import { DashboardLayout } from '@/layouts/dashboard-layout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
