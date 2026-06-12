'use client';

import { useEffect, useRef, useState } from 'react';
import { BarChart3, CheckCircle2, Flame, Target, X, TrendingUp, AlertCircle, ArrowRight, Zap, Sun } from 'lucide-react';
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

const PRIORITY_ORDER: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };

function getStatusMessage(progressPct: number, overdueCount: number, doneToday: number): { text: string; icon: React.ElementType; iconClass?: string; accent?: boolean } {
  if (overdueCount > 0) return { text: `${overdueCount} task${overdueCount > 1 ? 's' : ''} overdue`, icon: AlertCircle, iconClass: 'text-red-500' };
  if (progressPct === 100 && doneToday > 0) return { text: "You're crushing it!", icon: CheckCircle2, iconClass: 'text-emerald-500', accent: true };
  if (progressPct >= 50) return { text: 'Great momentum!', icon: Flame, iconClass: 'text-orange-500', accent: true };
  if (doneToday > 0) return { text: 'Good start, keep going!', icon: Zap, iconClass: 'text-amber-500' };
  return { text: 'Ready to start your day?', icon: Sun, iconClass: 'text-sky-500' };
}

function CircleProgress({ pct, size = 72 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <svg width={size} height={size} className="shrink-0">
      {/* Track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        className="stroke-slate-100 dark:stroke-slate-800"
        strokeWidth={6}
      />
      {/* Progress */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgb(var(--accent))"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.7s ease' }}
      />
      {/* Center label */}
      <text
        x={size / 2}
        y={size / 2 + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-slate-900 dark:fill-slate-100"
        style={{ fontSize: size * 0.22, fontWeight: 700 }}
      >
        {pct}%
      </text>
    </svg>
  );
}

export function DailySummary({ tasks, todayTasks, goals }: DailySummaryProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Auto-open on first mount (every time the dashboard page renders)
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const todayStr = new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD

  // Done today = tasks completed on today's date
  const doneToday = tasks.filter(
    t => t.status === 'done' && (t.completed_at ?? t.updated_at)?.startsWith(todayStr)
  ).length;

  // Total = tasks due today (pending + done with today's due_date)
  const totalDueToday = todayTasks.length + tasks.filter(
    t => t.status === 'done' && t.due_date === todayStr
  ).length;

  const remainingToday = todayTasks.filter(t => t.status !== 'done').length;

  // Progress: if tasks were due today, use that; otherwise if something was done, show 100%
  const progressPct = totalDueToday > 0
    ? Math.round(((totalDueToday - remainingToday) / totalDueToday) * 100)
    : doneToday > 0 ? 100 : 0;

  // Overdue tasks
  const overdueCount = tasks.filter(
    t => t.status !== 'done' && !t.archived_at && t.due_date && t.due_date < todayStr
  ).length;

  const streak = getStreakCount(tasks);

  const activeGoals = goals.filter(g => {
    const total = g.tasks?.length ?? 0;
    const done = g.tasks?.filter(t => t.status === 'done').length ?? 0;
    return total === 0 || done < total;
  }).length;

  // Next task to tackle: most urgent non-done task
  const nextTask = tasks
    .filter(t => t.status !== 'done' && !t.archived_at)
    .sort((a, b) => {
      const pDiff = (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
      if (pDiff !== 0) return pDiff;
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return 0;
    })[0] ?? null;

  const statusMsg = getStatusMessage(progressPct, overdueCount, doneToday);

  const statsRows = [
    {
      icon: CheckCircle2,
      label: 'Done today',
      value: totalDueToday > 0 ? `${totalDueToday - remainingToday}/${totalDueToday}` : `${doneToday}`,
              sub: remainingToday > 0 ? `${remainingToday} remaining` : doneToday > 0 ? 'All clear!' : 'No tasks due',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    ...(overdueCount > 0 ? [{
      icon: AlertCircle,
      label: 'Overdue',
      value: String(overdueCount),
      sub: 'Need attention',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30',
    }] : []),
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
        {overdueCount > 0 && progressPct === 0 && (
          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {overdueCount}
          </span>
        )}
      </button>

      {/* Popout */}
      {open && (
        <div
          className="fixed right-4 top-[calc(3.5rem+0.35rem)] z-[9998] w-72 max-w-[calc(100vw-2rem)] rounded-2xl border bg-white shadow-2xl dark:bg-slate-900"
          style={{ borderColor: 'var(--card-border)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-3">
            <div className="flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" style={{ color: 'rgb(var(--accent))' }} />
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Today's Progress</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Ring + status */}
          <div className="flex items-center gap-4 px-4 pb-3">
            <CircleProgress pct={progressPct} size={72} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {(() => { const Icon = statusMsg.icon; return <Icon className={`h-4 w-4 shrink-0 ${statusMsg.iconClass ?? ''}`} />; })()}
                {statusMsg.text}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-4 border-t border-slate-100 dark:border-slate-800" />

          {/* Stats */}
          <div className="px-4 py-3 space-y-2">
            {statsRows.map(item => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-xl p-2.5 ${item.bg}`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 dark:bg-black/20">
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

          {/* Up next task */}
          {nextTask && (
            <>
              <div className="mx-4 border-t border-slate-100 dark:border-slate-800" />
              <div className="px-4 py-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Up next</p>
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/60">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'rgb(var(--accent))' }} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-800 dark:text-slate-100">{nextTask.title}</p>
                    <p className="text-[10px] capitalize text-slate-400">{nextTask.priority} priority{nextTask.due_date ? ` · ${nextTask.due_date}` : ''}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
