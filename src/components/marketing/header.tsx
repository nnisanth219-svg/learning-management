'use client';

import { APP_BRAND } from '@/lib/branding';
import { MARKETING_NAV } from '@/lib/navigation/admin-nav';
import { getSessionUser, setSessionUser } from '@/lib/auth/session';
import { cn } from '@/lib/utils';
import { GraduationCap, LayoutDashboard, LogIn, Menu, Shield, User, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type AuthState = { role: 'admin' | 'student' | null; name?: string };

export function MarketingHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [auth, setAuth] = useState<AuthState>({ role: null });

  useEffect(() => {
    const local = getSessionUser();
    if (local?.role) {
      setAuth({ role: local.role, name: local.name });
      return;
    }
    fetch('/api/auth/session', { credentials: 'include' })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean; user?: { name: string; role?: string }; role?: string }) => {
        if (d.authenticated && d.role) {
          setAuth({ role: d.role as 'admin' | 'student', name: d.user?.name });
        }
      })
      .catch(() => {});
  }, [pathname]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setSessionUser(null);
    setAuth({ role: null });
    router.push('/');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-hero-gradient shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            {APP_BRAND.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {MARKETING_NAV.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-lg px-4 py-2 transition-colors',
                pathname === link.href ? 'nav-link-active' : 'nav-link',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {auth.role === 'admin' ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary-soft px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="px-2 text-sm text-muted hover:text-foreground">
                Sign out
              </button>
            </>
          ) : auth.role === 'student' ? (
            <>
              <Link
                href="/student"
                className="flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary-soft px-3 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                <User className="h-4 w-4" /> My Dashboard
              </Link>
              <button type="button" onClick={handleLogout} className="px-2 text-sm text-muted hover:text-foreground">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/user/login"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-muted transition-colors hover:bg-subtle hover:text-primary"
              >
                <LogIn className="h-4 w-4" /> Student Login
              </Link>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-lg border border-border/80 px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
              >
                <Shield className="h-4 w-4" /> Admin Login
              </Link>
            </>
          )}
          <Link href="/courses" className="btn-primary !py-2.5 !text-sm !px-4">
            Get Started
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-foreground lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen ? (
        <div className="border-t border-border/40 bg-white px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {MARKETING_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5',
                  pathname === link.href ? 'nav-link-active bg-primary-soft' : 'nav-link',
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-border/40 pt-3">
              {auth.role === 'admin' ? (
                <>
                  <Link href="/dashboard" className="btn-primary text-center" onClick={() => setMobileOpen(false)}>
                    Admin Dashboard
                  </Link>
                  <button type="button" onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn-outline text-center">
                    Sign out
                  </button>
                </>
              ) : auth.role === 'student' ? (
                <>
                  <Link href="/student" className="btn-primary text-center" onClick={() => setMobileOpen(false)}>
                    My Dashboard
                  </Link>
                  <button type="button" onClick={() => { handleLogout(); setMobileOpen(false); }} className="btn-outline text-center">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/user/login" className="btn-outline text-center" onClick={() => setMobileOpen(false)}>
                    Student Login
                  </Link>
                  <Link href="/login" className="btn-outline text-center" onClick={() => setMobileOpen(false)}>
                    Admin Login
                  </Link>
                </>
              )}
              <Link href="/courses" className="btn-primary text-center" onClick={() => setMobileOpen(false)}>
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
