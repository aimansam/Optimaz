'use client';

import { useEffect, useRef, useState } from 'react';
import { BarChart3, CheckCircle2, Flame, Target, X, TrendingUp } from 'lucide-react';
import type { Task } from '@/lib/types';

interface DailySummaryProps {
  tasks: Task[];
  todayTasks: Task[];
  goals: { id: string; title: string; tasks?: { status: string }[] }[];
}

function getStreakCount(tasks: Task[]): number {
  const doneTasks = tasks.filter(t => t.status === 'done');
  const completedDates = new Set(
    doneTasks.map(t => new Date(t.completed_at ?? t.updated_at).toISOString().split('T')[0])
  );
  if (completedDates.size === 0) return 0;
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (!completedDates.has(today) && !completedDates.has(yesterday)) return 0;
  let streak = 0;
  const cursor = new Date();
  if (!completedDates.has(today)) cursor.setDate(cursor.getDate() - 1);
  while (streak < 365) {
    const key = cursor.toISOString().split('T')[0];
    if (!completedDates.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function DailySummary({ tasks, todayTasks, goals }: DailySummaryProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const todayStr = new Date().toISOString().split('T')[0];
  const doneToday = tasks.filter(t => t.status === 'done' && (t.completed_at ?? t.updated_at)?.startsWith(todayStr)).length;
  const totalToday = todayTasks.length;
  const remainingToday = todayTasks.filter(t => t.status !== 'done').length;
  const progressPct = totalToday > 0 ? Math.round((doneToday / totalToday) * 100) : 0;
  const streak = getStreakCount(tasks);
  const activeGoals = goals.filter(g => {
    const total = g.tasks?.length ?? 0;
    const done = g.tasks?.filter(t => t.status === 'done').length ?? 0;
    return total === 0 || done < total;
  }).length;

  const summaryItems = [
    {
      icon: CheckCircle2,
      label: 'Done today',
      value: `${doneToday}/${totalToday}`,
      sub: remainingToday > 0 ? `${remainingToday} remaining` : 'All clear! 🎉',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      icon: Flame,
      label: 'Streak',
      value: `${streak}d`,
      sub: streak > 0 ? 'Keep it going!' : 'Start today',
      color: 'text-orange-500 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
    },
    {
      icon: Target,
      label: 'Active goals',
      value: String(activeGoals),
      sub: activeGoals === 0 ? 'No active goals' : 'In progress',
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        title="Daily summary"
        aria-label="View daily summary"
        aria-expanded={open}
      >
        <TrendingUp className="h-3.5 w-3.5" style={{ color: 'rgb(var(--accent))' }} />
        <span className="hidden sm:inline">Summary</span>
        {progressPct > 0 && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
            style={{ background: 'rgb(var(--accent))' }}
          >
            {progressPct}%
          </span>
        )}
      </button>

      {/* Popout */}
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border bg-white p-4 shadow-xl dark:bg-slate-900"
          style={{ borderColor: 'var(--card-border)' }}
        >
          {/* Header */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" style={{ color: 'rgb(var(--accent))' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Today's Progress</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Daily tasks</span>
              <span className="text-xs font-bold" style={{ color: 'rgb(var(--accent))' }}>{progressPct}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, background: 'rgb(var(--accent))' }}
              />
            </div>
          </div>

          {/* Stats grid */}
          <div className="space-y-2">
            {summaryItems.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-lg p-2 ${item.bg}`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 dark:bg-black/20`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-1">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{item.label}</span>
                      <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <p className="mt-3 text-center text-[10px] text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      )}
    </div>
  );
}
