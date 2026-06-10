import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary-light hover:shadow-md active:scale-[0.98]',
  secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90',
  outline: 'border border-primary/30 bg-surface text-primary hover:border-primary hover:bg-primary-soft',
  ghost: 'text-foreground hover:bg-subtle',
  danger: 'bg-danger text-white shadow-sm hover:bg-danger/90',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-sm',
};

export function buttonClasses(
  variant: NonNullable<ButtonProps['variant']> = 'primary',
  size: NonNullable<ButtonProps['size']> = 'md',
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => (
    <button ref={ref} className={buttonClasses(variant, size, className)} {...props} />
  ),
);

Button.displayName = 'Button';
