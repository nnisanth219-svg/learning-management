'use client';

import { MarketingImage } from '@/components/marketing/marketing-image';
import { IMAGES } from '@/lib/images';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="relative min-h-[94vh] overflow-hidden bg-slate-950">
      <MarketingImage
        src={IMAGES.hero}
        alt="Students collaborating in a modern learning environment"
        fill
        priority
        sizes="100vw"
        className="marketing-hero-image"
      />
      <div className="marketing-hero-overlay absolute inset-0" />
      <div className="hero-text-scrim absolute inset-y-0 left-0 w-full max-w-3xl" />

      <div className="relative mx-auto flex min-h-[94vh] max-w-7xl flex-col justify-center px-4 py-28 lg:px-8">
        <div className="max-w-3xl">
          <p className="hero-eyebrow animate-fade-in-up">
            <Sparkles className="h-4 w-4 text-sky-300" aria-hidden />
            Premium Enterprise Learning
          </p>

          <h1 className="hero-headline animate-fade-in-up animate-delay-100 mt-8 text-balance">
            <span className="block text-white">Transforming Learning</span>
            <span className="hero-headline-accent mt-1 block">Into Success</span>
          </h1>

          <p className="hero-subline animate-fade-in-up animate-delay-200 mt-8 max-w-xl text-balance">
            Elevate skills with expert-led courses, live training, and certifications trusted by leading
            organizations worldwide.
          </p>

          <div className="animate-fade-in-up animate-delay-300 mt-11 flex flex-wrap items-center gap-4">
            <Link href="/courses" className="hero-cta-primary">
              Explore Courses
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="hero-cta-secondary">
              <Play className="h-4 w-4" />
              Watch Demo
            </Link>
          </div>

          <dl className="animate-fade-in-up animate-delay-400 mt-14 grid grid-cols-3 gap-6 border-t border-white/15 pt-8">
            {[
              { label: 'Learners', value: '250K+' },
              { label: 'Courses', value: '1,200+' },
              { label: 'Rating', value: '4.9/5' },
            ].map((item) => (
              <div key={item.label}>
                <dt className="text-xs font-semibold uppercase tracking-widest text-white/55">{item.label}</dt>
                <dd className="mt-1 font-display text-2xl font-bold tracking-tight text-white">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
