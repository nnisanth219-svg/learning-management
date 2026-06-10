import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  glass?: boolean;
}

const paddingMap = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({ className, padding = 'md', glass = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(glass ? 'glass-card' : 'enterprise-card', paddingMap[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}
