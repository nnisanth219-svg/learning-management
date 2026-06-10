import { APP_BRAND } from '@/lib/branding';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Sign In',
  description: `Sign in to the ${APP_BRAND.name} admin CRM dashboard.`,
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
