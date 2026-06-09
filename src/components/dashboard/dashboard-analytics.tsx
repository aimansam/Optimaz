"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

function getDayLabel(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' });
}

function getLast7Days() {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
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
      const todayStr = today.toISOString().split("T")[0];
      const weekAgoStr = weekAgo.toISOString().split("T")[0];

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

      // Build per-day counts for last 7 days
      const days = getLast7Days();
      const countByDay = Object.fromEntries(days.map((d) => [d, 0]));
      for (const row of weeklyRes.data ?? []) {
        if (!row.completed_at) continue;
        const day = (row.completed_at as string).split("T")[0];
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

function BarChart({ data }: { data: { day: string; label: string; count: number }[] }) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completions · last 7 days</p>
      <div className="flex items-end gap-1.5 h-20">
        {data.map((d) => {
          const height = Math.max((d.count / maxCount) * 100, d.count > 0 ? 8 : 0);
          const isToday = d.label === today;
          return (
            <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
              {d.count > 0 && (
                <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">{d.count}</span>
              )}
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-sm transition-all duration-500 ${isToday ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'}`}
                  style={{ height: d.count > 0 ? `${height}%` : '3px', minHeight: '3px' }}
                  aria-label={`${d.label}: ${d.count} tasks`}
                />
              </div>
              <span className={`text-[9px] font-medium ${isToday ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'}`}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DashboardStatsStrip() {
  const { data, isLoading } = useTaskStats();
  return (
    <div className="mb-5 grid grid-cols-3 gap-2 sm:gap-3">
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center dark:bg-emerald-900/20 dark:border-emerald-900/40">
        <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{isLoading ? '…' : data?.completed ?? 0}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600/80 dark:text-emerald-400/80">Done this week</div>
      </div>
      <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center dark:bg-red-900/20 dark:border-red-900/40">
        <div className="text-xl font-bold text-red-600 dark:text-red-400">{isLoading ? '…' : data?.overdue ?? 0}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-red-500/80 dark:text-red-400/80">Overdue</div>
      </div>
      <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center dark:bg-amber-900/20 dark:border-amber-900/40">
        <div className="text-xl font-bold text-amber-600 dark:text-amber-300">{isLoading ? '…' : data?.upcoming ?? 0}</div>
        <div className="text-[10px] font-semibold uppercase tracking-wide text-amber-500/80 dark:text-amber-400/80">Upcoming</div>
      </div>
    </div>
  );
}

export function DashboardAnalytics() {
  const { data, isLoading } = useTaskStats();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      {isLoading ? (
        <div className="h-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      ) : (
        <BarChart data={data?.chartData ?? []} />
      )}
    </div>
  );
}
