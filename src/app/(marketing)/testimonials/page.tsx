'use client';

import { SectionHeader } from '@/components/marketing/section-header';
import { TestimonialCarousel } from '@/components/marketing/testimonial-carousel';
import { TESTIMONIALS } from '@/data/mock';
import { Play, Star } from 'lucide-react';
import Image from 'next/image';

export default function TestimonialsPage() {
  return (
    <>
      <section className="bg-hero-gradient px-4 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="font-display text-display-md">Student Success Stories</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Real stories from learners who transformed their careers with EduVantage.
          </p>
        </div>
      </section>

      <section className="px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <TestimonialCarousel testimonials={TESTIMONIALS} />
        </div>
      </section>

      <section className="bg-soft-gradient px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="Video Testimonials" description="Hear directly from our graduates." />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.slice(0, 3).map((t) => (
              <div key={t.id} className="premium-card group overflow-hidden">
                <div className="relative aspect-video bg-foreground/5">
                  <Image src={t.avatar} alt={t.name} fill className="object-cover opacity-80" />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/30 transition-colors group-hover:bg-foreground/40">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg transition-transform group-hover:scale-110">
                      <Play className="h-6 w-6 text-primary" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display font-bold">{t.name}</h3>
                  <p className="text-sm text-muted">{t.role} at {t.company}</p>
                  <div className="mt-2 flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader title="All Reviews" />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className="premium-card p-6">
                <div className="flex items-start gap-4">
                  <Image src={t.avatar} alt={t.name} width={48} height={48} className="rounded-full" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold">{t.name}</p>
                        <p className="text-xs text-muted">{t.role} at {t.company}</p>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-muted">&ldquo;{t.text}&rdquo;</p>
                    <p className="mt-2 text-xs font-medium text-primary">{t.course}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
