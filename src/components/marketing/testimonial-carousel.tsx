'use client';

import type { Testimonial } from '@/data/types';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  const [active, setActive] = useState(0);
  const current = testimonials[active];

  const prev = () => setActive((i) => (i === 0 ? testimonials.length - 1 : i - 1));
  const next = () => setActive((i) => (i === testimonials.length - 1 ? 0 : i + 1));

  return (
    <div className="relative">
      <div className="glass-card mx-auto max-w-4xl p-8 md:p-12">
        <Quote className="h-10 w-10 text-accent/30" />
        <p className="mt-6 font-display text-xl font-medium leading-relaxed text-foreground md:text-2xl">
          &ldquo;{current.text}&rdquo;
        </p>
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={current.avatar}
              alt={current.name}
              width={56}
              height={56}
              className="rounded-full object-cover ring-2 ring-primary/20"
            />
            <div>
              <p className="font-display font-bold text-foreground">{current.name}</p>
              <p className="text-sm text-muted">
                {current.role} at {current.company}
              </p>
              <div className="mt-1 flex gap-0.5">
                {Array.from({ length: current.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-warning text-warning" />
                ))}
              </div>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium uppercase tracking-wider text-muted">Course</p>
            <p className="text-sm font-semibold text-primary">{current.course}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={prev}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface shadow-sm transition-all hover:border-primary hover:text-primary"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                i === active ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-primary/40',
              )}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface shadow-sm transition-all hover:border-primary hover:text-primary"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
