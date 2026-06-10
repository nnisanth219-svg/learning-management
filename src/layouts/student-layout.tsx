'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogOut } from 'lucide-react';
import { APP_BRAND } from '@/lib/branding';
import { setSessionUser } from '@/lib/auth/session';

export function StudentShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setSessionUser(null);
    router.push('/user/login');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-border/60 bg-surface">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link href="/student" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hero-gradient">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-sm font-bold">{APP_BRAND.name} Student</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <Link href="/student" className="text-muted hover:text-foreground">Dashboard</Link>
            <Link href="/student/courses" className="text-muted hover:text-foreground">My Courses</Link>
            <Link href="/student/progress" className="text-muted hover:text-foreground">Progress</Link>
            <Link href="/student/certificates" className="text-muted hover:text-foreground">Certificates</Link>
            <Link href="/student/profile" className="text-muted hover:text-foreground">Profile</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden text-sm text-muted hover:text-foreground sm:inline">
              Website
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-sm text-muted hover:text-danger"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
