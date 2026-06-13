import { cn } from '@/lib/utils';
import { type SelectHTMLAttributes, forwardRef } from 'react';

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, style, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        style={{
          border: '1px solid var(--card-border)',
          background: 'var(--card-bg)',
          color: 'var(--foreground)',
          ...style,
        }}
        className={cn(
          'input-themed flex h-9 w-full rounded-xl px-3 py-2 text-sm transition-all duration-150 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';
