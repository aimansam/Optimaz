'use client';

import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { TaskActions } from '@/components/tasks/task-actions';
import { TaskQuestionFlow } from '@/components/tasks/task-question-flow';
import { useScheduledTasks } from '@/hooks/use-tasks';
import { cn, formatDate, isOverdue, PRIORITY_CONFIG } from '@/lib/utils';
import type { Task } from '@/lib/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
type CalendarView = 'month' | 'week';

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthLabel(date: Date) {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function getDateFromKey(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`);
}

function getWeekDays(dateKey: string) {
  const selected = getDateFromKey(dateKey);
  const startDate = new Date(selected);
  startDate.setDate(selected.getDate() - selected.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

function getWeekLabel(dateKey: string) {
  const days = getWeekDays(dateKey);
  const first = days[0];
  const last = days[6];
  const firstLabel = first.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const lastLabel = last.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${firstLabel} - ${lastLabel}`;
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
  const [view, setView] = useState<CalendarView>('month');
  const [addOpen, setAddOpen] = useState(false);
  const { data: tasks = [], isLoading, error } = useScheduledTasks();

  const monthDays = useMemo(() => getMonthDays(monthDate), [monthDate]);
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
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

  function setVisibleDate(date: Date) {
    setSelectedDate(getDateKey(date));
    setMonthDate(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  function goToPreviousPeriod() {
    if (view === 'week') {
      const date = getDateFromKey(selectedDate);
      date.setDate(date.getDate() - 7);
      setVisibleDate(date);
      return;
    }

    setMonthDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  function goToNextPeriod() {
    if (view === 'week') {
      const date = getDateFromKey(selectedDate);
      date.setDate(date.getDate() + 7);
      setVisibleDate(date);
      return;
    }

    setMonthDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  function goToToday() {
    const today = new Date();
    setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(getDateKey(today));
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Schedule</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{view === 'month' ? getMonthLabel(monthDate) : getWeekLabel(selectedDate)}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
                {(['month', 'week'] as CalendarView[]).map(item => (
                  <Button
                    key={item}
                    type="button"
                    variant={view === item ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setView(item)}
                    aria-pressed={view === item}
                    className="capitalize"
                  >
                    {item}
                  </Button>
                ))}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={goToToday}>Today</Button>
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950">
                <Button type="button" variant="ghost" size="icon" onClick={goToPreviousPeriod} aria-label={view === 'month' ? 'Previous month' : 'Previous week'}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={goToNextPeriod} aria-label={view === 'month' ? 'Next month' : 'Next week'}>
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
                <div className={cn('gap-1 pb-2 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400', view === 'week' ? 'hidden md:grid md:grid-cols-7' : 'grid grid-cols-7')}>
                  {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
                </div>
                {view === 'month' ? (
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
                ) : (
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-7">
                    {weekDays.map(day => {
                      const dayKey = getDateKey(day);
                      const dayTasks = tasksByDate.get(dayKey) ?? [];
                      const isSelected = selectedDate === dayKey;
                      const isToday = todayKey === dayKey;
                      const openCount = dayTasks.filter(task => task.status !== 'done').length;

                      return (
                        <button
                          key={dayKey}
                          type="button"
                          onClick={() => setSelectedDate(dayKey)}
                          className={cn(
                            'min-h-32 rounded-lg border p-3 text-left transition-colors md:min-h-80',
                            isSelected ? 'border-slate-900 bg-slate-100 dark:border-slate-100 dark:bg-slate-800' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                          )}
                          aria-pressed={isSelected}
                        >
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{WEEKDAYS[day.getDay()]}</p>
                              <span className={cn('mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold text-slate-700 dark:text-slate-200', isToday && 'bg-slate-900 text-white dark:bg-white dark:text-slate-900')}>
                                {day.getDate()}
                              </span>
                            </div>
                            {dayTasks.length > 0 && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-900 dark:text-slate-400">{openCount}/{dayTasks.length}</span>}
                          </div>
                          <div className="space-y-1.5">
                            {dayTasks.length === 0 ? (
                              <p className="text-xs text-slate-400">No tasks</p>
                            ) : dayTasks.map(task => {
                              const priority = PRIORITY_CONFIG[task.priority];
                              return (
                                <div key={task.id} className={cn('rounded px-2 py-1 text-[11px] font-medium', priority.bg, priority.color, task.status === 'done' && 'opacity-60 line-through')}>
                                  <p className="truncate">{task.title}</p>
                                  {task.due_time && <p className="mt-0.5 text-[10px] opacity-80">{formatDate(task.due_date, task.due_time)}</p>}
                                </div>
                              );
                            })}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
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
                            <TaskActions task={task} buttonClassName="h-7 w-7 rounded-lg" />
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
    </>
  );
}
