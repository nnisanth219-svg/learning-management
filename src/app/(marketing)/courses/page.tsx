'use client';

import { CourseCard } from '@/components/marketing/course-card';
import { SectionHeader } from '@/components/marketing/section-header';
import type { Course } from '@/data/types';
import { CATEGORIES, COURSES } from '@/data/mock';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  useEffect(() => {
    fetch('/api/public/courses')
      .then((r) => r.json())
      .then((d: { courses?: Course[] }) => {
        if (d.courses?.length) setCourses(d.courses);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        !search ||
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.instructor.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || c.category === category;
      const matchDifficulty = difficulty === 'All' || c.difficulty === difficulty;
      return matchSearch && matchCategory && matchDifficulty;
    });
  }, [courses, search, category, difficulty]);

  return (
    <>
      <section className="bg-hero-gradient px-4 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="font-display text-display-md">Explore Our Courses</h1>
          <p className="mx-auto mt-4 max-w-xl text-white/80">
            Premium courses across technology, design, business, data science, and leadership.
          </p>
        </div>
      </section>

      <section className="px-4 py-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="glass-card flex flex-col gap-4 p-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="Search courses, instructors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="enterprise-input !pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    category === cat ? 'bg-primary text-white shadow-sm' : 'bg-subtle text-muted hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted" />
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="enterprise-input !w-auto">
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <p className="mt-6 text-sm text-muted">Showing {filtered.length} of {courses.length} courses</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="mt-12 text-center">
              <SectionHeader title="No courses found" description="Try adjusting your search or filters." />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
