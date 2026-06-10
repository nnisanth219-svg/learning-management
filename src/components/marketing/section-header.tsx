import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}

export function SectionHeader({ eyebrow, title, description, align = 'center', className }: SectionHeaderProps) {
  return (
    <div className={cn(align === 'center' && 'text-center', className)}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-secondary">{eyebrow}</p>
      ) : null}
      <h2 className="page-section-title text-balance">{title}</h2>
      {description ? (
        <p className={cn('page-section-desc mt-4', align === 'center' && 'mx-auto max-w-2xl')}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
