'use client';

import { APP_BRAND } from '@/lib/branding';
import { GraduationCap, Linkedin, Mail, MapPin, Twitter } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const FOOTER_LINKS = [
  { href: '/courses', label: 'Courses' },
  { href: '/about', label: 'About' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/certifications', label: 'Certifications' },
  { href: '/contact', label: 'Contact' },
  { href: '/user/login', label: 'Student Login' },
  { href: '/login', label: 'Admin Login' },
];

export function MarketingFooter() {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setNewsletterStatus('loading');
    try {
      const res = await fetch('/api/public/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error('Failed');
      setNewsletterStatus('success');
      setEmail('');
    } catch {
      setNewsletterStatus('error');
    }
  }

  return (
    <footer className="border-t border-border/60 bg-foreground text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hero-gradient">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold">{APP_BRAND.name}</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
              {APP_BRAND.description}
            </p>
            <div className="mt-5 flex gap-3">
              {[Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/90">
              Explore
            </h4>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-wider text-white/90">
              Stay Updated
            </h4>
            <p className="mt-2 text-sm text-white/60">Get course launches and learning tips in your inbox.</p>
            <form onSubmit={handleNewsletter} className="mt-4 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-white/30 focus:outline-none"
              />
              <button
                type="submit"
                disabled={newsletterStatus === 'loading'}
                className="shrink-0 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-white/90"
              >
                {newsletterStatus === 'loading' ? '…' : 'Subscribe'}
              </button>
            </form>
            {newsletterStatus === 'success' ? (
              <p className="mt-2 text-xs text-emerald-400">Subscribed successfully.</p>
            ) : newsletterStatus === 'error' ? (
              <p className="mt-2 text-xs text-red-400">Could not subscribe. Try again.</p>
            ) : null}
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-white/40">
          &copy; {new Date().getFullYear()} {APP_BRAND.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
