'use client';

import { CourseForm, type CourseFormValues } from '@/components/dashboard/course-form';
import { CourseImage } from '@/components/dashboard/course-image';
import { ExportButton } from '@/components/dashboard/export-button';
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs';
import { PageHeader } from '@/components/dashboard/page-header';
import { Badge, Button, Card, FormModal, PageLoader } from '@/components/ui';
import type { Course, IssuedCertificate, LearningProgress } from '@/data/types';
import { apiJson } from '@/lib/http/client';
import { Clock, Edit, Plus, Shield, Trash2, TrendingUp, Users } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useState } from 'react';

const COURSE_TABS = [
  { id: 'catalog', label: 'Catalog', href: '/dashboard/courses?tab=catalog' },
  { id: 'progress', label: 'Progress', href: '/dashboard/courses?tab=progress' },
  { id: 'certificates', label: 'Certificates', href: '/dashboard/courses?tab=certificates' },
];

async function uploadCourseImage(courseId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('category', 'course');
  form.append('courseId', courseId);
  const res = await fetch('/api/uploads', { method: 'POST', body: form, credentials: 'include' });
  const data = (await res.json()) as { error?: string; publicUrl?: string };
  if (!res.ok) throw new Error(data.error ?? 'Image upload failed.');
  if (!data.publicUrl) throw new Error('Upload succeeded but no public URL was returned.');
  return data.publicUrl;
}

export default function CoursesHubPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CoursesHubContent />
    </Suspense>
  );
}

function CoursesHubContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const tab = tabParam === 'progress' || tabParam === 'certificates' ? tabParam : 'catalog';

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [verifyId, setVerifyId] = useState('');
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [certificates, setCertificates] = useState<IssuedCertificate[]>([]);
  const [progressItems, setProgressItems] = useState<LearningProgress[]>([]);
  const [tabLoading, setTabLoading] = useState(false);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    try {
      const { courses: data } = await apiJson<{ courses: Course[] }>('/api/courses');
      setCourses(data);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'catalog') loadCourses();
  }, [tab, loadCourses]);

  useEffect(() => {
    if (tab !== 'certificates' && tab !== 'progress') return;
    setTabLoading(true);
    const load =
      tab === 'certificates'
        ? apiJson<{ certificates: IssuedCertificate[] }>('/api/certificates').then((d) => setCertificates(d.certificates))
        : apiJson<{ progress: LearningProgress[] }>('/api/progress').then((d) => setProgressItems(d.progress));
    load.catch(() => {
      if (tab === 'certificates') setCertificates([]);
      else setProgressItems([]);
    }).finally(() => setTabLoading(false));
  }, [tab]);

  function openCreate() {
    setEditingCourse(null);
    setShowForm(true);
  }

  function openEdit(course: Course) {
    setEditingCourse(course);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCourse(null);
  }

  async function saveCourse(values: CourseFormValues, imageFile: File | null) {
    setSaving(true);
    try {
      if (!editingCourse && !imageFile) {
        throw new Error('Please upload a cover image for this course.');
      }

      const payload = {
        ...values,
        rating: editingCourse?.rating ?? 0,
        reviews: editingCourse?.reviews ?? 0,
        enrollments: editingCourse?.enrollments ?? 0,
      };

      if (editingCourse) {
        let image = editingCourse.image;
        if (imageFile) image = await uploadCourseImage(editingCourse.id, imageFile);
        await apiJson(`/api/courses/${editingCourse.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ ...payload, image }),
        });
      } else {
        const { course } = await apiJson<{ course: Course }>('/api/courses', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const image = await uploadCourseImage(course.id, imageFile!);
        await apiJson(`/api/courses/${course.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ image }),
        });
      }

      closeForm();
      await loadCourses();
    } finally {
      setSaving(false);
    }
  }

  async function deleteCourse(course: Course) {
    if (!window.confirm(`Delete "${course.title}"? This cannot be undone.`)) return;
    await apiJson(`/api/courses/${course.id}`, { method: 'DELETE' });
    await loadCourses();
  }

  async function verifyCertificate() {
    setVerified(null);
    setVerifyMessage('');
    if (!verifyId.trim()) return;
    try {
      const res = await fetch(`/api/public/certificates/verify?code=${encodeURIComponent(verifyId.trim())}`);
      const data = (await res.json()) as { valid?: boolean; holderName?: string; programTitle?: string };
      if (data.valid) {
        setVerified(true);
        setVerifyMessage(`${data.holderName} — ${data.programTitle}`);
      } else {
        setVerified(false);
      }
    } catch {
      setVerified(false);
    }
  }

  const avgProgress = progressItems.length
    ? Math.round(progressItems.reduce((a, p) => a + p.progress, 0) / progressItems.length)
    : 0;
  const avgPerformance = progressItems.length
    ? Math.round(progressItems.reduce((a, p) => a + p.performance, 0) / progressItems.length)
    : 0;

  return (
    <>
      <PageHeader
        title="Courses"
        subtitle="Manage your catalog, track progress, and issue certificates."
        actions={
          tab === 'catalog' ? (
            <div className="flex flex-wrap gap-2">
              <ExportButton exportType="courses" label="Export Excel" />
              <Button type="button" size="sm" onClick={openCreate}>
                <Plus className="h-4 w-4" /> Create Course
              </Button>
            </div>
          ) : tab === 'progress' ? (
            <ExportButton exportType="progress" label="Export Excel" />
          ) : tab === 'certificates' ? (
            <ExportButton exportType="certificates" label="Export All" />
          ) : null
        }
      />

      <DashboardTabs tabs={COURSE_TABS} activeTab={tab} />

      <FormModal
        open={showForm}
        title={editingCourse ? 'Edit Course' : 'Create New Course'}
        subtitle="Upload a cover image — no URL field required. Images are stored in Firebase Storage."
        onClose={closeForm}
      >
        <CourseForm
          course={editingCourse}
          saving={saving}
          onSave={saveCourse}
          onCancel={closeForm}
        />
      </FormModal>

      {tab === 'catalog' && (
        <>
          {loading ? (
            <PageLoader variant="compact" />
          ) : courses.length === 0 ? (
            <Card padding="md">
              <p className="text-sm text-muted">No courses yet. Create your first course to get started.</p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {courses.map((course) => (
                <Card key={course.id} padding="none" className="overflow-hidden">
                  <div className="flex min-h-[160px]">
                    <div className="relative w-2/5 shrink-0">
                      <CourseImage src={course.image} alt={course.title} fill sizes="200px" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="primary">{course.category}</Badge>
                        <Badge variant={course.status === 'published' ? 'success' : course.status === 'draft' ? 'warning' : 'muted'} className="capitalize">
                          {course.status}
                        </Badge>
                      </div>
                      <h3 className="mt-2 font-display text-sm font-bold leading-snug">{course.title}</h3>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.duration}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrollments.toLocaleString()}</span>
                      </div>
                      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
                        <span className="font-bold text-primary">${course.price}</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            aria-label={`Edit ${course.title}`}
                            onClick={() => openEdit(course)}
                            className="rounded-lg p-2 text-muted hover:bg-subtle hover:text-primary"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Delete ${course.title}`}
                            onClick={() => deleteCourse(course)}
                            className="rounded-lg p-2 text-muted hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'progress' && (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Avg. Completion', value: `${avgProgress}%` },
              { label: 'Avg. Performance', value: `${avgPerformance}%` },
              { label: 'Active Learners', value: progressItems.length.toLocaleString() },
            ].map((stat) => (
              <Card key={stat.label} padding="md" className="text-center">
                <p className="text-sm text-muted">{stat.label}</p>
                <p className="mt-2 font-display text-2xl font-bold text-primary">{stat.value}</p>
              </Card>
            ))}
          </div>
          <Card padding="md">
            {tabLoading ? (
              <PageLoader variant="compact" />
            ) : progressItems.length === 0 ? (
              <p className="text-sm text-muted">No learning progress records yet.</p>
            ) : (
              <div className="space-y-4">
                {progressItems.map((item) => (
                  <div key={item.id} className="rounded-xl border border-border/60 p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-3 sm:w-56">
                        {item.studentAvatar ? (
                          <Image src={item.studentAvatar} alt={item.studentName} width={40} height={40} className="rounded-full object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-subtle text-xs font-bold text-primary">
                            {item.studentName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{item.studentName}</p>
                          <p className="text-xs text-muted">{item.courseName}</p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted">{item.completedLessons}/{item.totalLessons} lessons</span>
                          <span className="font-bold text-primary">{item.progress}%</span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-subtle">
                          <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${item.progress}%` }} />
                        </div>
                      </div>
                      <p className="flex items-center gap-1 text-sm font-bold text-success">
                        <TrendingUp className="h-3.5 w-3.5" /> {item.performance}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {tab === 'certificates' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card padding="md">
            <h3 className="flex items-center gap-2 font-display font-bold">
              <Shield className="h-5 w-5 text-primary" /> Verify Certificate
            </h3>
            <div className="mt-4 flex gap-2">
              <input
                className="enterprise-input"
                placeholder="EV-2025-XXXXX"
                value={verifyId}
                onChange={(e) => { setVerifyId(e.target.value); setVerified(null); setVerifyMessage(''); }}
              />
              <Button onClick={verifyCertificate}>Verify</Button>
            </div>
            {verified === true ? (
              <p className="mt-3 text-sm text-success">Certificate verified.{verifyMessage ? ` ${verifyMessage}` : ''}</p>
            ) : null}
            {verified === false ? <p className="mt-3 text-sm text-danger">Certificate not found.</p> : null}
          </Card>
          <Card padding="md" className="lg:col-span-2">
            <h3 className="font-display font-bold">Issued Certificates</h3>
            {tabLoading ? (
              <PageLoader variant="compact" />
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-left text-xs uppercase text-muted">
                      <th className="pb-3 pr-4">Code</th>
                      <th className="pb-3 pr-4">Holder</th>
                      <th className="pb-3 pr-4">Program</th>
                      <th className="pb-3 pr-4">Issued</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted">No certificates issued yet.</td>
                      </tr>
                    ) : (
                      certificates.map((cert) => (
                        <tr key={cert.id} className="enterprise-table-row">
                          <td className="py-3 pr-4 font-mono text-xs">{cert.publicCode}</td>
                          <td className="py-3 pr-4 font-medium">{cert.holderName}</td>
                          <td className="py-3 pr-4">{cert.programTitle}</td>
                          <td className="py-3 pr-4">{cert.issuedAt}</td>
                          <td className="py-3">
                            <ExportButton
                              exportType="certificates"
                              params={{ certificateId: cert.id }}
                              label="Download"
                              iconOnly
                              variant="ghost"
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
