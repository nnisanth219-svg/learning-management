'use client';

import { Card, Spinner } from '@/components/ui';
import type { PieSlice } from '@/lib/firestore/dashboard-stats';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

type CompactPieProps = {
  title: string;
  description: string;
  data: PieSlice[];
};

export function CompactPieChart({ title, description, data }: CompactPieProps) {
  return (
    <Card padding="md" className="h-full">
      <h3 className="font-display text-sm font-bold">{title}</h3>
      <p className="mt-0.5 text-xs text-muted">{description}</p>
      <div className="mt-4 h-44 min-h-[11rem] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={176}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={58}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${Number(value)}%`, 'Share']} />
            <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function CompactPieChartSkeleton({ title }: { title: string }) {
  return (
    <Card padding="md" className="h-full">
      <h3 className="font-display text-sm font-bold">{title}</h3>
      <div className="mt-6 flex h-44 items-center justify-center">
        <Spinner size="md" />
      </div>
    </Card>
  );
}
