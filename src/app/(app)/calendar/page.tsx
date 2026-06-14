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

  // ── Shared header + stats ────────────────────────────────────

  const pageHeader = (
    <div className="shrink-0 px-4 pt-4 pb-3 sm:px-6 sm:pt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>Schedule</p>
          <h2 className="gradient-text mt-0.5 text-xl font-bold">
            {view === 'month' ? getMonthLabel(monthDate) : getWeekLabel(selectedDate)}
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex items-center gap-1 rounded-xl p-1"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
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
          <div
            className="flex items-center gap-1 rounded-xl p-1"
            style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
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
    </div>
  );

  const statsRow = (
    <div className="shrink-0 grid grid-cols-4 gap-1.5 px-4 pb-3 sm:gap-2 sm:px-6">
      <div className="rounded-xl p-2 sm:px-3 sm:py-2.5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-1 text-[10px] font-semibold sm:gap-1.5 sm:text-xs" style={{ color: 'var(--foreground)' }}>
          <CalendarDays className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" style={{ color: 'var(--muted-fg)' }} />
          <span className="truncate hidden sm:inline">This month</span>
          <span className="truncate sm:hidden">Month</span>
        </div>
        <p className="mt-0.5 text-sm font-bold sm:mt-1 sm:text-lg" style={{ color: 'var(--foreground)' }}>{monthTaskCount}</p>
        <p className="hidden text-[11px] sm:block" style={{ color: 'var(--muted-fg)' }}>Scheduled tasks</p>
      </div>
      <div className="rounded-xl p-2 sm:px-3 sm:py-2.5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 sm:gap-1.5 sm:text-xs">
          <CheckCircle2 className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          Today
        </div>
        <p className="mt-0.5 text-sm font-bold text-amber-600 dark:text-amber-400 sm:mt-1 sm:text-lg">{dueTodayCount}</p>
        <p className="hidden text-[11px] text-amber-600/70 dark:text-amber-400/70 sm:block">Open tasks due today</p>
      </div>
      <div className="rounded-xl p-2 sm:px-3 sm:py-2.5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-1 text-[10px] font-semibold text-red-500 dark:text-red-400 sm:gap-1.5 sm:text-xs">
          <Clock className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" />
          Overdue
        </div>
        <p className="mt-0.5 text-sm font-bold text-red-500 dark:text-red-400 sm:mt-1 sm:text-lg">{overdueCount}</p>
        <p className="hidden text-[11px] text-red-500/70 dark:text-red-400/70 sm:block">Past due and open</p>
      </div>
      <div className="rounded-xl p-2 sm:px-3 sm:py-2.5" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex items-center gap-1 text-[10px] font-semibold sm:gap-1.5 sm:text-xs" style={{ color: 'var(--foreground)' }}>
          <CheckCircle2 className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" style={{ color: 'var(--muted-fg)' }} />
          <span className="truncate hidden sm:inline">Completed</span>
          <span className="truncate sm:hidden">Done</span>
        </div>
        <p className="mt-0.5 text-sm font-bold sm:mt-1 sm:text-lg" style={{ color: 'var(--foreground)' }}>{completedThisMonth}</p>
        <p className="hidden text-[11px] sm:block" style={{ color: 'var(--muted-fg)' }}>Completed this month</p>
      </div>
    </div>
  );

  // ── Day panel content (shared) ────────────────────────────────

  const dayPanelContent = (
    <>
      <div className="flex items-start justify-between gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--card-border)' }}>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>Selected day</p>
          <h3 className="mt-0.5 font-semibold" style={{ color: 'var(--foreground)' }}>{formatDate(selectedDate)}</h3>
        </div>
        <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      <div className="p-4">
        {selectedTasks.length === 0 ? (
          <EmptyState
            compact
            icon={<CalendarDays className="h-4 w-4" />}
            title="No tasks"
            description="Add a task to schedule work for this day."
            action={
              <Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add task
              </Button>
            }
          />
        ) : (
          <div className="space-y-2">
            {selectedTasks.map(task => {
              const priority = PRIORITY_CONFIG[task.priority];
              const overdue = task.status !== 'done' && isOverdue(task.due_date, task.due_time);
              return (
                <div key={task.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)' }}>
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className={cn('truncate text-sm font-medium', task.status === 'done' && 'line-through opacity-50')} style={{ color: 'var(--foreground)' }}>
                        {task.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', priority.bg, priority.color)}>{priority.label}</span>
                        {task.due_time && <span className="text-[10px] font-medium" style={{ color: 'var(--muted-fg)' }}>{formatDate(task.due_date, task.due_time)}</span>}
                        {overdue && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-900/40 dark:text-red-300">Overdue</span>}
                      </div>
                      {task.project && <p className="mt-1 truncate text-xs" style={{ color: 'var(--muted-fg)' }}>{task.project.name}</p>}
                    </div>
                    <TaskActions task={task} buttonClassName="h-7 w-7 rounded-lg" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden">
        {pageHeader}
        {statsRow}

        {/* ═══════════════════════════════════════════════════════
            MOBILE layout (< lg): single natural scroll column
            ═══════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain lg:hidden" style={{ background: 'var(--background)' }}>
          <div className="space-y-3 px-4 sm:px-6" style={{ paddingBottom: 'max(6rem, calc(5.5rem + env(safe-area-inset-bottom, 0px)))' }}>

            {error ? (
              <EmptyState
                icon={<CalendarDays className="h-6 w-6" />}
                title="Could not load calendar"
                description={error.message || 'Refresh the page and try again.'}
              />
            ) : isLoading ? (
              <>
                <div className="h-64 animate-pulse rounded-xl" style={{ background: 'var(--muted-bg)' }} />
                <div className="h-40 animate-pulse rounded-xl" style={{ background: 'var(--muted-bg)' }} />
              </>
            ) : (
              <>
                {/* Calendar grid — auto-height cells */}
                <section className="rounded-xl p-2" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                  {/* Weekday labels */}
                  <div className={cn(
                    'gap-1 pb-1.5 text-center text-[10px] font-semibold uppercase tracking-wider',
                    view === 'week' ? 'hidden' : 'grid grid-cols-7'
                  )} style={{ color: 'var(--muted-fg)' }}>
                    {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
                  </div>

                  {view === 'month' ? (
                    <div className="grid grid-cols-7 gap-0.5">
                      {monthDays.map(day => {
                        const dayKey = getDateKey(day);
                        const dayTasks = tasksByDate.get(dayKey) ?? [];
                        const isCurrentMonth = day.getMonth() === monthDate.getMonth();
                        const isSelected = selectedDate === dayKey;
                        const isToday = todayKey === dayKey;

                        return (
                          <button
                            key={dayKey}
                            type="button"
                            onClick={() => setSelectedDate(dayKey)}
                            className="min-h-[48px] overflow-hidden rounded-lg border p-1 text-left transition-colors hover:bg-[var(--muted-bg)]"
                            style={{
                              borderColor: isSelected ? 'var(--accent)' : 'var(--card-border)',
                              background: isSelected ? 'rgba(var(--accent-rgb,99,102,241),0.08)' : undefined,
                              opacity: !isCurrentMonth ? 0.45 : undefined,
                            }}
                            aria-pressed={isSelected}
                          >
                            <div className="flex items-center justify-between gap-0.5 mb-0.5">
                              <span
                                className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold"
                                style={isToday
                                  ? { background: 'var(--accent)', color: '#fff' }
                                  : { color: 'var(--foreground)' }}
                              >
                                {day.getDate()}
                              </span>
                              {dayTasks.length > 0 && (
                                <span className="text-[8px] font-semibold" style={{ color: 'var(--muted-fg)' }}>{dayTasks.length}</span>
                              )}
                            </div>
                            <div className="space-y-0.5">
                              {dayTasks.slice(0, 1).map(task => {
                                const priority = PRIORITY_CONFIG[task.priority];
                                return (
                                  <div key={task.id} className={cn(
                                    'truncate rounded px-0.5 py-0.5 text-[8px] font-medium',
                                    priority.bg, priority.color,
                                    task.status === 'done' && 'opacity-60 line-through'
                                  )}>
                                    {task.title}
                                  </div>
                                );
                              })}
                              {dayTasks.length > 1 && (
                                <div className="text-[8px] font-medium" style={{ color: 'var(--muted-fg)' }}>+{dayTasks.length - 1}</div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Week view on mobile — single column stacked */
                    <div className="space-y-2">
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
                            className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-[var(--muted-bg)]"
                            style={{
                              borderColor: isSelected ? 'var(--accent)' : 'var(--card-border)',
                              background: isSelected ? 'rgba(var(--accent-rgb,99,102,241),0.06)' : undefined,
                            }}
                            aria-pressed={isSelected}
                          >
                            <div className="mb-2 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-fg)' }}>{WEEKDAYS[day.getDay()]}</p>
                                <span
                                  className="flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold"
                                  style={isToday
                                    ? { background: 'var(--accent)', color: '#fff' }
                                    : { color: 'var(--foreground)' }}
                                >
                                  {day.getDate()}
                                </span>
                              </div>
                              {dayTasks.length > 0 && (
                                <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--muted-bg)', color: 'var(--muted-fg)' }}>
                                  {openCount}/{dayTasks.length}
                                </span>
                              )}
                            </div>
                            {dayTasks.length === 0 ? (
                              <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>No tasks</p>
                            ) : (
                              <div className="space-y-1">
                                {dayTasks.map(task => {
                                  const priority = PRIORITY_CONFIG[task.priority];
                                  return (
                                    <div key={task.id} className={cn('rounded px-2 py-1 text-[11px] font-medium', priority.bg, priority.color, task.status === 'done' && 'opacity-60 line-through')}>
                                      <p className="truncate">{task.title}</p>
                                      {task.due_time && <p className="mt-0.5 text-[10px] opacity-80">{formatDate(task.due_date, task.due_time)}</p>}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Selected day panel — regular card, scrolls with page */}
                <aside className="rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                  {dayPanelContent}
                </aside>
              </>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            DESKTOP layout (≥ lg): viewport-fit, no page scroll
            ═══════════════════════════════════════════════════════ */}
        <div className="hidden flex-1 min-h-0 px-4 pb-4 sm:px-6 sm:pb-5 lg:block">
          {error ? (
            <EmptyState
              icon={<CalendarDays className="h-6 w-6" />}
              title="Could not load calendar"
              description={error.message || 'Refresh the page and try again.'}
            />
          ) : isLoading ? (
            <div className="grid h-full gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="animate-pulse rounded-xl" style={{ background: 'var(--muted-bg)' }} />
              <div className="animate-pulse rounded-xl" style={{ background: 'var(--muted-bg)' }} />
            </div>
          ) : (
            <div className="grid h-full gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">

              {/* Calendar grid */}
              <section className="flex flex-col overflow-hidden rounded-xl p-2 sm:p-3" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                {/* Weekday labels */}
                <div
                  className={cn(
                    'shrink-0 gap-1 pb-1.5 text-center text-[10px] font-semibold uppercase tracking-wider',
                    view === 'week' ? 'hidden md:grid md:grid-cols-7' : 'grid grid-cols-7'
                  )}
                  style={{ color: 'var(--muted-fg)' }}
                >
                  {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
                </div>

                {/* Month view */}
                {view === 'month' ? (
                  <div className="flex-1 min-h-0 grid grid-cols-7 grid-rows-6 gap-1">
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
                          className="overflow-hidden rounded-lg border p-1.5 text-left transition-colors sm:p-2 hover:bg-[var(--muted-bg)]"
                          style={{
                            borderColor: isSelected ? 'var(--accent)' : isToday ? 'rgb(var(--accent) / 0.35)' : 'var(--card-border)',
                            background: isSelected
                              ? 'rgba(var(--accent-rgb,99,102,241),0.08)'
                              : isToday
                                ? 'rgba(var(--accent-rgb,99,102,241),0.05)'
                                : dayTasks.length > 3
                                  ? 'rgba(var(--accent-rgb,99,102,241),0.04)'
                                  : dayTasks.length > 0
                                    ? 'rgba(var(--accent-rgb,99,102,241),0.02)'
                                    : undefined,
                            opacity: !isCurrentMonth ? 0.45 : undefined,
                          }}
                          aria-pressed={isSelected}
                        >
                          <div className="mb-1 flex items-center justify-between gap-1">
                            <span
                              className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold sm:h-6 sm:w-6 sm:text-xs"
                              style={isToday
                                ? { background: 'var(--accent)', color: '#fff' }
                                : { color: 'var(--foreground)' }}
                            >
                              {day.getDate()}
                            </span>
                            {dayTasks.length > 0 && <span className="text-[9px] font-semibold sm:text-[10px]" style={{ color: 'var(--muted-fg)' }}>{dayTasks.length}</span>}
                          </div>
                          <div className="space-y-0.5">
                            {dayTasks.slice(0, 2).map(task => {
                              const priority = PRIORITY_CONFIG[task.priority];
                              const isRecurring = !!task.is_recurring;
                              return (
                                <div
                                  key={task.id}
                                  title={task.title}
                                  className={cn(
                                    'truncate rounded px-1 py-0.5 text-[9px] font-medium sm:px-1.5 sm:text-[10px]',
                                    priority.color,
                                    !isRecurring && priority.bg,
                                    task.status === 'done' && 'opacity-60 line-through',
                                  )}
                                  style={isRecurring ? {
                                    background: 'var(--muted-bg)',
                                    border: '1px solid var(--card-border)',
                                    opacity: task.status === 'done' ? 0.5 : 0.8,
                                  } : undefined}
                                >
                                  {isRecurring ? '↻ ' : ''}{task.title}
                                </div>
                              );
                            })}
                            {dayTasks.length > 2 && <div className="text-[9px] font-medium" style={{ color: 'var(--muted-fg)' }}>+{dayTasks.length - 2} more</div>}
                            {openCount > 0 && doneCount > 0 && <div className="hidden text-[9px] sm:block" style={{ color: 'var(--muted-fg)' }}>{openCount} open, {doneCount} done</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* Week view */
                  <div className="flex-1 min-h-0 grid grid-cols-1 gap-2 overflow-y-auto md:grid-cols-7">
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
                          className="rounded-lg border p-3 text-left transition-colors hover:bg-[var(--muted-bg)]"
                          style={{
                            borderColor: isSelected ? 'var(--accent)' : 'var(--card-border)',
                            background: isSelected ? 'rgba(var(--accent-rgb,99,102,241),0.08)' : undefined,
                          }}
                          aria-pressed={isSelected}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-fg)' }}>{WEEKDAYS[day.getDay()]}</p>
                              <span
                                className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold"
                                style={isToday
                                  ? { background: 'var(--accent)', color: '#fff' }
                                  : { color: 'var(--foreground)' }}
                              >
                                {day.getDate()}
                              </span>
                            </div>
                            {dayTasks.length > 0 && (
                              <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold" style={{ background: 'var(--muted-bg)', color: 'var(--muted-fg)' }}>
                                {openCount}/{dayTasks.length}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {dayTasks.length === 0 ? (
                              <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>No tasks</p>
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

              {/* Selected day panel — viewport-fit aside */}
              <aside className="flex flex-col overflow-hidden rounded-xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                <div className="shrink-0" style={{ borderBottom: '1px solid var(--card-border)' }}>
                  <div className="flex items-start justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>Selected day</p>
                      <h3 className="mt-0.5 font-semibold" style={{ color: 'var(--foreground)' }}>{formatDate(selectedDate)}</h3>
                    </div>
                    <Button type="button" size="sm" onClick={() => setAddOpen(true)}>
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto p-4" style={{ background: 'var(--background)' }}>
                  {selectedTasks.length === 0 ? (
                    <EmptyState
                      compact
                      icon={<CalendarDays className="h-4 w-4" />}
                      title="No tasks"
                      description="Add a task to schedule work for this day."
                      action={
                        <Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}>
                          <Plus className="h-3.5 w-3.5" />
                          Add task
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-2">
                      {selectedTasks.map(task => {
                        const priority = PRIORITY_CONFIG[task.priority];
                        const overdue = task.status !== 'done' && isOverdue(task.due_date, task.due_time);
                        return (
                          <div key={task.id} className="rounded-lg border p-3" style={{ borderColor: 'var(--card-border)' }}>
                            <div className="flex items-start gap-2">
                              <div className="min-w-0 flex-1">
                                <p className={cn('truncate text-sm font-medium', task.status === 'done' && 'line-through opacity-50')} style={{ color: 'var(--foreground)' }}>
                                  {task.title}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', priority.bg, priority.color)}>{priority.label}</span>
                                  {task.due_time && <span className="text-[10px] font-medium" style={{ color: 'var(--muted-fg)' }}>{formatDate(task.due_date, task.due_time)}</span>}
                                  {overdue && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-600 dark:bg-red-900/40 dark:text-red-300">Overdue</span>}
                                </div>
                                {task.project && <p className="mt-1 truncate text-xs" style={{ color: 'var(--muted-fg)' }}>{task.project.name}</p>}
                              </div>
                              <TaskActions task={task} buttonClassName="h-7 w-7 rounded-lg" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
