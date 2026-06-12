'use client';

import { useMemo, useState } from 'react';
import { CalendarClock, CheckCircle2, Plus, Repeat2 } from 'lucide-react';
import { RoutineCard } from '@/components/routines/routine-card';
import { TaskQuestionFlow } from '@/components/tasks/task-question-flow';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { useRecurringTasks, useRoutineHistoryTasks, useUpdateTask } from '@/hooks/use-tasks';
import { isOverdue } from '@/lib/utils';
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

function isDueToday(task: Task) {
  if (!task.due_date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.due_date === today;
}

function getRoutineHistoryKey(task: Task) {
  return [task.title.trim().toLowerCase(), task.project_id ?? '', task.goal_id ?? ''].join('::');
}

export default function RoutinesPage() {
  const { data: routines = [], isLoading, error } = useRecurringTasks();
  const { data: allTasks = [] } = useRoutineHistoryTasks();
  const updateTask = useUpdateTask();
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState<RoutineFilter>('all');

  const stats = useMemo(() => ({
    all: routines.length,
    daily: routines.filter(task => task.recurrence_rule === 'daily').length,
    weekly: routines.filter(task => task.recurrence_rule === 'weekly').length,
    monthly: routines.filter(task => task.recurrence_rule === 'monthly').length,
    dueToday: routines.filter(isDueToday).length,
    overdue: routines.filter(task => isOverdue(task.due_date, task.due_time)).length,
    withChecklist: routines.filter(task => (task.subtasks?.length ?? 0) > 0).length,
  }), [routines]);

  const filteredRoutines = useMemo(() => (
    filter === 'all' ? routines : routines.filter(task => task.recurrence_rule === filter)
  ), [filter, routines]);

  const historyByRoutine = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    for (const task of allTasks) {
      if (task.status !== 'done' || !task.completed_at) continue;
      const key = getRoutineHistoryKey(task);
      grouped.set(key, [...(grouped.get(key) ?? []), task]);
    }

    for (const [key, tasks] of grouped) {
      grouped.set(key, [...tasks].sort((a, b) => (b.completed_at ?? '').localeCompare(a.completed_at ?? '')));
    }

    return grouped;
  }, [allTasks]);

  function pauseRoutine(task: Task) {
    updateTask.mutate({ id: task.id, is_recurring: false, recurrence_rule: null, recurrence_weekdays: null });
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--background)' }}>
        <div className="p-4 pb-24 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-end gap-2">
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4" />
              Add routine
            </Button>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <Repeat2 className="h-4 w-4 text-slate-500" />
                Total routines
              </div>
              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{stats.all}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">All active cadences</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Due today
              </div>
              <p className="mt-2 text-xl font-bold text-emerald-700 dark:text-emerald-300 sm:text-2xl">{stats.dueToday}</p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">Scheduled for today</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CalendarClock className="h-4 w-4 text-slate-500" />
                Overdue
              </div>
              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{stats.overdue}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Needs attention</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CalendarClock className="h-4 w-4 text-slate-500" />
                With checklist
              </div>
              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{stats.withChecklist}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Routines with steps</p>
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {[...Array(3)].map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-3">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
                  {[...Array(2)].map((__, i) => (
                    <div key={i} className="h-44 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {ROUTINE_GROUPS.filter(group => filter === 'all' || filter === group.value).map(group => {
                const groupTasks = filteredRoutines.filter(task => task.recurrence_rule === group.value);
                if (groupTasks.length === 0 && filter !== 'all') return null;

                return (
                  <div key={group.value} className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                        {group.label}
                        {groupTasks.length > 0 && <span className="ml-1.5">({groupTasks.length})</span>}
                      </h2>
                    </div>

                    {groupTasks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center dark:border-slate-800 dark:bg-slate-900/30">
                        <Repeat2 className="mb-2 h-5 w-5 text-slate-300 dark:text-slate-600" />
                        <p className="text-xs text-slate-400 dark:text-slate-500">No {group.value} routines</p>
                        <button
                          type="button"
                          onClick={() => setAddOpen(true)}
                          className="mt-2 text-xs font-semibold text-indigo-500 hover:text-indigo-600"
                        >
                          + Add one
                        </button>
                      </div>
                    ) : (
                      groupTasks.map(task => (
                        <RoutineCard
                          key={task.id}
                          task={task}
                          history={historyByRoutine.get(getRoutineHistoryKey(task)) ?? []}
                          onPause={pauseRoutine}
                          pausePending={updateTask.isPending}
                        />
                      ))
                    )}
                  </div>
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