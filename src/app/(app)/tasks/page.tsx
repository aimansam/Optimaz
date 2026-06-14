'use client';

import { useState, useMemo } from 'react';
import { Plus, ArrowUpDown, ListTodo, AlertCircle, ArrowUp, ArrowRight, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { TaskList } from '@/components/tasks/task-list';
import { TaskFilterBar, DEFAULT_TASK_FILTERS, type TaskFilters } from '@/components/tasks/task-filter-bar';
import { TaskQuestionFlow } from '@/components/tasks/task-question-flow';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTasksByStatus, useUpdateTask } from '@/hooks/use-tasks';
import { isOverdue } from '@/lib/utils';
import type { Task, Priority, TaskStatus } from '@/lib/types';

const PRIORITY_ORDER: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  urgent: {
    label: 'Urgent',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800/40',
    icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
  },
  high: {
    label: 'High',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800/40',
    icon: <ArrowUp className="h-3.5 w-3.5 text-orange-500" />,
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800/40',
    icon: <ArrowRight className="h-3.5 w-3.5 text-amber-500" />,
  },
  low: {
    label: 'Low',
    color: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    border: 'border-slate-200 dark:border-slate-700/40',
    icon: <Minus className="h-3.5 w-3.5 text-slate-400" />,
  },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; border: string }> = {
  todo: {
    label: 'To Do',
    color: 'text-slate-600 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-800/40',
    border: 'border-slate-200 dark:border-slate-700/40',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800/40',
  },
  done: {
    label: 'Done',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800/40',
  },
};

type GroupBy = 'none' | 'priority' | 'status';

