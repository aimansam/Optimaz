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
    <div className={compact ? 'flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 px-3 py-6 text-center dark:border-slate-800' : 'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center dark:border-slate-800 dark:bg-slate-900/40'}>
      <div className={compact ? 'mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:text-slate-500 dark:ring-slate-800' : 'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-900 dark:text-slate-500 dark:ring-slate-800'}>
        {icon}
      </div>
      <p className={compact ? 'text-xs font-semibold text-slate-600 dark:text-slate-300' : 'text-base font-semibold text-slate-800 dark:text-slate-100'}>{title}</p>
      <p className={compact ? 'mt-1 max-w-44 text-xs leading-5 text-slate-400 dark:text-slate-500' : 'mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400'}>{description}</p>
      {action && <div className={compact ? 'mt-3' : 'mt-5'}>{action}</div>}
    </div>
  );
}
