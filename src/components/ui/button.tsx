import { cn } from '@/lib/utils';
import { type ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', style: propStyle, ...props }, ref) => {
    // Build inline style based on variant — uses CSS vars for full theme support
    const variantStyle: React.CSSProperties = (() => {
      if (variant === 'primary') return {
        background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.85))',
        color: '#ffffff',
        boxShadow: '0 2px 8px var(--glow)',
        ...propStyle,
      };
      if (variant === 'secondary') return {
        background: 'var(--muted-bg)',
        color: 'var(--foreground)',
        border: '1px solid var(--card-border)',
        ...propStyle,
      };
      if (variant === 'ghost') return {
        background: 'transparent',
        color: 'var(--muted-fg)',
        ...propStyle,
      };
      if (variant === 'danger') return {
        background: '#ef4444',
        color: '#ffffff',
        boxShadow: '0 2px 6px rgba(239,68,68,0.3)',
        ...propStyle,
      };
      return propStyle ?? {};
    })();

    return (
      <button
        ref={ref}
        style={variantStyle}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50',
          variant === 'primary' && 'hover:opacity-90 active:scale-[0.98]',
          variant === 'secondary' && 'hover:opacity-80 active:opacity-70',
          variant === 'ghost' && 'hover:opacity-80',
          variant === 'danger' && 'hover:opacity-90 active:scale-[0.97]',
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
