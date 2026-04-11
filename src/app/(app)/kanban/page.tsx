'use client';

import { Header } from '@/components/layout/header';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { useTasksByStatus } from '@/hooks/use-tasks';

export default function KanbanPage() {
  const { data: tasks, isLoading } = useTasksByStatus();

  return (
    <>
      <Header title="Kanban Board" />
      <div className="flex-1 overflow-hidden p-6">
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
