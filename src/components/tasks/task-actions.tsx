'use client';

import { useState } from 'react';
import { CheckCircle2, Edit2, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { useDeleteTask, useUpdateTask } from '@/hooks/use-tasks';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

interface TaskActionsProps {
  task: Task;
  className?: string;
  buttonClassName?: string;
  showLabels?: boolean;
  showComplete?: boolean;
  showDelete?: boolean;
  onEdit?: () => void;
}

export function TaskActions({
  task,
  className,
  buttonClassName = 'h-7 w-7 rounded-lg',
  showLabels = false,
  showComplete = true,
  showDelete = true,
  onEdit,
}: TaskActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const isDone = task.status === 'done';

  function handleEdit() {
    if (onEdit) {
      onEdit();
      return;
    }
    setEditOpen(true);
  }

  function toggleDone() {
    updateTask.mutate({ id: task.id, status: isDone ? 'todo' : 'done' });
  }

  function handleDelete() {
    deleteTask.mutate(task.id, { onSuccess: () => setDeleteOpen(false) });
  }

  return (
    <>
      <div className={cn('flex items-center gap-0.5', className)}>
        {showComplete && (
          <Button
            type="button"
            variant={isDone ? 'ghost' : 'secondary'}
            size={showLabels ? 'sm' : 'icon'}
            onClick={toggleDone}
            disabled={updateTask.isPending}
            className={cn(buttonClassName, isDone && 'text-emerald-500')}
            aria-label={isDone ? `Reopen ${task.title}` : `Complete ${task.title}`}
          >
            {isDone ? <RotateCcw className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            {showLabels && (isDone ? 'Reopen' : 'Done')}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size={showLabels ? 'sm' : 'icon'}
          onClick={handleEdit}
          className={buttonClassName}
          aria-label={`Edit ${task.title}`}
        >
          <Edit2 className="h-3.5 w-3.5" />
          {showLabels && 'Edit'}
        </Button>
        {showDelete && (
          <Button
            type="button"
            variant="ghost"
            size={showLabels ? 'sm' : 'icon'}
            onClick={() => setDeleteOpen(true)}
            disabled={deleteTask.isPending}
            className={cn(buttonClassName, 'text-red-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30')}
            aria-label={`Delete ${task.title}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
            {showLabels && 'Delete'}
          </Button>
        )}
      </div>

      {!onEdit && (
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Task">
          <TaskForm task={task} onClose={() => setEditOpen(false)} />
        </Dialog>
      )}
      <ConfirmationDialog
        open={deleteOpen}
        title="Delete task"
        description={`Delete "${task.title}"? This action cannot be undone.`}
        pending={deleteTask.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}
