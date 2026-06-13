import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div
      className={compact ? 'flex flex-col items-center justify-center rounded-xl px-3 py-6 text-center' : 'flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center'}
      style={{
        border: `1px dashed var(--card-border)`,
        background: 'var(--muted-bg)',
      }}
    >
      <div
        className={compact ? 'mb-2 flex h-9 w-9 items-center justify-center rounded-xl' : 'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl'}
        style={{
          background: 'var(--card-bg)',
          color: 'var(--muted-fg)',
          border: '1px solid var(--card-border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        {icon}
      </div>
      <p
        className={compact ? 'text-xs font-semibold' : 'text-base font-semibold'}
        style={{ color: 'var(--foreground)', opacity: 0.85 }}
      >
        {title}
      </p>
      <p
        className={compact ? 'mt-1 max-w-44 text-xs leading-5' : 'mt-1 max-w-sm text-sm leading-6'}
        style={{ color: 'var(--muted-fg)' }}
      >
        {description}
      </p>
      {action && <div className={compact ? 'mt-3' : 'mt-5'}>{action}</div>}
    </div>
  );
}
