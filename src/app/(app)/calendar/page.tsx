'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Edit2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { TaskForm } from '@/components/tasks/task-form';
import { TaskQuestionFlow } from '@/components/tasks/task-question-flow';
import { useTasksByStatus, useUpdateTask } from '@/hooks/use-tasks';
import { cn, formatDate, isOverdue, PRIORITY_CONFIG } from '@/lib/utils';
import type { Task } from '@/lib/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getMonthDays(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function sortTasksByDate(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    const dateCompare = (a.due_date ?? '').localeCompare(b.due_date ?? '');
    if (dateCompare !== 0) return dateCompare;
    return (a.due_time ?? '').localeCompare(b.due_time ?? '');
  });
}

export default function CalendarPage() {
  const todayKey = getDateKey(new Date());
  const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [addOpen, setAddOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { data: tasks = [], isLoading, error } = useTasksByStatus(undefined, true);
  const updateTask = useUpdateTask();

  const monthDays = useMemo(() => getMonthDays(monthDate), [monthDate]);
  const datedTasks = useMemo(() => tasks.filter(task => task.due_date), [tasks]);
  const tasksByDate = useMemo(() => {
    const grouped = new Map<string, Task[]>();
    for (const task of sortTasksByDate(datedTasks)) {
      if (!task.due_date) continue;
      grouped.set(task.due_date, [...(grouped.get(task.due_date) ?? []), task]);
    }
    return grouped;
  }, [datedTasks]);

  const selectedTasks = tasksByDate.get(selectedDate) ?? [];
  const currentMonth = monthDate.getMonth();
  const currentYear = monthDate.getFullYear();
  const monthTaskCount = datedTasks.filter(task => {
    if (!task.due_date) return false;
    const date = new Date(`${task.due_date}T00:00:00`);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;
  const dueTodayCount = tasksByDate.get(todayKey)?.filter(task => task.status !== 'done').length ?? 0;
  const overdueCount = datedTasks.filter(task => task.status !== 'done' && isOverdue(task.due_date, task.due_time)).length;
  const completedThisMonth = datedTasks.filter(task => {
    if (!task.due_date || task.status !== 'done') return false;
    const date = new Date(`${task.due_date}T00:00:00`);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  function goToPreviousMonth() {
    setMonthDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  function goToNextMonth() {
    setMonthDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  function goToToday() {
    const today = new Date();
    setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(getDateKey(today));
  }

  function toggleTaskDone(task: Task) {
    updateTask.mutate({ id: task.id, status: task.status === 'done' ? 'todo' : 'done' });
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Schedule</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{getMonthLabel(monthDate)}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={goToToday}>Today</Button>
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
                <Button type="button" variant="ghost" size="icon" onClick={goToPreviousMonth} aria-label="Previous month">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={goToNextMonth} aria-label="Next month">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Button type="button" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4" />
                Add task
              </Button>
            </div>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CalendarDays className="h-4 w-4 text-slate-500" />
                This month
              </div>
              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{monthTaskCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled tasks</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                Today
              </div>
              <p className="mt-2 text-xl font-bold text-emerald-700 dark:text-emerald-300 sm:text-2xl">{dueTodayCount}</p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">Open tasks due today</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/20 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-300">
                <Clock className="h-4 w-4" />
                Overdue
              </div>
              <p className="mt-2 text-xl font-bold text-red-700 dark:text-red-300 sm:text-2xl">{overdueCount}</p>
              <p className="text-xs text-red-700/80 dark:text-red-300/80">Past due and open</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-slate-500" />
                Completed
              </div>
              <p className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 sm:text-2xl">{completedThisMonth}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Completed this month</p>
            </div>
          </div>

          {error ? (
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title="Could not load calendar"
              description={error.message || 'Refresh the page and try again.'}
            />
          ) : isLoading ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="h-[560px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              <div className="h-[560px] animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
              <section className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950 sm:p-3">
                <div className="grid grid-cols-7 gap-1 pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map(day => {
                    const dayKey = getDateKey(day);
                    const dayTasks = tasksByDate.get(dayKey) ?? [];
                    const isCurrentMonth = day.getMonth() === monthDate.getMonth();
                    const isSelected = selectedDate === dayKey;
                    const isToday = todayKey === dayKey;
                    const openCount = dayTasks.filter(task => task.status !== 'done').length;
                    const doneCount = dayTasks.length - openCount;

                    return (
                      <button
                        key={dayKey}
                        type="button"
                        onClick={() => setSelectedDate(dayKey)}
                        className={cn(
                          'min-h-24 rounded-lg border p-2 text-left transition-colors sm:min-h-28',
                          isSelected ? 'border-slate-900 bg-slate-100 dark:border-slate-100 dark:bg-slate-800' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900',
                          !isCurrentMonth && 'bg-slate-50/60 text-slate-400 dark:bg-slate-950/40 dark:text-slate-600'
                        )}
                        aria-pressed={isSelected}
                      >
                        <div className="mb-1 flex items-center justify-between gap-1">
                          <span className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold', isToday && 'bg-slate-900 text-white dark:bg-white dark:text-slate-900')}>
                            {day.getDate()}
                          </span>
                          {dayTasks.length > 0 && <span className="text-[10px] font-semibold text-slate-400">{dayTasks.length}</span>}
                        </div>
                        <div className="space-y-1">
                          {dayTasks.slice(0, 3).map(task => {
                            const priority = PRIORITY_CONFIG[task.priority];
                            return (
                              <div key={task.id} className={cn('truncate rounded px-1.5 py-0.5 text-[10px] font-medium', priority.bg, priority.color, task.status === 'done' && 'opacity-60 line-through')}>
                                {task.title}
                              </div>
                            );
                          })}
                          {dayTasks.length > 3 && <div className="text-[10px] font-medium text-slate-400">+{dayTasks.length - 3} more</div>}
                          {openCount > 0 && doneCount > 0 && <div className="text-[10px] text-slate-400">{openCount} open, {doneCount} done</div>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <aside className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Selected day</p>
                    <h3 className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{formatDate(selectedDate)}</h3>
                  </div>
                  <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </Button>
                </div>

                {selectedTasks.length === 0 ? (
                  <EmptyState
                    compact
                    icon={<CalendarDays className="h-4 w-4" />}
                    title="No tasks"
                    description="Add a task to schedule work for this day."
                    action={<Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}><Plus className="h-3.5 w-3.5" />Add task</Button>}
                  />
                ) : (
                  <div className="space-y-2">
                    {selectedTasks.map(task => {
                      const priority = PRIORITY_CONFIG[task.priority];
                      const overdue = task.status !== 'done' && isOverdue(task.due_date, task.due_time);
                      return (
                        <div key={task.id} className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                          <div className="flex items-start gap-2">
                            <button
                              type="button"
                              onClick={() => toggleTaskDone(task)}
                              className={cn(
                                'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                                task.status === 'done' ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'
                              )}
                              aria-label={task.status === 'done' ? `Reopen ${task.title}` : `Complete ${task.title}`}
                              disabled={updateTask.isPending}
                            >
                              {task.status === 'done' && <CheckCircle2 className="h-3 w-3" />}
                            </button>
                            <div className="min-w-0 flex-1">
                              <p className={cn('truncate text-sm font-medium text-slate-900 dark:text-slate-100', task.status === 'done' && 'text-slate-400 line-through dark:text-slate-500')}>
                                {task.title}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', priority.bg, priority.color)}>{priority.label}</span>
                                {task.due_time && <span className="text-[10px] font-medium text-slate-400">{formatDate(task.due_date, task.due_time)}</span>}
                                {overdue && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-900/40 dark:text-red-300">Overdue</span>}
                              </div>
                              {task.project && <p className="mt-1 truncate text-xs text-slate-400">{task.project.name}</p>}
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingTask(task)} aria-label={`Edit ${task.title}`}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </aside>
            </div>
          )}
        </div>
      </div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Task" className="min-h-0 sm:max-w-lg">
        <TaskQuestionFlow defaultDueDate={selectedDate} onClose={() => setAddOpen(false)} />
      </Dialog>
      <Dialog open={Boolean(editingTask)} onClose={() => setEditingTask(null)} title="Edit Task" className="min-h-0 sm:max-w-lg">
        {editingTask && <TaskForm task={editingTask} onClose={() => setEditingTask(null)} />}
      </Dialog>
    </>
  );
}
