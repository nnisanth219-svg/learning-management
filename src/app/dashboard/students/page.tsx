'use client';

import { ExportButton } from '@/components/dashboard/export-button';
import { DashboardTabs } from '@/components/dashboard/dashboard-tabs';
import { PageHeader } from '@/components/dashboard/page-header';
import { StudentForm, type StudentFormValues } from '@/components/dashboard/student-form';
import { TrainerForm, type TrainerFormValues } from '@/components/dashboard/trainer-form';
import { Badge, Button, Card, FormModal, PageLoader } from '@/components/ui';
import type { Course, Student, StudentStatus, Trainer } from '@/data/types';
import { apiJson } from '@/lib/http/client';
import { Filter, Plus, Search, Star } from 'lucide-react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';

const PEOPLE_TABS = [
  { id: 'students', label: 'Students', href: '/dashboard/students?tab=students' },
  { id: 'trainers', label: 'Trainers', href: '/dashboard/students?tab=trainers' },
];

const statusVariant: Record<StudentStatus, 'success' | 'primary' | 'muted' | 'warning' | 'danger'> = {
  active: 'success',
  inactive: 'muted',
  graduated: 'primary',
  suspended: 'danger',
};

async function uploadTrainerPhoto(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  form.append('category', 'trainer');
  const res = await fetch('/api/uploads', { method: 'POST', body: form, credentials: 'include' });
  const data = (await res.json()) as { error?: string; publicUrl?: string };
  if (!res.ok) throw new Error(data.error ?? 'Photo upload failed.');
  if (!data.publicUrl) throw new Error('Upload succeeded but no public URL was returned.');
  return data.publicUrl;
}

export default function PeoplePage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PeoplePageContent />
    </Suspense>
  );
}

function PeoplePageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') === 'trainers' ? 'trainers' : 'students';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [trainerModalOpen, setTrainerModalOpen] = useState(false);
  const [studentFormKey, setStudentFormKey] = useState(0);
  const [trainerFormKey, setTrainerFormKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const loadStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (courseFilter !== 'all') params.set('courseId', courseFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const { students: data } = await apiJson<{ students: Student[] }>(`/api/students?${params}`);
      setStudents(data);
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, [search, courseFilter, statusFilter]);

  const loadTrainers = useCallback(async () => {
    setLoadingTrainers(true);
    try {
      const { trainers: data } = await apiJson<{ trainers: Trainer[] }>('/api/trainers');
      setTrainers(data);
    } catch {
      setTrainers([]);
    } finally {
      setLoadingTrainers(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'students') loadStudents();
  }, [tab, loadStudents]);

  useEffect(() => {
    if (tab === 'trainers') loadTrainers();
  }, [tab, loadTrainers]);

  useEffect(() => {
    setStudentModalOpen(false);
    setTrainerModalOpen(false);
  }, [tab]);

  useEffect(() => {
    apiJson<{ courses: Course[] }>('/api/courses').then((d) => setCourses(d.courses)).catch(() => {});
  }, []);

  const filteredStudents = useMemo(() => students, [students]);

  function openStudentModal() {
    setStudentFormKey((k) => k + 1);
    setStudentModalOpen(true);
  }

  function openTrainerModal() {
    setTrainerFormKey((k) => k + 1);
    setTrainerModalOpen(true);
  }

  async function toggleStatus(student: Student) {
    const next = student.status === 'active' ? 'inactive' : 'active';
    await apiJson(`/api/students/${student.id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) });
    setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, status: next } : s)));
  }

  async function saveStudent(values: StudentFormValues) {
    setSaving(true);
    try {
      const { student } = await apiJson<{ student: Student }>('/api/students', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      setStudentModalOpen(false);
      setStudents((prev) => [student, ...prev]);
    } catch (e) {
      throw e;
    } finally {
      setSaving(false);
    }
  }

  async function saveTrainer(values: TrainerFormValues, photoFile: File | null) {
    setSaving(true);
    try {
      const photo = photoFile ? await uploadTrainerPhoto(photoFile) : undefined;
      const skills = values.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const { trainer } = await apiJson<{ trainer: Trainer }>('/api/trainers', {
        method: 'POST',
        body: JSON.stringify({ ...values, skills, photo }),
      });
      setTrainerModalOpen(false);
      setTrainers((prev) => [trainer, ...prev]);
    } catch (e) {
      throw e;
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader
        title="People"
        subtitle="Manage enrolled students and trainers."
        actions={
          tab === 'students' ? (
            <>
              <ExportButton exportType="students" label="Export Excel" />
              <Button type="button" size="sm" onClick={openStudentModal}>
                <Plus className="h-4 w-4" /> Add Student
              </Button>
            </>
          ) : (
            <Button type="button" size="sm" onClick={openTrainerModal}>
              <Plus className="h-4 w-4" /> Add Trainer
            </Button>
          )
        }
      />

      <DashboardTabs tabs={PEOPLE_TABS} activeTab={tab} />

      <FormModal
        open={studentModalOpen}
        title="Add New Student"
        subtitle="Create a student record in your workspace."
        onClose={() => setStudentModalOpen(false)}
      >
        <StudentForm
          key={studentFormKey}
          formKey={studentFormKey}
          saving={saving}
          onSave={saveStudent}
          onCancel={() => setStudentModalOpen(false)}
        />
      </FormModal>

      <FormModal
        open={trainerModalOpen}
        title="Add New Trainer"
        subtitle="Upload a photo and save trainer details to Firebase."
        onClose={() => setTrainerModalOpen(false)}
      >
        <TrainerForm
          key={trainerFormKey}
          formKey={trainerFormKey}
          saving={saving}
          onSave={saveTrainer}
          onCancel={() => setTrainerModalOpen(false)}
        />
      </FormModal>

      {tab === 'students' ? (
        <Card padding="md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="search"
                placeholder="Search by name, email, or student ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="enterprise-input !pl-10"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="h-4 w-4 text-muted" />
              <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="enterprise-input !w-auto">
                <option value="all">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="enterprise-input !w-auto">
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
          {loadingStudents ? (
            <div className="mt-6">
              <PageLoader variant="compact" />
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    <th className="pb-3 pr-4">Student</th>
                    <th className="pb-3 pr-4">Student ID</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Courses</th>
                    <th className="pb-3 pr-4">Progress</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted">No students found.</td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id} className="enterprise-table-row">
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-3">
                            <Image src={student.avatar || '/placeholder.png'} alt={student.name} width={36} height={36} className="rounded-full object-cover" />
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-muted">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-xs">{student.studentCode}</td>
                        <td className="py-3.5 pr-4"><Badge variant={statusVariant[student.status]}>{student.status}</Badge></td>
                        <td className="py-3.5 pr-4">{student.enrolledCourses} enrolled</td>
                        <td className="py-3.5 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 overflow-hidden rounded-full bg-subtle">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${student.progress}%` }} />
                            </div>
                            <span className="text-xs font-medium">{student.progress}%</span>
                          </div>
                        </td>
                        <td className="py-3.5">
                          <Button type="button" size="sm" variant="outline" onClick={() => toggleStatus(student)}>
                            {student.status === 'active' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      ) : loadingTrainers ? (
        <PageLoader variant="compact" />
      ) : trainers.length === 0 ? (
        <Card padding="md">
          <p className="text-sm text-muted">No trainers yet. Click <strong>Add Trainer</strong> to create one.</p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {trainers.map((trainer) => (
            <Card key={trainer.id} padding="none" className="overflow-hidden transition-all hover:shadow-premium">
              <div className="relative h-40">
                <Image src={trainer.photo} alt={trainer.name} fill className="object-cover" sizes="400px" />
              </div>
              <div className="p-5">
                <h3 className="font-display font-bold">{trainer.name}</h3>
                <p className="text-sm text-muted">{trainer.title}</p>
                <div className="mt-3 flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 font-medium">
                    <Star className="h-4 w-4 fill-warning text-warning" /> {trainer.rating}
                  </span>
                  <span className="text-muted">{trainer.courses} courses</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
