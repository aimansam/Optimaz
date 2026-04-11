import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-slate-900 text-white shadow-sm shadow-black/20 hover:bg-black hover:shadow-md hover:shadow-black/30 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100': variant === 'primary',
            'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:active:bg-slate-600': variant === 'secondary',
            'text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200': variant === 'ghost',
            'bg-red-500 text-white shadow-sm shadow-red-500/25 hover:bg-red-600 active:scale-[0.98]': variant === 'danger',
          },
          {
            'h-7 px-3 text-xs gap-1.5': size === 'sm',
            'h-9 px-4 text-sm gap-2': size === 'md',
            'h-11 px-6 text-base gap-2': size === 'lg',
            'h-9 w-9 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

