import { MarketingImage } from '@/components/marketing/marketing-image';
import { SectionHeader } from '@/components/marketing/section-header';
import { TrainerCard } from '@/components/marketing/trainer-card';
import { CORE_VALUES, TEAM, TIMELINE, TRAINERS } from '@/data/mock';
import { IMAGES } from '@/lib/images';
import { Globe, Lightbulb, Shield, Star } from 'lucide-react';
import Image from 'next/image';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About Us' };

const VALUE_ICONS = { star: Star, lightbulb: Lightbulb, globe: Globe, shield: Shield };

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero-gradient px-4 py-20 text-white lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/70">About EduVantage</p>
          <h1 className="mt-4 font-display text-display-md md:text-display-lg">Empowering Learners Worldwide</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
            Since 2015, we have been on a mission to make world-class education accessible to everyone,
            everywhere. From startups to Fortune 500 companies, organizations trust EduVantage.
          </p>
        </div>
      </section>

      <section className="px-4 py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <MarketingImage src={IMAGES.team} alt="Our team" width={600} height={400} className="rounded-3xl shadow-premium" cinematic />
          <div>
            <SectionHeader eyebrow="Our Story" title="Company Overview" align="left" />
            <p className="mt-6 text-muted leading-relaxed">
              EduVantage was founded with a simple belief: everyone deserves access to transformative education.
              What started as a small online course platform has grown into a global enterprise learning ecosystem
              serving 250,000+ active learners across 40 countries.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="glass-card p-5">
                <h3 className="font-display font-bold text-primary">Mission</h3>
                <p className="mt-2 text-sm text-muted">
                  Democratize access to premium education and empower every learner to achieve their full potential.
                </p>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-display font-bold text-secondary">Vision</h3>
                <p className="mt-2 text-sm text-muted">
                  Become the world&apos;s most trusted platform for lifelong learning and professional development.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-soft-gradient px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="What We Stand For" title="Core Values" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CORE_VALUES.map((value) => {
              const Icon = VALUE_ICONS[value.icon as keyof typeof VALUE_ICONS];
              return (
                <div key={value.title} className="premium-card p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Our Journey" title="Company Timeline" />
          <div className="relative mt-12">
            <div className="absolute left-1/2 hidden h-full w-px -translate-x-1/2 bg-gradient-to-b from-primary via-secondary to-accent md:block" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <div key={item.year} className={`flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="premium-card inline-block p-6">
                      <span className="text-sm font-bold text-primary">{item.year}</span>
                      <h3 className="mt-1 font-display text-lg font-bold">{item.title}</h3>
                      <p className="mt-2 text-sm text-muted">{item.description}</p>
                    </div>
                  </div>
                  <div className="hidden h-4 w-4 shrink-0 rounded-full bg-primary ring-4 ring-primary-soft md:block" />
                  <div className="hidden flex-1 md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-soft-gradient px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Leadership" title="Meet Our Team" />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map((member) => (
              <div key={member.id} className="premium-card overflow-hidden text-center">
                <MarketingImage src={member.photo} alt={member.name} width={300} height={300} className="aspect-square w-full object-cover" cinematic />
                <div className="p-5">
                  <h3 className="font-display font-bold">{member.name}</h3>
                  <p className="text-sm font-medium text-primary">{member.role}</p>
                  <p className="mt-2 text-sm text-muted">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Expert Faculty" title="Featured Trainers" description="Learn from the industry's brightest minds." />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TRAINERS.slice(0, 3).map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
