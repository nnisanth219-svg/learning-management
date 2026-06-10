'use client';

import { Card } from '@/components/ui';
import { ENROLLMENT_BY_CATEGORY, REVENUE_DATA } from '@/data/mock';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function RevenueChart() {
  return (
    <Card padding="md">
      <h3 className="page-section-title !text-base">Revenue Overview</h3>
      <p className="page-section-desc">Monthly revenue and enrollment trends</p>
      <div className="mt-6 h-72 min-h-[18rem] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
          <AreaChart data={REVENUE_DATA}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1E40AF" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#1E40AF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
              contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#1E40AF" fill="url(#revenueGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function EnrollmentChart() {
  return (
    <Card padding="md">
      <h3 className="page-section-title !text-base">Enrollment Analytics</h3>
      <p className="page-section-desc">Monthly enrollment growth</p>
      <div className="mt-6 h-72 min-h-[18rem] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={288}>
          <BarChart data={REVENUE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E2E8F0' }} />
            <Bar dataKey="enrollments" fill="#4F46E5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export function CategoryPieChart() {
  return (
    <Card padding="md">
      <h3 className="font-display text-sm font-bold">Enrollments by Category</h3>
      <p className="mt-0.5 text-xs text-muted">Distribution across course categories</p>
      <div className="mt-4 h-44 min-h-[11rem] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={176}>
          <PieChart>
            <Pie
              data={ENROLLMENT_BY_CATEGORY}
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={58}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
            >
              {ENROLLMENT_BY_CATEGORY.map((entry) => (
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
