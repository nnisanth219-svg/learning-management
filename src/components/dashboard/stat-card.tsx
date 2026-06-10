import { Card } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type StatIconTone = 'blue' | 'indigo' | 'purple' | 'green' | 'orange';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  iconTone?: StatIconTone;
}

const iconToneStyles: Record<StatIconTone, string> = {
  blue: 'bg-primary-soft text-primary border-primary/15',
  indigo: 'bg-secondary-soft text-secondary border-secondary/15',
  purple: 'bg-accent-soft text-accent border-accent/15',
  green: 'bg-success-soft text-success border-success/20',
  orange: 'bg-warning-soft text-warning border-warning/20',
};

export function StatCard({ label, value, change, icon: Icon, trend = 'neutral', iconTone = 'blue' }: StatCardProps) {
  return (
    <Card padding="md" className="group transition-all duration-300 hover:border-primary/20 hover:shadow-premium">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 font-display text-[1.75rem] font-bold leading-none tracking-tight">{value}</p>
          {change ? (
            <p
              className={cn(
                'mt-2 flex items-center gap-1 text-xs font-semibold',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-danger',
                trend === 'neutral' && 'text-muted',
              )}
            >
              {trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : null}
              {trend === 'down' ? <ArrowDownRight className="h-3.5 w-3.5" /> : null}
              {change}
            </p>
          ) : null}
        </div>
        <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border', iconToneStyles[iconTone])}>
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </div>
      </div>
    </Card>
  );
}
