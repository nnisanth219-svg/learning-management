import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-11 w-11',
};

type SpinnerProps = {
  size?: SpinnerSize;
  className?: string;
};

/** Branded ring spinner for inline and embedded use. */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('relative inline-flex shrink-0', sizeClasses[size], className)}
    >
      <span className="absolute inset-0 rounded-full border-2 border-primary/10" />
      <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary border-r-secondary/80" />
    </span>
  );
}

type PageLoaderProps = {
  className?: string;
  /** Use `compact` inside cards or chart placeholders. */
  variant?: 'page' | 'compact' | 'inline';
};

/** Centered loader for pages, sections, and Suspense fallbacks. */
export function PageLoader({ className, variant = 'page' }: PageLoaderProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center',
        variant === 'page' && 'min-h-[12rem] py-12',
        variant === 'compact' && 'min-h-[8rem] py-8',
        variant === 'inline' && 'py-4',
        className,
      )}
    >
      <Spinner size={variant === 'compact' ? 'md' : 'lg'} />
    </div>
  );
}

/** Spinner sized for buttons — pair with the normal button label (no loading text). */
export function ButtonSpinner({ className }: { className?: string }) {
  return <Spinner size="sm" className={className} />;
}
