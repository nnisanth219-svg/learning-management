import { APP_BRAND } from '@/lib/branding';
import { BookOpen, GraduationCap, ShieldCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const HIGHLIGHTS = [
  { icon: BookOpen, label: 'My Courses', desc: 'Access enrolled courses and materials' },
  { icon: TrendingUp, label: 'Track Progress', desc: 'Monitor lessons and performance' },
  { icon: ShieldCheck, label: 'Enrollment Status', desc: 'See approval updates in real time' },
];

export function StudentLoginPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-hero-gradient px-10 py-12 text-white lg:flex lg:w-[48%] lg:flex-col lg:justify-between xl:px-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
      <div className="absolute -left-20 top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      <div className="relative">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold">{APP_BRAND.name}</span>
        </Link>
        <h1 className="mt-10 font-display text-4xl font-bold leading-tight tracking-tight xl:text-[2.75rem]">
          Student Portal
          <span className="block text-white/80">Your Learning Hub</span>
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
          Sign in with the email and password you created during course enrollment to access your dashboard, courses, and progress.
        </p>
      </div>

      <ul className="relative mt-10 space-y-5">
        {HIGHLIGHTS.map(({ icon: Icon, label, desc }) => (
          <li key={label} className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold">{label}</p>
              <p className="text-sm text-white/70">{desc}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="relative mt-10 text-xs text-white/50">
        New here? <Link href="/courses" className="underline hover:text-white">Browse courses</Link> and enroll to create your account.
      </p>
    </div>
  );
}
