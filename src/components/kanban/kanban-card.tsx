'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrowLeft, ArrowRight, CalendarDays, GripVertical, RefreshCw } from 'lucide-react';
import { cn, PRIORITY_CONFIG, formatDate, isOverdue } from '@/lib/utils';
import { getWeekdayLabel } from '@/lib/recurrence';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TaskActions } from '@/components/tasks/task-actions';
import type { Task, TaskStatus } from '@/lib/types';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { useUpdateTask } from '@/hooks/use-tasks';

const PRIORITY_LEFT_COLOR: Record<string, string> = {
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

const STATUS_ORDER: TaskStatus[] = ['todo', 'in_progress', 'done'];

function getAdjacentStatus(status: TaskStatus, direction: -1 | 1) {
  const currentIndex = STATUS_ORDER.indexOf(status);
  return STATUS_ORDER[currentIndex + direction] ?? null;
}

interface KanbanCardProps {
  task: Task;
  /** When true the card is rendered inside DragOverlay — no sortable transform needed */
  isOverlay?: boolean;
}

export function KanbanCard({ task, isOverlay = false }: KanbanCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const updateTask = useUpdateTask();
  const { attributes, listeners, setActivatorNodeRef, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due_date, task.due_time) && task.status !== 'done';
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

  // When actively dragging from this position, show a minimal placeholder
  // so the column retains its height while the "real" card floats in DragOverlay
  if (isDragging && !isOverlay) {
    return (
      <div ref={setNodeRef} style={style} className="rounded-xl" aria-hidden="true">
        <div
          className="rounded-xl"
          style={{
            minHeight: 80,
            background: 'rgb(var(--accent) / 0.04)',
            border: '2px dashed rgb(var(--accent) / 0.22)',
          }}
        />
      </div>
    );
  }

  return (
    <>
      <div
        ref={isOverlay ? undefined : setNodeRef}
        style={{
          ...(!isOverlay ? style : {}),
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderLeft: `2px solid ${overdue ? '#ef4444' : PRIORITY_LEFT_COLOR[task.priority]}`,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
        className={cn(
          'group relative rounded-xl transition-shadow duration-150 hover:shadow-md',
        )}
        tabIndex={isOverlay ? -1 : 0}
        aria-label={`Task ${task.title}`}
        onKeyDown={isOverlay ? undefined : handleKeyDown}
      >
        <div className="flex items-start gap-2 p-3">
          <button
            ref={isOverlay ? undefined : setActivatorNodeRef}
            type="button"
            className="mt-0.5 shrink-0 rounded p-0.5 opacity-0 transition-all duration-150 focus:opacity-100 focus:outline-none group-hover:opacity-100"
            style={{ color: 'var(--muted-fg)', cursor: isOverlay ? 'grabbing' : 'grab' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--muted-bg)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '';
            }}
            aria-label={`Drag task ${task.title}`}
            {...(isOverlay ? {} : { ...attributes, ...listeners })}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1 relative">
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium leading-snug" style={{ color: 'var(--foreground)' }}>{task.title}</p>
              <TaskActions task={task} showComplete={false} showDelete={false} onEdit={() => setEditOpen(true)} className="shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100" />
            </div>
            {task.notes && (
              <p className="mt-0.5 text-xs line-clamp-1 leading-relaxed" style={{ color: 'var(--muted-fg)' }}>{task.notes}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <Badge className={cn('text-[10px] font-semibold tracking-wide', priority.bg, priority.color)}>
                {priority.label}
              </Badge>
              {task.project && (
                <Badge className="text-[10px]" style={{ background: 'var(--muted-bg)', color: 'var(--muted-fg)' } as React.CSSProperties}>
                  <span
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: task.project.color }}
                  />
                  {task.project.name}
                </Badge>
              )}
              {task.due_date && (
                <span className={cn('flex items-center gap-0.5 text-[10px] font-medium')} style={{ color: overdue ? '#ef4444' : 'var(--muted-fg)' }}>
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(task.due_date, task.due_time)}
                </span>
              )}
              {task.is_recurring && (
                <RefreshCw
                  className="h-3 w-3 text-slate-400"
                  aria-label={`Recurring ${task.recurrence_rule}${task.recurrence_rule === 'weekly' && getWeekdayLabel(task.recurrence_weekdays) ? ` on ${getWeekdayLabel(task.recurrence_weekdays)}` : ''}`}
                />
              )}
              {totalSubtasks > 0 && (
                <div className="flex flex-col gap-0.5 min-w-20">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-medium" style={{ color: 'var(--muted-fg)' }}>
                      {completedSubtasks}/{totalSubtasks} subtasks
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-500 ml-1">
                      {percentComplete}%
                    </span>
                  </div>
                  <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: 'var(--muted-bg)' }}>
                    <div
                      className="h-1 rounded-full transition-all duration-200"
                      style={{
                        width: `${percentComplete}%`,
                        background: 'linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent) / 0.7))',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 md:hidden md:group-hover:flex" style={{ borderTop: '1px solid var(--card-border)' }}>
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
              <TaskActions task={task} showLabels buttonClassName="h-7 px-2 text-[11px]" onEdit={() => setEditOpen(true)} />
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

