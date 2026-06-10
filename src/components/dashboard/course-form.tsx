'use client';

import { CourseImage } from '@/components/dashboard/course-image';
import { Button, ButtonSpinner } from '@/components/ui';
import type { Course, CourseStatus, Difficulty } from '@/data/types';
import { CATEGORIES } from '@/data/mock';
import { Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type CourseFormValues = {
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorAvatar: string;
  duration: string;
  difficulty: Difficulty;
  price: number;
  modules: number;
  lessons: number;
  status: CourseStatus;
  featured: boolean;
};

const CATEGORY_OPTIONS = CATEGORIES.filter((c) => c !== 'All');
const DIFFICULTIES: Difficulty[] = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const STATUSES: CourseStatus[] = ['draft', 'published', 'archived'];

const emptyForm = (): CourseFormValues => ({
  title: '',
  description: '',
  category: 'Technology',
  instructor: '',
  instructorAvatar: '',
  duration: '',
  difficulty: 'Beginner',
  price: 0,
  modules: 0,
  lessons: 0,
  status: 'draft',
  featured: false,
});

function courseToForm(course: Course): CourseFormValues {
  return {
    title: course.title,
    description: course.description,
    category: course.category,
    instructor: course.instructor,
    instructorAvatar: course.instructorAvatar,
    duration: course.duration,
    difficulty: course.difficulty,
    price: course.price,
    modules: course.modules,
    lessons: course.lessons,
    status: course.status,
    featured: Boolean(course.featured),
  };
}

type Props = {
  course?: Course | null;
  saving?: boolean;
  onSave: (values: CourseFormValues, imageFile: File | null) => Promise<void>;
  onCancel: () => void;
};

export function CourseForm({ course, saving, onSave, onCancel }: Props) {
  const [values, setValues] = useState<CourseFormValues>(course ? courseToForm(course) : emptyForm());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setValues(course ? courseToForm(course) : emptyForm());
    setImageFile(null);
    setPreviewUrl(null);
    setError('');
  }, [course]);

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const displayImage = previewUrl ?? course?.image ?? '';

  function update<K extends keyof CourseFormValues>(key: K, value: CourseFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!course && !imageFile) {
      setError('Please upload a cover image for this course.');
      return;
    }
    if (course && !course.image && !imageFile) {
      setError('Please upload a cover image for this course.');
      return;
    }
    try {
      await onSave(values, imageFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save course.');
    }
  }

  const uploadLabel = useMemo(() => {
    if (imageFile) return imageFile.name;
    if (course?.image) return 'Choose a new image to replace the current cover';
    return 'Choose image file (required)';
  }, [imageFile, course?.image]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Course Title *</label>
            <input
              required
              value={values.title}
              onChange={(e) => update('title', e.target.value)}
              className="enterprise-input mt-1.5"
              placeholder="Full-Stack Web Development"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Category *</label>
            <select
              required
              value={values.category}
              onChange={(e) => update('category', e.target.value)}
              className="enterprise-input mt-1.5"
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="text-sm font-medium">Description *</label>
            <textarea
              required
              rows={3}
              value={values.description}
              onChange={(e) => update('description', e.target.value)}
              className="enterprise-input mt-1.5 !h-auto resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Instructor *</label>
            <input
              required
              value={values.instructor}
              onChange={(e) => update('instructor', e.target.value)}
              className="enterprise-input mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Duration *</label>
            <input
              required
              value={values.duration}
              onChange={(e) => update('duration', e.target.value)}
              className="enterprise-input mt-1.5"
              placeholder="12 weeks"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Difficulty *</label>
            <select
              value={values.difficulty}
              onChange={(e) => update('difficulty', e.target.value as Difficulty)}
              className="enterprise-input mt-1.5"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Price (USD) *</label>
            <input
              required
              type="number"
              min={0}
              step={1}
              value={values.price}
              onChange={(e) => update('price', Number(e.target.value))}
              className="enterprise-input mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Modules</label>
            <input
              type="number"
              min={0}
              value={values.modules}
              onChange={(e) => update('modules', Number(e.target.value))}
              className="enterprise-input mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Lessons</label>
            <input
              type="number"
              min={0}
              value={values.lessons}
              onChange={(e) => update('lessons', Number(e.target.value))}
              className="enterprise-input mt-1.5"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Status *</label>
            <select
              value={values.status}
              onChange={(e) => update('status', e.target.value as CourseStatus)}
              className="enterprise-input mt-1.5"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={values.featured}
                onChange={(e) => update('featured', e.target.checked)}
                className="rounded border-border"
              />
              Featured course
            </label>
          </div>
          <div className="lg:col-span-2">
            <label className="text-sm font-medium">Upload Cover Image *</label>
            <label className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border/80 bg-subtle/50 px-4 py-3 text-sm text-muted hover:border-primary/40">
              <Upload className="h-4 w-4 shrink-0" />
              {uploadLabel}
              <input
                type="file"
                accept="image/*"
                required={!course}
                className="hidden"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </label>
            <p className="mt-1.5 text-xs text-muted">JPEG, PNG, or WebP. Stored in Firebase Storage.</p>
          </div>
        </div>

        {displayImage ? (
          <div className="relative h-40 w-full max-w-sm overflow-hidden rounded-xl bg-subtle">
            <CourseImage src={displayImage} alt="Course preview" fill sizes="320px" />
          </div>
        ) : null}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="inline-flex items-center gap-2">
            {saving ? <ButtonSpinner /> : null}
            {course ? 'Update Course' : 'Create Course'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>Cancel</Button>
        </div>
      </form>
  );
}

export { emptyForm, courseToForm };
