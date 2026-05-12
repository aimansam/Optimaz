'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Edit2, GripVertical, RefreshCw, RotateCcw } from 'lucide-react';
import { cn, PRIORITY_CONFIG, formatDate, isOverdue } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Task, TaskStatus } from '@/lib/types';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { SubtaskList } from '@/components/tasks/subtask-list';
import { useUpdateTask } from '@/hooks/use-tasks';

const PRIORITY_BORDER: Record<string, string> = {
  low: 'border-l-blue-400',
  medium: 'border-l-amber-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500',
};

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done'];

function getAdjacentStatus(status: TaskStatus, direction: -1 | 1) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[currentIndex + direction] ?? null;
}

export function KanbanCard({ task }: { task: Task }) {
  const [editOpen, setEditOpen] = useState(false);
  const updateTask = useUpdateTask();
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due_date) && task.status !== 'done';
  const previousStatus = getAdjacentStatus(task.status, -1);
  const nextStatus = getAdjacentStatus(task.status, 1);

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;
  const percentComplete = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Keyboard navigation
  function updateStatus(status: TaskStatus) {
    updateTask.mutate({ id: task.id, status });
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      setEditOpen(true);
      event.preventDefault();
    }
    if (event.key === 'ArrowRight') {
      // Focus next card
      const next = (event.currentTarget.nextElementSibling as HTMLElement | null);
      next?.focus();
      event.preventDefault();
    }
    if (event.key === 'ArrowLeft') {
      // Focus previous card
      const prev = (event.currentTarget.previousElementSibling as HTMLElement | null);
      prev?.focus();
      event.preventDefault();
    }
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group relative rounded-xl border-l-[3px] bg-white ring-1 ring-slate-900/5 shadow-sm dark:bg-slate-900 dark:ring-slate-800 transition-all duration-150',
          isDragging ? 'opacity-40 shadow-xl scale-[0.98]' : 'hover:shadow-md',
          overdue ? 'border-l-red-500!' : PRIORITY_BORDER[task.priority]
        )}
        tabIndex={0}
        aria-label={`Task ${task.title}`}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start gap-2 p-3">
          <button
            ref={setActivatorNodeRef}
            type="button"
            className="mt-0.5 shrink-0 rounded p-0.5 text-slate-300 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-500 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-300 group-hover:opacity-100 dark:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label={`Drag task ${task.title}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 relative">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium leading-snug text-slate-800 dark:text-slate-100">{task.title}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 rounded-lg opacity-100 md:opacity-0 md:group-hover:opacity-100"
                onClick={() => setEditOpen(true)}
                aria-label={`Edit ${task.title}`}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            {task.notes && (
              <p className="mt-0.5 text-xs text-slate-400 line-clamp-2 leading-relaxed">{task.notes}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge className={cn('text-[10px] font-semibold tracking-wide', priority.bg, priority.color)}>
                {priority.label}
              </Badge>
              {task.project && (
                <Badge className="bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 text-[10px]">
                  <span
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: task.project.color }}
                  />
                  {task.project.name}
                </Badge>
              )}
              {task.due_date && (
                <span className={cn('flex items-center gap-0.5 text-[10px] font-medium', overdue ? 'text-red-500' : 'text-slate-400')}>
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(task.due_date)}
                </span>
              )}
              {task.is_recurring && <RefreshCw className="h-3 w-3 text-slate-400" />}
              {totalSubtasks > 0 && (
                <div className="flex flex-col gap-0.5 min-w-20">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium text-slate-400">
                      {completedSubtasks}/{totalSubtasks} subtasks
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-500 ml-1">
                      {percentComplete}%
                    </span>
                  </div>
                  <div className="h-1 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-1 bg-emerald-500 transition-all duration-200"
                      style={{ width: `${percentComplete}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Show interactive subtasks or add button always */}
            <div className="mt-2">
              <SubtaskList task={task} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 dark:border-slate-800">
              {previousStatus && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => updateStatus(previousStatus)}
                  disabled={updateTask.isPending}
                  aria-label={`Move ${task.title} left`}
                >
                  <ArrowLeft className="h-3 w-3" />
                  Move back
                </Button>
              )}
              {nextStatus && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 px-2 text-[11px]"
                  onClick={() => updateStatus(nextStatus)}
                  disabled={updateTask.isPending}
                  aria-label={`Move ${task.title} forward`}
                >
                  Move next
                  <ArrowRight className="h-3 w-3" />
                </Button>
              )}
              <Button
                type="button"
                variant={task.status === 'done' ? 'ghost' : 'secondary'}
                size="sm"
                className="h-7 px-2 text-[11px]"
                onClick={() => updateStatus(task.status === 'done' ? 'todo' : 'done')}
                disabled={updateTask.isPending}
                aria-label={task.status === 'done' ? `Reopen ${task.title}` : `Mark ${task.title} done`}
              >
                {task.status === 'done' ? <RotateCcw className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                {task.status === 'done' ? 'Reopen' : 'Done'}
              </Button>
            </div>
		  </div>
		</div>
	  </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Task">
        <TaskForm task={task} onClose={() => setEditOpen(false)} />
      </Dialog>
    </>
  );
}

