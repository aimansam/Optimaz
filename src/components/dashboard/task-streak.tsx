'use client';

import { useMemo } from 'react';
import { Flame } from 'lucide-react';
import type { Task } from '@/lib/types';

interface TaskStreakProps {
  tasks: Task[];
}

function getDateKey(dateStr: string): string {
  // Normalize to YYYY-MM-DD
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
  // Get unique dates on which at least one task was completed
  // Prefer completed_at (exact completion time), fall back to updated_at
  const doneTasks = tasks.filter(t => t.status === 'done');
  const completedDates = new Set(
    doneTasks.map(t => getDateKey(t.completed_at ?? t.updated_at))
  );

  if (completedDates.size === 0) return 0;

  const today = getTodayKey();
  const yesterday = getYesterdayKey();

  // Streak only counts if user completed something today OR yesterday (grace period)
  const hasRecentActivity = completedDates.has(today) || completedDates.has(yesterday);
  if (!hasRecentActivity) return 0;

  // Walk backwards from today counting consecutive days
  let streak = 0;
  const cursor = new Date();

  // If nothing done today, start counting from yesterday
  if (!completedDates.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (true) {
    const key = cursor.toISOString().split('T')[0];
    if (!completedDates.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
    // Safety limit — max 365 days
    if (streak >= 365) break;
  }

  return streak;
}

function getStreakLabel(streak: number): string {
  if (streak === 0) return 'Start your streak today!';
  if (streak === 1) return 'Great start — come back tomorrow!';
  if (streak < 5) return 'Building momentum!';
  if (streak < 10) return 'You\'re on a roll!';
  if (streak < 30) return 'On fire! Keep going!';
  return 'Legendary streak! 🏆';
}

export function TaskStreak({ tasks }: TaskStreakProps) {
  const streak = useMemo(() => calculateStreak(tasks), [tasks]);
  const label = getStreakLabel(streak);

  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-3 dark:border-orange-900/30 dark:bg-orange-950/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
            <Flame className={`h-5 w-5 ${streak > 0 ? 'text-orange-500' : 'text-slate-400 dark:text-slate-500'}`} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{streak}</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {streak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-500 dark:text-orange-400">
              Task streak
            </p>
          </div>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
