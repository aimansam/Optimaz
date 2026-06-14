"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

const supabase = createClient();

function getDayLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
}

/** Returns a date as YYYY-MM-DD in local timezone. */
function localDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getLast7Days() {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(localDateStr(d));
  }
  return days;
}

function useTaskStats() {
  return useQuery({
    queryKey: ["task-stats"],
    queryFn: async () => {
      const today = new Date();
      const weekAgo = new Date();
      weekAgo.setDate(today.getDate() - 7);
      const todayStr = localDateStr(today);
      const weekAgoStr = localDateStr(weekAgo);

      const [completedRes, overdueRes, upcomingRes, weeklyRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("status", "done")
          .gte("completed_at", weekAgoStr),
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .lt("due_date", todayStr)
          .neq("status", "done")
          .is("archived_at", null),
        supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .gt("due_date", todayStr)
          .neq("status", "done")
          .is("archived_at", null),
        supabase
          .from("tasks")
          .select("completed_at")
          .eq("status", "done")
          .gte("completed_at", `${weekAgoStr}T00:00:00`)
          .not("completed_at", "is", null),
      ]);

      // Build per-day counts for last 7 days — use LOCAL date to match the day labels
      const days = getLast7Days();
      const countByDay = Object.fromEntries(days.map((d) => [d, 0]));
      for (const row of weeklyRes.data ?? []) {
        if (!row.completed_at) continue;
        const day = new Date(row.completed_at as string).toLocaleDateString('en-CA');
        if (day in countByDay) countByDay[day]++;
      }
      const chartData = days.map((d) => ({ day: d, label: getDayLabel(d), count: countByDay[d] }));

      return {
        completed: completedRes.count ?? 0,
        overdue: overdueRes.count ?? 0,
        upcoming: upcomingRes.count ?? 0,
        chartData,
      };
    },
  });
}

const MAX_BAR_HEIGHT = 52; // px

function BarChart({ data }: { data: { day: string; label: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div className="space-y-3">
      <p
        className="text-[10px] font-semibold uppercase tracking-widest"
        style={{ color: 'var(--muted-fg)', opacity: 0.7 }}
      >
        Completions · last 7 days
      </p>
      <div className="flex items-end gap-1.5" style={{ height: `${MAX_BAR_HEIGHT + 28}px` }}>
        {data.map((d) => {
          const barPx = d.count > 0
            ? Math.max(Math.round((d.count / maxCount) * MAX_BAR_HEIGHT), 8)
            : 3;
          const isToday = d.label === today;
          return (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              {d.count > 0 && (
                <span
                  className="text-[9px] font-bold"
                  style={{ color: isToday ? 'rgb(var(--accent))' : 'var(--muted-fg)' }}
                >
                  {d.count}
                </span>
              )}
              <div
                className="w-full rounded-md transition-all duration-500"
                style={{
                  height: `${barPx}px`,
                  background: isToday
                    ? 'linear-gradient(to top, rgb(var(--accent)), rgb(var(--accent) / 0.7))'
                    : 'rgb(var(--accent) / 0.2)',
                  boxShadow: isToday ? '0 0 10px var(--glow)' : 'none',
                }}
                aria-label={`${d.label}: ${d.count} tasks`}
              />
              <span
                className="text-[9px] font-medium"
                style={{
                  color: isToday ? 'rgb(var(--accent))' : 'var(--muted-fg)',
                  fontWeight: isToday ? 700 : 500,
                }}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Stat card — slim horizontal strip on mobile, tall centered card on desktop
function StatCard({
  icon: Icon,
  value,
  label,
  color,
  glowColor,
  isLoading,
  compact,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  glowColor: string;
  isLoading: boolean;
  compact?: boolean;
}) {
  if (compact) {
    // Mobile-first slim variant: icon + number inline, label below
    return (
      <div
        className="rounded-xl p-2 flex flex-col items-center text-center transition-all duration-200"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
      >
        <Icon className="h-4 w-4 mb-1" style={{ color }} />
        <div
          className="text-base font-bold leading-none tabular-nums"
          style={{ color: 'var(--foreground)' }}
        >
          {isLoading ? '…' : value}
        </div>
        <div
          className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--muted-fg)' }}
        >
          {label}
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl p-3 flex flex-col items-center text-center transition-all duration-200"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg mb-2"
        style={{
          background: `${glowColor}22`,
          boxShadow: `0 0 12px ${glowColor}33`,
        }}
      >
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div
        className="text-xl font-bold leading-none"
        style={{ color: 'var(--foreground)' }}
      >
        {isLoading ? '…' : value}
      </div>
      <div
        className="mt-1 text-[10px] font-semibold uppercase tracking-wide"
        style={{ color: 'var(--muted-fg)' }}
      >
        {label}
      </div>
    </div>
  );
}

export function DashboardStatsStrip({ compact, inline }: { compact?: boolean; inline?: boolean }) {
  const { data, isLoading } = useTaskStats();

  const stats = [
    { icon: CheckCircle2, value: data?.completed ?? 0, label: 'Done',     color: '#10b981', glowColor: '#10b981' },
    { icon: AlertCircle,  value: data?.overdue ?? 0,   label: 'Overdue',  color: '#ef4444', glowColor: '#ef4444' },
    { icon: Clock,        value: data?.upcoming ?? 0,  label: 'Soon',     color: '#f59e0b', glowColor: '#f59e0b' },
  ];

  // Inline mode — single horizontal pill row for mobile dashboard header
  if (inline) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest shrink-0" style={{ color: 'var(--muted-fg)', opacity: 0.6 }}>
          Week
        </span>
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <span key={s.label} className="flex items-center gap-1">
              {i > 0 && <span className="text-[10px]" style={{ color: 'var(--muted-fg)', opacity: 0.3 }}>·</span>}
              <Icon className="h-3 w-3 shrink-0" style={{ color: s.color }} />
              <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
                {isLoading ? '…' : s.value}
              </span>
              <span className="text-[10px]" style={{ color: 'var(--muted-fg)' }}>{s.label}</span>
            </span>
          );
        })}
      </div>
    );
  }

  if (compact) {
    return (
      <div className="mb-3 space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)', opacity: 0.7 }}>
          This week
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} isLoading={isLoading} compact />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
      {stats.map((s) => (
        <StatCard key={s.label} {...s} isLoading={isLoading} />
      ))}
    </div>
  );
}

export function DashboardAnalytics() {
  const { data, isLoading } = useTaskStats();

  return (
    <div
      className="rounded-xl p-3 sm:p-4"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      {isLoading ? (
        <div
          className="h-24 animate-pulse rounded-lg"
          style={{ background: 'var(--muted-bg)' }}
        />
      ) : (
        <BarChart data={data?.chartData ?? []} />
      )}
    </div>
  );
}
