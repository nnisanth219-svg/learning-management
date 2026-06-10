'use client';

import { EnrollmentModal } from '@/components/marketing/enrollment-modal';
import { MarketingImage } from '@/components/marketing/marketing-image';
import { Badge } from '@/components/ui';
import type { Course } from '@/data/types';
import { cn } from '@/lib/utils';
import { BookOpen, Clock, Star, Users } from 'lucide-react';
import { useState } from 'react';

interface CourseCardProps {
  course: Course;
  className?: string;
}

const CATEGORY_ACCENT: Record<string, string> = {
  Technology: 'from-blue-600 to-indigo-600',
  'Data Science': 'from-emerald-600 to-teal-600',
  Leadership: 'from-amber-500 to-orange-600',
  Design: 'from-violet-600 to-purple-600',
  Business: 'from-indigo-600 to-blue-600',
};

export function CourseCard({ course, className }: CourseCardProps) {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const accent = CATEGORY_ACCENT[course.category] ?? 'from-primary to-secondary';

  return (
    <>
      <article
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-premium',
          className,
        )}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-subtle">
          <MarketingImage
            src={course.image}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
            cinematic
          />
          <div className={cn('absolute inset-x-0 top-0 h-1 bg-gradient-to-r', accent)} />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/10 to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            {course.featured ? <Badge variant="secondary">Featured</Badge> : null}
            <Badge variant="primary">{course.category}</Badge>
          </div>
          <Badge variant="muted" className="absolute right-4 top-4 bg-white/90 text-foreground">
            {course.difficulty}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-warning">
            <Star className="h-3.5 w-3.5 fill-warning" />
            {course.rating}
            <span className="font-normal text-muted">({course.reviews.toLocaleString()} reviews)</span>
          </div>

          <h3 className="mt-2 font-display text-lg font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
            {course.title}
          </h3>

          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{course.description}</p>

          <div className="mt-4 flex items-center gap-3 border-t border-border/60 pt-4">
            <MarketingImage
              src={course.instructorAvatar}
              alt={course.instructor}
              width={36}
              height={36}
              className="rounded-full object-cover ring-2 ring-primary/10"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{course.instructor}</p>
              <p className="text-xs text-muted">Instructor</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] font-medium text-muted">
            <span className="flex items-center gap-1 rounded-lg bg-subtle px-2 py-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-primary" /> {course.duration}
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-subtle px-2 py-1.5">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" /> {course.lessons}
            </span>
            <span className="flex items-center gap-1 rounded-lg bg-subtle px-2 py-1.5">
              <Users className="h-3.5 w-3.5 shrink-0 text-primary" /> {(course.enrollments / 1000).toFixed(1)}K
            </span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted">From</p>
              <p className="font-display text-2xl font-bold text-primary">${course.price}</p>
            </div>
            <button
              type="button"
              onClick={() => setEnrollOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-primary-light"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </article>

      <EnrollmentModal course={course} open={enrollOpen} onClose={() => setEnrollOpen(false)} />
    </>
  );
}
