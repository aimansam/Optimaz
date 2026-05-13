'use client';

import { useState } from 'react';
import { CheckCircle2, Plus } from 'lucide-react';
import { TaskCard } from './task-card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { TaskQuestionFlow } from './task-question-flow';
import { useDeleteTask, useUpdateTask } from '@/hooks/use-tasks';
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const bulkPending = updateTask.isPending || deleteTask.isPending;

  function toggleSelect(id: string) {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function clearSelected() {
    setSelected([]);
    setSelectionMode(false);
  }
  async function bulkDelete() {
    await Promise.all(selected.map((id) => deleteTask.mutateAsync(id)));
    clearSelected();
    setDeleteConfirmOpen(false);
  }
  async function bulkComplete() {
    await Promise.all(selected.map((id) => updateTask.mutateAsync({ id, status: 'done' })));
    clearSelected();
  }

  return (
    <div className="space-y-2">

      {tasks.length > 0 && !selectionMode && (
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={() => setSelectionMode(true)}>Select tasks</Button>
        </div>
      )}

      {selectionMode && (
        <div className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800/70">
          <span className="mr-auto text-xs font-semibold text-slate-600 dark:text-slate-300">
            {selected.length > 0 ? `${selected.length} selected` : 'Select tasks'}
          </span>
          <Button size="sm" variant="secondary" onClick={bulkComplete} disabled={bulkPending || selected.length === 0}>Mark Complete</Button>
          <Button size="sm" variant="danger" onClick={() => setDeleteConfirmOpen(true)} disabled={bulkPending || selected.length === 0}>Delete</Button>
          <Button size="sm" variant="ghost" onClick={clearSelected} disabled={bulkPending}>Done</Button>
        </div>
      )}

      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-2">
          {selectionMode && (
            <input
              type="checkbox"
              checked={selected.includes(task.id)}
              onChange={() => toggleSelect(task.id)}
              aria-label={`Select ${task.title}`}
              className="h-4 w-4 rounded border-slate-300 accent-emerald-500 dark:border-slate-700"
            />
          )}
          <div className="flex-1">
            <TaskCard task={task} />
          </div>
        </div>
      ))}

      {tasks.length === 0 && (
        <EmptyState
          icon={<CheckCircle2 className="h-6 w-6" />}
          title={emptyMessage}
          description={showAddButton ? 'Create a task here when you are ready to plan the next step.' : 'No matching tasks need your attention right now.'}
          action={showAddButton ? <Button size="sm" onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Add Task</Button> : undefined}
        />
      )}

      {showAddButton && tasks.length > 0 && (
        <button
          onClick={() => setAddOpen(true)}
          className="group flex w-full items-center gap-2.5 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all dark:border-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-800/40 dark:hover:text-slate-300"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
          Add task
        </button>
      )}

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Task" className="max-w-lg min-h-0">
        <TaskQuestionFlow
          defaultStatus={defaultStatus}
          defaultProjectId={defaultProjectId}
          defaultGoalId={defaultGoalId}
          onClose={() => setAddOpen(false)}
        />
      </Dialog>
      <ConfirmationDialog
        open={deleteConfirmOpen}
        title="Delete selected tasks"
        description={`Delete ${selected.length} selected task${selected.length === 1 ? '' : 's'}? This action cannot be undone.`}
        pending={deleteTask.isPending}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={bulkDelete}
      />
    </div>
  );
}

