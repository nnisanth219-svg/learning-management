import type { EnrollmentRequest, IssuedCertificate, LearningProgress, Student } from '@/data/types';
import type { Course } from '@/data/types';
import { getCategoryPieData, getCourseStatusPieData, getDashboardStats, getTopTrainers } from '@/lib/firestore/dashboard-stats';
import { listEnrollmentRequests } from '@/lib/firestore/enrollment-requests';
import { listIssuedCertificates, listStudentCertificates } from '@/lib/firestore/enrollments';
import { listProgress } from '@/lib/firestore/enrollments';
import { listAdminCourses } from '@/lib/firestore/courses';
import { listStudents } from '@/lib/firestore/students';
import { buildWorkbookBuffer, todaySlug, workbookResponse } from '@/lib/export/spreadsheet';

function studentRows(students: Student[]) {
  return [
    ['Student ID', 'Name', 'Email', 'Phone', 'Status', 'Enrolled Courses', 'Progress %', 'Joined'],
    ...students.map((s) => [
      s.studentCode ?? s.id,
      s.name,
      s.email,
      s.phone ?? '',
      s.status,
      s.enrolledCourses,
      s.progress,
      s.joinedAt,
    ]),
  ];
}

function enrollmentRows(enrollments: EnrollmentRequest[]) {
  return [
    ['ID', 'Applicant', 'Email', 'Phone', 'Course', 'Qualification', 'Status', 'Student ID', 'Created'],
    ...enrollments.map((e) => [
      e.id,
      e.fullName,
      e.email,
      e.phone,
      e.courseName,
      e.qualification,
      e.status,
      e.studentCode ?? '',
      e.createdAt,
    ]),
  ];
}

function courseRows(courses: Course[]) {
  return [
    ['ID', 'Title', 'Category', 'Instructor', 'Duration', 'Difficulty', 'Price', 'Status', 'Enrollments', 'Rating'],
    ...courses.map((c) => [
      c.id,
      c.title,
      c.category,
      c.instructor,
      c.duration,
      c.difficulty,
      c.price,
      c.status,
      c.enrollments,
      c.rating,
    ]),
  ];
}

function certificateRows(certs: IssuedCertificate[]) {
  return [
    ['Certificate Code', 'Holder', 'Program', 'Student ID', 'Issued Date', 'Status'],
    ...certs.map((c) => [c.publicCode, c.holderName, c.programTitle, c.studentId ?? '', c.issuedAt, c.status]),
  ];
}

function progressRows(items: LearningProgress[]) {
  return [
    ['Student', 'Course', 'Progress %', 'Lessons Completed', 'Total Lessons', 'Performance %', 'Last Activity'],
    ...items.map((p) => [
      p.studentName,
      p.courseName,
      p.progress,
      p.completedLessons,
      p.totalLessons,
      p.performance,
      p.lastActivity,
    ]),
  ];
}

export async function buildStudentsExport(ownerId: string) {
  const students = await listStudents(ownerId);
  const buffer = buildWorkbookBuffer([{ name: 'Students', rows: studentRows(students) }]);
  return workbookResponse(buffer, `students-${todaySlug()}.xlsx`);
}

export async function buildEnrollmentsExport(ownerId: string, status?: string) {
  const enrollments = await listEnrollmentRequests(ownerId, status as EnrollmentRequest['status'] | undefined);
  const buffer = buildWorkbookBuffer([{ name: 'Enrollments', rows: enrollmentRows(enrollments) }]);
  return workbookResponse(buffer, `enrollments-${todaySlug()}.xlsx`);
}

export async function buildCoursesExport(ownerId: string) {
  const courses = await listAdminCourses(ownerId);
  const buffer = buildWorkbookBuffer([{ name: 'Courses', rows: courseRows(courses) }]);
  return workbookResponse(buffer, `courses-${todaySlug()}.xlsx`);
}

export async function buildCertificatesExport(ownerId: string, certificateId?: string) {
  let certs = await listIssuedCertificates(ownerId);
  if (certificateId) certs = certs.filter((c) => c.id === certificateId);
  const buffer = buildWorkbookBuffer([{ name: 'Certificates', rows: certificateRows(certs) }]);
  const suffix = certificateId ? `certificate-${certificateId}` : `certificates-${todaySlug()}`;
  return workbookResponse(buffer, `${suffix}.xlsx`);
}

export async function buildStudentCertificatesExport(
  ownerId: string,
  studentId: string,
  certificateId?: string,
) {
  let certs = await listStudentCertificates(ownerId, studentId);
  if (certificateId) {
    certs = certs.filter((c) => c.id === certificateId);
    if (!certs.length) throw new Error('Certificate not found.');
  }
  const buffer = buildWorkbookBuffer([{ name: 'My Certificates', rows: certificateRows(certs) }]);
  const suffix = certificateId ? `certificate-${certificateId}` : `my-certificates-${todaySlug()}`;
  return workbookResponse(buffer, `${suffix}.xlsx`);
}

export async function buildSampleCertificateExport() {
  const buffer = buildWorkbookBuffer([
    {
      name: 'Sample Certificate',
      rows: [
        ['Certificate Code', 'Holder', 'Program', 'Student ID', 'Issued Date', 'Status'],
        ['EV-2025-08421', 'Jennifer Walsh', 'Professional Web Developer', 'EV-STU-2025-00001', '2025-06-01', 'active'],
      ],
    },
  ]);
  return workbookResponse(buffer, 'sample-certificate.xlsx');
}

export async function buildProgressExport(ownerId: string) {
  const items = await listProgress(ownerId);
  const buffer = buildWorkbookBuffer([{ name: 'Progress', rows: progressRows(items) }]);
  return workbookResponse(buffer, `learning-progress-${todaySlug()}.xlsx`);
}

export async function buildAnalyticsExport(ownerId: string) {
  const [stats, categoryPie, courseStatusPie, trainers] = await Promise.all([
    getDashboardStats(ownerId),
    getCategoryPieData(ownerId),
    getCourseStatusPieData(ownerId),
    getTopTrainers(ownerId),
  ]);

  const buffer = buildWorkbookBuffer([
    {
      name: 'Summary',
      rows: [
        ['Metric', 'Value'],
        ['Total Students', stats.totalStudents],
        ['Active Students', stats.activeStudents],
        ['Enrollments', stats.enrollments],
        ['Published Courses', stats.courses],
        ['Revenue', stats.revenue],
        ['Certificates Issued', stats.certificatesIssued],
        ['Pending Approvals', stats.pendingApprovals],
      ],
    },
    {
      name: 'Category Mix',
      rows: [['Category', 'Share %'], ...categoryPie.map((p) => [p.name, p.value])],
    },
    {
      name: 'Course Status',
      rows: [['Status', 'Share %'], ...courseStatusPie.map((p) => [p.name, p.value])],
    },
    {
      name: 'Trainers',
      rows: [
        ['Name', 'Courses', 'Students', 'Rating', 'Availability'],
        ...trainers.map((t) => [t.name, t.courses, t.students, t.rating, t.availability]),
      ],
    },
  ]);

  return workbookResponse(buffer, `analytics-report-${todaySlug()}.xlsx`);
}

export const EXPORT_TYPES = [
  'students',
  'enrollments',
  'courses',
  'certificates',
  'progress',
  'analytics',
] as const;

export type ExportType = (typeof EXPORT_TYPES)[number];

export function isExportType(value: string): value is ExportType {
  return (EXPORT_TYPES as readonly string[]).includes(value);
}
