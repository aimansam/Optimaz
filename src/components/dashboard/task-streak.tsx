'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import type { Task } from '@/lib/types';

interface TaskStreakProps {
  tasks: Task[];
  inline?: boolean;
}

function getDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0];
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function calculateStreak(tasks: Task[]): number {
  const doneTasks = tasks.filter(t => t.status === 'done');
  const completedDates = new Set(
    doneTasks.map(t => getDateKey(t.completed_at ?? t.updated_at))
  );

  if (completedDates.size === 0) return 0;

  const today = getTodayKey();
  const yesterday = getYesterdayKey();

  const hasRecentActivity = completedDates.has(today) || completedDates.has(yesterday);
  if (!hasRecentActivity) return 0;

  let streak = 0;
  const cursor = new Date();

  if (!completedDates.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = cursor.toISOString().split('T')[0];
    if (!completedDates.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
    if (streak >= 365) break;
  }

  return streak;
}

const MILESTONES = [7, 14, 30, 100, 365];
const MILESTONE_KEY = 'streak_celebrated_milestone';

function getNextMilestone(streak: number) {
  return MILESTONES.find(m => m > streak) ?? null;
}

function getPrevMilestone(streak: number) {
  return [...MILESTONES].reverse().find(m => m <= streak) ?? null;
}

function getStreakConfig(streak: number) {
  if (streak === 0) return {
    gradient: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700',
    numberColor: 'text-slate-400 dark:text-slate-500',
    flameClass: 'text-slate-300',
    barColor: 'bg-slate-200 dark:bg-slate-700',
    labelColor: 'text-slate-400',
  };
  if (streak < 7) return {
    gradient: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/50 dark:via-orange-950/40 dark:to-yellow-950/30',
    border: 'border-amber-200 dark:border-amber-800/60',
    numberColor: 'text-amber-700 dark:text-amber-300',
    flameClass: 'text-amber-500',
    barColor: 'bg-amber-400',
    labelColor: 'text-amber-600 dark:text-amber-400',
  };
  if (streak < 30) return {
    gradient: 'bg-gradient-to-br from-orange-50 via-red-50 to-rose-50 dark:from-orange-950/50 dark:via-red-950/40 dark:to-rose-950/30',
    border: 'border-orange-300 dark:border-orange-800/60',
    numberColor: 'text-orange-600 dark:text-orange-300',
    flameClass: 'text-orange-500',
    barColor: 'bg-orange-500',
    labelColor: 'text-orange-600 dark:text-orange-400',
  };
  return {
    gradient: 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-950/60 dark:via-rose-950/50 dark:to-pink-950/30',
    border: 'border-red-300 dark:border-red-800/60',
    numberColor: 'text-red-600 dark:text-red-300',
    flameClass: 'text-red-500',
    barColor: 'bg-red-500',
    labelColor: 'text-red-600 dark:text-red-400',
  };
}

function getStreakLabel(streak: number): string {
  if (streak === 0) return 'Complete a task to start your streak!';
  if (streak === 1) return 'Great start — come back tomorrow!';
  if (streak < 5) return 'Building momentum!';
  if (streak < 10) return "You're on a roll!";
  if (streak < 30) return 'On fire! Keep going! 🔥';
  if (streak < 100) return 'Legendary consistency! 🏆';
  return 'Hall of fame status! 👑';
}

function MilestoneBanner({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  const milestone = getPrevMilestone(streak);
  if (!milestone) return null;

  const messages: Record<number, string> = {
    7: '🔥 7-day streak! You\'re on fire!',
    14: '⚡ 2 weeks strong! Incredible!',
    30: '🏆 30-day streak! You\'re a legend!',
    100: '👑 100 DAYS! Absolutely elite!',
    365: '🌟 One full year! Hall of fame!',
  };

  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-white/80 px-3 py-2 shadow-sm ring-1 ring-orange-200 dark:bg-slate-900/80 dark:ring-orange-700/50 animate-bounce">
      <span className="text-sm font-bold text-orange-700 dark:text-orange-300">{messages[milestone]}</span>
      <button onClick={onDismiss} className="text-xs text-orange-400 hover:text-orange-600 dark:text-orange-500">✕</button>
    </div>
  );
}

export function TaskStreak({ tasks, inline }: TaskStreakProps) {
  const streak = useMemo(() => calculateStreak(tasks), [tasks]);
  const label = getStreakLabel(streak);
  const [showMilestone, setShowMilestone] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Detect uncelebrated milestones
  useEffect(() => {
    if (typeof window === 'undefined' || streak === 0) return;
    const lastCelebrated = Number(localStorage.getItem(MILESTONE_KEY) ?? '0');
    const prevMilestone = getPrevMilestone(streak);
    if (prevMilestone && prevMilestone > lastCelebrated) {
      setShowMilestone(true);
      localStorage.setItem(MILESTONE_KEY, String(prevMilestone));
      const timer = setTimeout(() => setShowMilestone(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [streak]);

  // Click-outside to close popover
  useEffect(() => {
    if (!popoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoverOpen]);

  const cfg = getStreakConfig(streak);
  const nextMilestone = getNextMilestone(streak);
  const prevMilestone = getPrevMilestone(streak) ?? 0;
  const progressToNext = nextMilestone
    ? Math.round(((streak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    : 100;

  // Inline mode — clickable pill that opens streak card as popover
  if (inline) {
    return (
      <div ref={popoverRef} className="relative">
        <button
          type="button"
          onClick={() => setPopoverOpen(v => !v)}
          className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
        >
          <Flame className={`h-3 w-3 ${streak > 0 ? 'text-orange-500' : 'text-slate-400'}`} />
          {streak} {streak === 1 ? 'day' : 'days'}
        </button>

        {/* Streak card popover */}
        {popoverOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-64 drop-shadow-xl">
            <div className={`rounded-xl border p-4 ${cfg.gradient} ${cfg.border}`}>
              {showMilestone && (
                <MilestoneBanner streak={streak} onDismiss={() => setShowMilestone(false)} />
              )}

              <div className="flex items-center justify-between gap-3">
                {/* Left: number + label */}
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-5xl font-black leading-none tracking-tight ${cfg.numberColor}`}>
                      {streak}
                    </span>
                    <span className={`text-sm font-bold ${cfg.labelColor}`}>
                      {streak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                  <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${cfg.labelColor}`}>
                    Task streak
                  </p>
                </div>

                {/* Right: flame icon */}
                <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${streak > 0 ? 'bg-white/60 dark:bg-black/20' : 'bg-slate-100 dark:bg-slate-700/40'} shadow-sm`}>
                  <Flame
                    className={`h-8 w-8 ${cfg.flameClass} ${streak > 0 ? 'drop-shadow-sm' : ''}`}
                    style={streak >= 30 ? { filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.5))' } : streak >= 7 ? { filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.4))' } : undefined}
                  />
                  {streak >= 30 && (
                    <Trophy className="absolute -bottom-1 -right-1 h-4 w-4 text-yellow-500 drop-shadow-sm" />
                  )}
                </div>
              </div>

              {/* Motivational label */}
              <p className={`mt-2 text-xs font-medium ${cfg.labelColor}`}>{label}</p>

              {/* Progress to next milestone */}
              {nextMilestone && (
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between">
                    <span className={`text-[10px] font-semibold ${cfg.labelColor} opacity-80`}>
                      Next milestone: {nextMilestone} days
                    </span>
                    <span className={`text-[10px] font-bold ${cfg.labelColor}`}>
                      {nextMilestone - streak} to go
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`}
                      style={{ width: `${Math.max(progressToNext, 4)}%` }}
                    />
                  </div>
                </div>
              )}
              {!nextMilestone && streak > 0 && (
                <p className={`mt-2 text-[10px] font-semibold ${cfg.labelColor}`}>
                  🏆 Maximum milestone reached! You&apos;re a legend.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full card mode (non-inline) — kept for any standalone use
  return (
    <div className={`rounded-xl border p-4 ${cfg.gradient} ${cfg.border}`}>
      {showMilestone && (
        <MilestoneBanner streak={streak} onDismiss={() => setShowMilestone(false)} />
      )}

      <div className="flex items-center justify-between gap-3">
        {/* Left: number + label */}
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-5xl font-black leading-none tracking-tight ${cfg.numberColor}`}>
              {streak}
            </span>
            <span className={`text-sm font-bold ${cfg.labelColor}`}>
              {streak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className={`mt-1 text-[10px] font-bold uppercase tracking-widest ${cfg.labelColor}`}>
            Task streak
          </p>
        </div>

        {/* Right: flame icon */}
        <div className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${streak > 0 ? 'bg-white/60 dark:bg-black/20' : 'bg-slate-100 dark:bg-slate-700/40'} shadow-sm`}>
          <Flame
            className={`h-8 w-8 ${cfg.flameClass} ${streak > 0 ? 'drop-shadow-sm' : ''}`}
            style={streak >= 30 ? { filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.5))' } : streak >= 7 ? { filter: 'drop-shadow(0 0 4px rgba(249,115,22,0.4))' } : undefined}
          />
          {streak >= 30 && (
            <Trophy className="absolute -bottom-1 -right-1 h-4 w-4 text-yellow-500 drop-shadow-sm" />
          )}
        </div>
      </div>

      {/* Motivational label */}
      <p className={`mt-2 text-xs font-medium ${cfg.labelColor}`}>{label}</p>

      {/* Progress to next milestone */}
      {nextMilestone && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className={`text-[10px] font-semibold ${cfg.labelColor} opacity-80`}>
              Next milestone: {nextMilestone} days
            </span>
            <span className={`text-[10px] font-bold ${cfg.labelColor}`}>
              {nextMilestone - streak} to go
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-700 ${cfg.barColor}`}
              style={{ width: `${Math.max(progressToNext, 4)}%` }}
            />
          </div>
        </div>
      )}
      {!nextMilestone && streak > 0 && (
        <p className={`mt-2 text-[10px] font-semibold ${cfg.labelColor}`}>
          🏆 Maximum milestone reached! You&apos;re a legend.
        </p>
      )}
    </div>
  );
}
