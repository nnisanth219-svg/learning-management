import { APP_BRAND } from '@/lib/branding';
import { BarChart3, GraduationCap, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';

const HIGHLIGHTS = [
  { icon: Users, label: 'Student Management', desc: 'Enrollments, profiles, and progress' },
  { icon: BarChart3, label: 'Analytics Dashboard', desc: 'Revenue, growth, and course insights' },
  { icon: ShieldCheck, label: 'Secure Access', desc: 'Firebase-powered admin authentication' },
];

export function AdminLoginPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-hero-gradient px-10 py-12 text-white lg:flex lg:w-[48%] lg:flex-col lg:justify-between xl:px-14">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
      <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

      <div className="relative">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="font-display text-xl font-bold">{APP_BRAND.name}</span>
        </Link>
        <h1 className="mt-10 font-display text-4xl font-bold leading-tight tracking-tight xl:text-[2.75rem]">
          Admin CRM
          <span className="block text-white/80">Control Center</span>
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
          Manage students, enrollments, courses, and analytics from one powerful dashboard built for modern EdTech teams.
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
        &copy; {new Date().getFullYear()} {APP_BRAND.name}. Secure admin access only.
      </p>
    </div>
  );
}
