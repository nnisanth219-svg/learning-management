'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';

export type DashboardTab = {
  id: string;
  label: string;
  href: string;
};

interface DashboardTabsProps {
  tabs: DashboardTab[];
  activeTab: string;
  className?: string;
}

export function DashboardTabs({ tabs, activeTab, className }: DashboardTabsProps) {
  return (
    <div className={cn('mb-6 flex flex-wrap gap-2 border-b border-border/60 pb-4', className)}>
      {tabs.map((tab) => {
        const active = activeTab === tab.id;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              'rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted hover:bg-subtle hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}

export function isDashboardSectionActive(pathname: string, href: string, tabPaths: string[]) {
  if (pathname === href) return true;
  return tabPaths.some((p) => pathname === p || pathname.startsWith(`${p}?`));
}
