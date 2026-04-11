'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './task-card';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from './task-form';
import type { Task, TaskStatus } from '@/lib/types';

interface TaskListProps {
  tasks: Task[];
  emptyMessage?: string;
  defaultStatus?: TaskStatus;
  defaultProjectId?: string;
  defaultGoalId?: string;
  showAddButton?: boolean;
}

export function TaskList({
  tasks,
  emptyMessage = 'No tasks yet',
  defaultStatus = 'todo',
  defaultProjectId,
  defaultGoalId,
  showAddButton = true,
}: TaskListProps) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}

      {tasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-14 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
            <span className="text-2xl">✓</span>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{emptyMessage}</p>
        </div>
      )}

      {showAddButton && (
        <button
          onClick={() => setAddOpen(true)}
          className="group flex w-full items-center gap-2.5 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all dark:border-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-800/40 dark:hover:text-slate-300"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
          Add task
        </button>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="New Task">
        <TaskForm
          defaultStatus={defaultStatus}
          defaultProjectId={defaultProjectId}
          defaultGoalId={defaultGoalId}
          onClose={() => setAddOpen(false)}
        />
      </Dialog>
    </div>
  );
}

