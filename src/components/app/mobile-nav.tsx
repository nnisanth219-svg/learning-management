'use client';

import { APP_BRAND } from '@/lib/branding';
import { ADMIN_NAV, ADMIN_SECTION_ROUTES } from '@/lib/navigation/admin-nav';
import { cn } from '@/lib/utils';
import { GraduationCap, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

function isActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  const sectionRoutes = ADMIN_SECTION_ROUTES[href];
  if (sectionRoutes) return sectionRoutes.some((r) => pathname === r || pathname.startsWith(`${r}/`));
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="border-b border-border/60 bg-surface px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-hero-gradient">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-display text-sm font-bold">{APP_BRAND.name}</span>
        </Link>
        <button type="button" onClick={() => setOpen(!open)} className="rounded-lg p-2" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <nav className="mt-3 flex flex-col gap-1 border-t border-border/60 pt-3">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium',
                isActive(pathname, item.href) ? 'bg-primary-soft text-primary' : 'text-muted',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
