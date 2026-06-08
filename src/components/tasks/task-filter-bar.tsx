'use client';

import { useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProjects } from '@/hooks/use-projects';
import { cn, PRIORITY_CONFIG } from '@/lib/utils';
import type { Priority, TaskStatus } from '@/lib/types';

export type DueFilter = 'all' | 'today' | 'this_week' | 'overdue' | 'no_date';

export interface TaskFilters {
  query: string;
  status: TaskStatus | '';
  priority: Priority | '';
  projectId: string;
  dueFilter: DueFilter;
}

export const DEFAULT_TASK_FILTERS: TaskFilters = {
  query: '',
  status: '',
  priority: '',
  projectId: '',
  dueFilter: 'all',
};

interface TaskFilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

const STATUS_OPTIONS: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

const DUE_OPTIONS: { value: DueFilter; label: string }[] = [
  { value: 'all', label: 'Any date' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'no_date', label: 'No date' },
];

export function TaskFilterBar({ filters, onChange }: TaskFilterBarProps) {
  const { data: projects = [] } = useProjects();

  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.query) count++;
    if (filters.status) count++;
    if (filters.priority) count++;
    if (filters.projectId) count++;
    if (filters.dueFilter !== 'all') count++;
    return count;
  }, [filters]);

  function set<K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function clearAll() {
    onChange(DEFAULT_TASK_FILTERS);
  }

  return (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      {/* Search row */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filters.query}
          onChange={e => set('query', e.target.value)}
          placeholder="Search tasks…"
          className="h-8 w-full rounded-lg border border-slate-200 bg-transparent pl-8 pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
        />
        {filters.query && (
          <button
            type="button"
            onClick={() => set('query', '')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Filter chips row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status */}
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-900">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('status', opt.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors',
                filters.status === opt.value
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              )}
              aria-pressed={filters.status === opt.value}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={e => set('priority', e.target.value as Priority | '')}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          aria-label="Filter by priority"
        >
          <option value="">Any priority</option>
          {(Object.entries(PRIORITY_CONFIG) as [Priority, typeof PRIORITY_CONFIG[Priority]][]).map(([key, cfg]) => (
            <option key={key} value={key}>{cfg.label}</option>
          ))}
        </select>

        {/* Project */}
        {projects.length > 0 && (
          <select
            value={filters.projectId}
            onChange={e => set('projectId', e.target.value)}
            className="h-8 max-w-[160px] truncate rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            aria-label="Filter by project"
          >
            <option value="">Any project</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}

        {/* Due date */}
        <select
          value={filters.dueFilter}
          onChange={e => set('dueFilter', e.target.value as DueFilter)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 focus:border-slate-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          aria-label="Filter by due date"
        >
          {DUE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Clear all */}
        {activeCount > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="h-8 gap-1.5 text-[11px]"
          >
            <X className="h-3 w-3" />
            Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
          </Button>
        )}
      </div>
    </div>
  );
}
