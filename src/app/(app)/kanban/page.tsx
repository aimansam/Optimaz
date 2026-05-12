'use client';

import { KanbanBoard } from '@/components/kanban/kanban-board';
import { useTasksByStatus } from '@/hooks/use-tasks';

export default function KanbanPage() {
  const { data: tasks, isLoading } = useTasksByStatus();

  return (
    <>

      <div className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden p-2 sm:p-4 md:p-6">
        {isLoading ? (
          <div className="flex gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 w-72 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse shrink-0" />
            ))}
          </div>
        ) : (
          <KanbanBoard tasks={tasks ?? []} />
        )}
      </div>
    </>
  );
}
