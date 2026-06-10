'use client';

import { usePathname } from 'next/navigation';
import { StudentShell } from '@/layouts/student-layout';

export default function StudentRootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === '/student/login') return <>{children}</>;
  return <StudentShell>{children}</StudentShell>;
}