function CollapsibleGroup({
  title,
  count,
  colorClass,
  bgClass,
  borderClass,
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  count: number;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`rounded-xl border ${borderClass} overflow-hidden`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors ${bgClass} hover:opacity-90`}
      >
        {icon}
        <span className={`text-xs font-bold uppercase tracking-wider ${colorClass}`}>{title}</span>
        <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${colorClass} opacity-70`}>{count}</span>
        <span className="ml-auto text-slate-400">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <div className="px-4 py-3 bg-white dark:bg-slate-900/60">
          {children}
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  const { data: allTasks, isLoading } = useTasksByStatus(500);
  const updateTask = useUpdateTask();
  const [addOpen, setAddOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_TASK_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [groupBy, setGroupBy] = useState<GroupBy>('none');

  const activeTasks = useMemo(
    () => (allTasks ?? []).filter(t => !t.archived_at && t.status !== 'done'),
    [allTasks]
  );

  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    return activeTasks.filter(t => {
      if (filters.query && !t.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
      if (filters.status && t.status !== filters.status) return false;
      if (filters.priority && t.priority !== filters.priority) return false;
      if (filters.projectId && t.project_id !== filters.projectId) return false;
      if (filters.dueFilter === 'today' && t.due_date !== todayStr) return false;
      if (filters.dueFilter === 'this_week' && t.due_date && t.due_date > weekEndStr) return false;
      if (filters.dueFilter === 'overdue' && !isOverdue(t.due_date, t.due_time)) return false;
      if (filters.dueFilter === 'no_date' && t.due_date) return false;
      return true;
    });
  }, [activeTasks, filters]);

  function sortByPriority(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0));
  }

  function handleSortByPriority() {
    const sorted = sortByPriority(filteredTasks);
    const updates = sorted
      .map((task, index) => ({ id: task.id, position: (index + 1) * 1000 }))
      .filter(({ id, position }) => {
        const original = activeTasks.find(t => t.id === id);
        return original && original.position !== position;
      });
    for (const { id, position } of updates) {
      updateTask.mutate({ id, position });
    }
  }

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: activeTasks.length,
      urgent: activeTasks.filter(t => t.priority === 'urgent').length,
      overdue: activeTasks.filter(t => t.due_date && t.due_date < today).length,
      dueToday: activeTasks.filter(t => t.due_date === today).length,
    };
  }, [activeTasks]);

  const groupedByPriority = useMemo(() => {
    const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];
    return priorities.map(p => ({
      priority: p,
      tasks: filteredTasks.filter(t => t.priority === p),
    })).filter(g => g.tasks.length > 0);
  }, [filteredTasks]);

  const groupedByStatus = useMemo(() => {
    const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];
    return statuses.map(s => ({
      status: s,
      tasks: (allTasks ?? []).filter(t => !t.archived_at && t.status === s).filter(t => {
        if (filters.query && !t.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
        if (filters.priority && t.priority !== filters.priority) return false;
        if (filters.projectId && t.project_id !== filters.projectId) return false;
        return true;
      }),
    })).filter(g => g.tasks.length > 0);
  }, [allTasks, filters]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-slate-100 px-4 py-3 dark:border-slate-800 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ListTodo className="h-5 w-5 shrink-0" style={{ color: 'rgb(var(--accent))' }} />
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              All Tasks
            </h1>
            {!isLoading && (
              <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: 'rgb(var(--accent))' }}>
                {activeTasks.length}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {/* Group by selector */}
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value as GroupBy)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="none">No grouping</option>
              <option value="priority">Group by Priority</option>
              <option value="status">Group by Status</option>
            </select>

            {/* Sort by priority */}
            <Button size="sm" variant="secondary" onClick={handleSortByPriority} title="Reorder all tasks by priority">
              <ArrowUpDown className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sort by priority</span>
            </Button>

            {/* Add task */}
            <Button size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-2.5 flex flex-wrap items-center gap-3">
          {[
            { label: 'Total active', value: stats.total, color: 'text-slate-600 dark:text-slate-300' },
            { label: 'Urgent', value: stats.urgent, color: 'text-red-600 dark:text-red-400' },
            { label: 'Overdue', value: stats.overdue, color: 'text-rose-600 dark:text-rose-400' },
            { label: 'Due today', value: stats.dueToday, color: 'text-amber-600 dark:text-amber-400' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-1">
              <span className={`text-sm font-bold ${stat.color}`}>{stat.value}</span>
              <span className="text-xs text-slate-400">{stat.label}</span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setShowFilters(v => !v)}
            className={`ml-auto text-xs font-medium transition-colors ${showFilters ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            {showFilters ? 'Hide filters' : 'Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="mt-3">
            <TaskFilterBar filters={filters} onChange={setFilters} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain px-4 pt-4 sm:px-6" style={{ background: 'var(--background)', paddingBottom: 'max(6rem, calc(5.5rem + env(safe-area-inset-bottom, 0px)))' }}>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        ) : groupBy === 'priority' ? (
          <div className="space-y-3">
            {groupedByPriority.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No tasks match your filters.</p>
            ) : groupedByPriority.map(({ priority, tasks }) => {
              const cfg = PRIORITY_CONFIG[priority];
              return (
                <CollapsibleGroup
                  key={priority}
                  title={cfg.label}
                  count={tasks.length}
                  colorClass={cfg.color}
                  bgClass={cfg.bg}
                  borderClass={cfg.border}
                  icon={cfg.icon}
                  defaultOpen={priority === 'urgent' || priority === 'high'}
                >
                  <TaskList tasks={tasks} showAddButton={false} />
                </CollapsibleGroup>
              );
            })}
          </div>
        ) : groupBy === 'status' ? (
          <div className="space-y-3">
            {groupedByStatus.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No tasks match your filters.</p>
            ) : groupedByStatus.map(({ status, tasks }) => {
              const cfg = STATUS_CONFIG[status];
              return (
                <CollapsibleGroup
                  key={status}
                  title={cfg.label}
                  count={tasks.length}
                  colorClass={cfg.color}
                  bgClass={cfg.bg}
                  borderClass={cfg.border}
                  defaultOpen={status !== 'done'}
                >
                  <TaskList tasks={tasks} showAddButton={false} />
                </CollapsibleGroup>
              );
            })}
          </div>
        ) : (
          <TaskList tasks={filteredTasks} emptyMessage="No tasks yet" showAddButton />
        )}
      </div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Task" className="min-h-0 sm:max-w-lg">
        <TaskQuestionFlow onClose={() => setAddOpen(false)} />
      </Dialog>
    </div>
  );
}
