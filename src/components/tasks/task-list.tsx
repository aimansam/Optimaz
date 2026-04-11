'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { TaskCard } from './task-card';
import { Button } from '@/components/ui/button';
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
  const [selected, setSelected] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  // ...existing code...
  function clearSelected() {
    setSelected([]);
  }
  function bulkDelete() {
    // TODO: Integrate with delete mutation
    alert(`Delete tasks: ${selected.join(', ')}`);
    clearSelected();
  }
  function bulkComplete() {
    // TODO: Integrate with complete mutation
    alert(`Complete tasks: ${selected.join(', ')}`);
    clearSelected();
  }

  return (
    <div className="space-y-2">

      {/* Bulk actions toolbar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-2 mb-2 p-2 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-semibold">{selected.length} selected</span>
          <Button size="sm" variant="secondary" onClick={bulkComplete}>Mark Complete</Button>
          <Button size="sm" variant="danger" onClick={bulkDelete}>Delete</Button>
          <Button size="sm" variant="ghost" onClick={clearSelected}>Clear</Button>
        </div>
      )}

      {/* Task list with checkboxes */}
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected.includes(task.id)}
            onChange={() => toggleSelect(task.id)}
            className="accent-emerald-500 h-4 w-4 rounded border-slate-300 dark:border-slate-700"
          />
          <div className="flex-1">
            <TaskCard task={task} />
          </div>
        </div>
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

