"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { TaskList } from "./task-list";
import type { Task } from "@/lib/types";

function useUpcomingTasks(days: number = 7) {
  return useQuery<Task[]>({
    queryKey: ["tasks", "upcoming", days],
    queryFn: async () => {
      const supabase = createClient();
      const today = new Date();
      const end = new Date();
      end.setDate(today.getDate() + days);
      const todayStr = today.toISOString().split("T")[0];
      const endStr = end.toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("tasks")
        .select("*, subtasks(*), project:projects(id,name,color)")
        .gte("due_date", todayStr)
        .lte("due_date", endStr)
        .neq("status", "done")
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function UpcomingTasks({ days = 7, showHeading = true }: { days?: number, showHeading?: boolean }) {
  const { data, isLoading } = useUpcomingTasks(days);
  if (isLoading) return <div className="py-4">Loading upcoming tasks...</div>;
  if (!data || data.length === 0) return null;
  return (
    <div className="mb-8">
      {showHeading && (
        <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Upcoming Deadlines</h3>
      )}
      <TaskList tasks={data} />
    </div>
  );
}
