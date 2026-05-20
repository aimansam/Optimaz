'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, PauseCircle, Plus, Repeat2 } from 'lucide-react';
import { TaskCard } from '@/components/tasks/task-card';
import { TaskQuestionFlow } from '@/components/tasks/task-question-flow';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useRecurringTasks, useUpdateTask } from '@/hooks/use-tasks';
import { formatDate } from '@/lib/utils';
import type { RecurrenceRule, Task } from '@/lib/types';

type RoutineFilter = 'all' | RecurrenceRule;

const ROUTINE_FILTERS: { value: RoutineFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const ROUTINE_GROUPS: { value: RecurrenceRule; label: string }[] = [
  { value: 'daily', label: 'Daily routines' },
  { value: 'weekly', label: 'Weekly routines' },
  { value: 'monthly', label: 'Monthly routines' },
];

function getNextLabel(task: Task) {
  if (!task.due_date) return 'No next date';
  return formatDate(task.due_date, task.due_time);
}

export default function RoutinesPage() {
  const { data: routines = [], isLoading, error } = useRecurringTasks();
  const updateTask = useUpdateTask();
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<RoutineFilter>('all');

  const stats = useMemo(() => ({
    all: routines.length,
    daily: routines.filter(task => task.recurrence_rule === 'daily').length,
    weekly: routines.filter(task => task.recurrence_rule === 'weekly').length,
    monthly: routines.filter(task => task.recurrence_rule === 'monthly').length,
    active: routines.filter(task => task.status !== 'done').length,
  }), [routines]);

  const filteredRoutines = useMemo(() => (
    filter === 'all' ? routines : routines.filter(task => task.recurrence_rule === filter)
  ), [filter, routines]);

  function pauseRoutine(task: Task) {
    updateTask.mutate({ id: task.id, is_recurring: false, recurrence_rule: null });
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-4 md:px-6 md:py-8">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Recurring work</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Routines</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                Review repeated tasks, keep today focused, and let completed routines roll into their next occurrence.
              </p>
            </div>
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add routine
            </Button>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Repeat2 className="h-4 w-4 text-slate-500" />
                Total routines
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.all}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily, weekly, and monthly</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Ready
              </div>
              <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.active}</p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">Current routine instances</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CalendarClock className="h-4 w-4 text-slate-500" />
                Daily
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.daily}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Everyday habits</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CalendarClock className="h-4 w-4 text-slate-500" />
                Weekly + monthly
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.weekly + stats.monthly}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Longer cadence work</p>
            </div>
          </div>

          <div className="mb-5 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
            {ROUTINE_FILTERS.map(item => (
              <Button
                key={item.value}
                type="button"
                variant={filter === item.value ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
              >
                {item.label}
              </Button>
            ))}
          </div>

          {error ? (
            <EmptyState
              icon={<Repeat2 className="h-6 w-6" />}
              title="Could not load routines"
              description={error.message || 'Refresh the page and try again.'}
            />
          ) : isLoading ? (
            <div className="grid gap-3 lg:grid-cols-3">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="h-44 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : routines.length === 0 ? (
            <EmptyState
              icon={<Repeat2 className="h-6 w-6" />}
              title="No routines yet"
              description="Create a recurring task for work that repeats daily, weekly, or monthly."
              action={<Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Create routine</Button>}
            />
          ) : filteredRoutines.length === 0 ? (
            <EmptyState
              icon={<Repeat2 className="h-6 w-6" />}
              title="No routines match this cadence"
              description="Switch cadence or create a new recurring task for this rhythm."
              action={<Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Create routine</Button>}
            />
          ) : (
            <div className="space-y-8">
              {ROUTINE_GROUPS.filter(group => filter === 'all' || filter === group.value).map(group => {
                const groupTasks = filteredRoutines.filter(task => task.recurrence_rule === group.value);
                if (groupTasks.length === 0) return null;

                return (
                  <section key={group.value}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">{group.label} ({groupTasks.length})</h2>
                    </div>
                    <div className="grid gap-3 lg:grid-cols-2">
                      {groupTasks.map(task => (
                        <div key={task.id} className="space-y-2">
                          <TaskCard task={task} />
                          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                            <span>Next: {getNextLabel(task)}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => pauseRoutine(task)} disabled={updateTask.isPending}>
                              <PauseCircle className="h-3.5 w-3.5" />
                              Pause
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Routine" className="min-h-0 sm:max-w-lg">
        <TaskQuestionFlow defaultRecurrenceRule="daily" onClose={() => setAddOpen(false)} />
      </Dialog>
    </>
  );
}