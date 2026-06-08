"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { isOverdue } from "@/lib/utils";
import { TaskList } from "./task-list";
import { DEFAULT_TASK_FILTERS, type TaskFilters } from "./task-filter-bar";
import type { Task } from "@/lib/types";

const UPCOMING_TASK_LIMIT = 100;

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
        .gt("due_date", todayStr)
        .lte("due_date", endStr)
        .neq("status", "done")
        .order("due_date", { ascending: true })
        .limit(UPCOMING_TASK_LIMIT);
      if (error) throw error;
      return data as Task[];
    },
  });
}

interface UpcomingTasksProps {
  days?: number;
  filters?: TaskFilters;
  showHeading?: boolean;
}

export function UpcomingTasks({
  days = 7,
  filters = DEFAULT_TASK_FILTERS,
  showHeading = true,
}: UpcomingTasksProps) {
  const { data, isLoading } = useUpcomingTasks(days);
  if (isLoading) return <div className="py-4 text-sm text-slate-400">Loading upcoming tasks…</div>;

  const todayStr = new Date().toISOString().split("T")[0];
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = weekEnd.toISOString().split("T")[0];

  const filteredTasks = (data ?? []).filter((task) => {
    if (filters.query && !task.title.toLowerCase().includes(filters.query.toLowerCase())) return false;
    if (filters.status && task.status !== filters.status) return false;
    if (filters.priority && task.priority !== filters.priority) return false;
    if (filters.projectId && task.project_id !== filters.projectId) return false;
    if (filters.dueFilter === 'today' && task.due_date !== todayStr) return false;
    if (filters.dueFilter === 'this_week' && task.due_date && task.due_date > weekEndStr) return false;
    if (filters.dueFilter === 'overdue' && !isOverdue(task.due_date, task.due_time)) return false;
    if (filters.dueFilter === 'no_date' && task.due_date) return false;
    return true;
  });

  return (
    <div className="mb-8">
      {showHeading && (
        <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Upcoming Deadlines</h3>
      )}
      <TaskList tasks={filteredTasks} emptyMessage="No upcoming deadlines." showAddButton={false} />
    </div>
  );
}
