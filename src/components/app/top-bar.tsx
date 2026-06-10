'use client';

import { NOTIFICATIONS } from '@/data/mock';
import { getSessionUser, setSessionUser } from '@/lib/auth/session';
import { Bell, LogOut, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function TopBar() {
  const router = useRouter();
  const unread = NOTIFICATIONS.filter((n) => !n.read).length;
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    const session = getSessionUser();
    if (session) setUser({ name: session.name, email: session.email });
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setSessionUser(null);
    router.push('/login');
    router.refresh();
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SA';

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-surface/80 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="relative hidden max-w-md flex-1 md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            placeholder="Search students, courses, trainers..."
            className="enterprise-input !h-9 !pl-9 !text-xs"
          />
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/settings?tab=notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/80 bg-surface transition-colors hover:bg-subtle"
          >
            <Bell className="h-4 w-4 text-muted" />
            {unread > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {unread}
              </span>
            ) : null}
          </Link>
          <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-surface px-2 py-1.5 sm:gap-2.5 sm:px-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-hero-gradient text-xs font-bold text-white">
              {initials}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold">{user?.name ?? 'Super Admin'}</p>
              <p className="text-[10px] text-muted">{user?.email ?? 'admin@eduvantage.com'}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-danger"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
