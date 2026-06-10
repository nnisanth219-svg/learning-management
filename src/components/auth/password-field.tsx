'use client';

import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

type Props = {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  error?: string;
  autoComplete?: string;
  className?: string;
};

export function PasswordField({
  id,
  name = 'password',
  label,
  value,
  onChange,
  placeholder = 'Enter your password',
  required,
  minLength,
  error,
  autoComplete = 'current-password',
  className,
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={className}>
      <label htmlFor={id ?? name} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id ?? name}
          name={name}
          type={visible ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cn(
            'enterprise-input pr-11',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
          )}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted transition-colors hover:text-foreground"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? <p className="mt-1.5 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
