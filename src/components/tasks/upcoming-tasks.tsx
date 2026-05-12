"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { TaskList } from "./task-list";
import type { Task, TaskStatus } from "@/lib/types";

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
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
  });
}

interface UpcomingTasksProps {
  days?: number;
  filterQuery?: string;
  filterStatus?: TaskStatus | "";
  showHeading?: boolean;
}

export function UpcomingTasks({
  days = 7,
  filterQuery = "",
  filterStatus = "",
  showHeading = true,
}: UpcomingTasksProps) {
  const { data, isLoading } = useUpcomingTasks(days);
  if (isLoading) return <div className="py-4">Loading upcoming tasks...</div>;
  const filteredTasks = (data ?? []).filter((task) =>
    (!filterQuery || task.title.toLowerCase().includes(filterQuery.toLowerCase())) &&
    (!filterStatus || task.status === filterStatus)
  );
  return (
    <div className="mb-8">
      {showHeading && (
        <h3 className="mb-2 text-lg font-semibold text-slate-800 dark:text-slate-100">Upcoming Deadlines</h3>
      )}
      <TaskList tasks={filteredTasks} emptyMessage="No upcoming deadlines." showAddButton={false} />
    </div>
  );
}
