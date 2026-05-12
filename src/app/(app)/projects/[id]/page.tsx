'use client';

import { use } from 'react';
import { TaskList } from '@/components/tasks/task-list';
import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: tasks, isLoading } = useTasks(id);
  const { data: projects } = useProjects();
  const project = projects?.find((p) => p.id === id);

  return (
    <>

      <div className="flex-1 overflow-y-auto p-6">
        {project && (
          <div className="mb-4 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: project.color }} />
            <span className="text-sm text-slate-500">{project.description}</span>
          </div>
        )}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <TaskList
            tasks={tasks ?? []}
            emptyMessage="No tasks in this project yet"
            defaultProjectId={id}
          />
        )}
      </div>
    </>
  );
}
