'use client';

import { Badge, Card, PageLoader } from '@/components/ui';
import type { StudentDashboardData } from '@/data/types';
import { apiJson } from '@/lib/http/client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<StudentDashboardData['courses']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson<StudentDashboardData>('/api/student/dashboard')
      .then((d) => setCourses(d.courses))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader variant="compact" />;

  return (
    <>
      <h1 className="font-display text-2xl font-bold">My Courses</h1>
      <p className="mt-1 text-muted">Courses you are enrolled in or approved for.</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {courses.length === 0 ? (
          <Card padding="md"><p className="text-muted">No approved courses yet. Enrollments pending admin approval will appear here once approved.</p></Card>
        ) : (
          courses.map((course) => (
            <Card key={course.id} padding="none" className="overflow-hidden">
              <div className="relative h-40">
                <Image src={course.image} alt={course.title} fill className="object-cover" />
              </div>
              <div className="p-5">
                <Badge variant="primary">{course.category}</Badge>
                <h3 className="mt-2 font-display font-bold">{course.title}</h3>
                <p className="mt-1 text-sm text-muted">{course.instructor} · {course.duration}</p>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
