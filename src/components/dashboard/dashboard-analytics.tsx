"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

function useTaskStats() {
  return useQuery({
    queryKey: ["task-stats"],
    queryFn: async () => {
    const supabase = createClient();
    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    const todayStr = today.toISOString().split("T")[0];
    const weekAgoStr = weekAgo.toISOString().split("T")[0];
    // Completed this week
    const { count: completed } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("status", "done")
      .gte("updated_at", weekAgoStr)
      .lte("updated_at", todayStr);
    // Overdue
    const { count: overdue } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .lt("due_date", todayStr)
      .neq("status", "done");
    // Upcoming
    const { count: upcoming } = await supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .gt("due_date", todayStr)
      .neq("status", "done");
      return { completed: completed ?? 0, overdue: overdue ?? 0, upcoming: upcoming ?? 0 };
    },
  });
}

export function DashboardAnalytics() {
  const { data, isLoading } = useTaskStats();
  return (
    <div className="mb-8 grid grid-cols-3 gap-4">
      <div className="rounded-xl bg-emerald-100 dark:bg-emerald-900/40 p-4 text-center">
        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{isLoading ? '...' : data?.completed ?? 0}</div>
        <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-100">Completed this week</div>
      </div>
      <div className="rounded-xl bg-red-100 dark:bg-red-900/40 p-4 text-center">
        <div className="text-2xl font-bold text-red-700 dark:text-red-300">{isLoading ? '...' : data?.overdue ?? 0}</div>
        <div className="text-xs font-semibold text-red-900 dark:text-red-100">Overdue</div>
      </div>
      <div className="rounded-xl bg-amber-100 dark:bg-amber-900/40 p-4 text-center">
        <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{isLoading ? '...' : data?.upcoming ?? 0}</div>
        <div className="text-xs font-semibold text-amber-900 dark:text-amber-100">Upcoming</div>
      </div>
    </div>
  );
}
