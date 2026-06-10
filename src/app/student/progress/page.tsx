'use client';

import { Card, PageLoader } from '@/components/ui';
import type { StudentDashboardData } from '@/data/types';
import { apiJson } from '@/lib/http/client';
import { useEffect, useState } from 'react';

export default function StudentProgressPage() {
  const [progress, setProgress] = useState<StudentDashboardData['progress']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiJson<StudentDashboardData>('/api/student/dashboard')
      .then((d) => setProgress(d.progress))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader variant="compact" />;

  return (
    <>
      <h1 className="font-display text-2xl font-bold">Learning Progress</h1>
      <div className="mt-8 space-y-4">
        {progress.length === 0 ? (
          <Card padding="md"><p className="text-muted">Progress tracking begins once your enrollment is approved.</p></Card>
        ) : (
          progress.map((item) => (
            <Card key={item.id} padding="md">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold">{item.courseName}</p>
                  <p className="text-sm text-muted">{item.completedLessons}/{item.totalLessons} lessons · {item.lastActivity}</p>
                </div>
                <p className="font-display text-xl font-bold text-primary">{item.progress}%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-subtle">
                <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
