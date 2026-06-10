'use client';

import { APP_BRAND } from '@/lib/branding';
import { ADMIN_NAV, ADMIN_SECTION_ROUTES } from '@/lib/navigation/admin-nav';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ICONS = {
  layout: LayoutDashboard,
  users: Users,
  enroll: ClipboardList,
  book: BookOpen,
  bar: BarChart3,
  settings: Settings,
} as const;

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  const sectionRoutes = ADMIN_SECTION_ROUTES[href];
  if (sectionRoutes) return sectionRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border/80 bg-surface lg:flex">
      <div className="relative border-b border-border/80 px-5 py-5">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/[0.06] via-transparent to-accent/[0.04]" />
        <Link href="/dashboard" className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hero-gradient shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-display text-sm font-bold">{APP_BRAND.name}</p>
            <p className="text-[11px] text-muted">Admin</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {ADMIN_NAV.map((item) => {
          const Icon = ICONS[item.icon];
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary-soft text-primary shadow-xs'
                  : 'text-muted hover:bg-subtle hover:text-foreground',
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/80 p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-subtle hover:text-foreground"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Back to Website
        </Link>
      </div>
    </aside>
  );
}
