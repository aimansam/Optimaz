'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CalendarDays, RefreshCw } from 'lucide-react';
import { cn, PRIORITY_CONFIG, formatDate, isOverdue } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { useState, memo, useCallback } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { SubtaskList } from '@/components/tasks/subtask-list';

const PRIORITY_BORDER: Record<string, string> = {
  low: 'border-l-blue-400',
  medium: 'border-l-amber-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500',
};

const KanbanCardComponent = ({ task }: { task: Task }) => {
  const [editOpen, setEditOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms cubic-bezier(0.22, 1, 0.36, 1)',
    zIndex: isDragging ? 50 : undefined,
    boxShadow: isDragging ? '0 4px 24px 0 rgba(0,0,0,0.10)' : undefined,
  };

  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due_date) && task.status !== 'done';

  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;
  const percentComplete = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setEditOpen(true);
      e.preventDefault();
    }
    if (e.key === 'ArrowRight') {
      // Focus next card
      const next = (e.currentTarget.nextElementSibling as HTMLElement | null);
      next?.focus();
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft') {
      // Focus previous card
      const prev = (e.currentTarget.previousElementSibling as HTMLElement | null);
      prev?.focus();
      e.preventDefault();
    }
  }, []);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          'group relative rounded-xl border-l-[3px] bg-white ring-1 ring-slate-900/5 shadow-sm dark:bg-slate-900 dark:ring-slate-800 transition-all duration-150 will-change-transform',
          isDragging ? 'opacity-40 shadow-xl scale-[0.98] ring-2 ring-blue-400/60' : 'hover:shadow-md',
          overdue ? 'border-l-red-500!' : PRIORITY_BORDER[task.priority],
          // Touch-friendly padding and spacing
          'px-2 py-2 sm:px-3 sm:py-3'
        )}
        tabIndex={0}
        role="button"
        aria-label={`Edit task ${task.title}`}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-start gap-2 p-3">
          {/* Drag handle icon (visual only, not interactive) */}
          <span className="mt-0.5 shrink-0 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1 relative">
                        {/* Edit icon button */}
                        <button
                          className="absolute top-0 right-0 z-10 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditOpen(true);
                          }}
                          aria-label="Edit task"
                        >
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 11l6 6M3 21h6l11.293-11.293a1 1 0 0 0 0-1.414l-4.586-4.586a1 1 0 0 0-1.414 0L3 15v6z"/></svg>
                        </button>
            <p className="text-sm font-medium leading-snug text-slate-800 dark:text-slate-100 truncate">{task.title}</p>
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
		  </div>
		</div>
	  </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Task">
        <TaskForm task={task} onClose={() => setEditOpen(false)} />
      </Dialog>
    </>
  );
};

export const KanbanCard = memo(KanbanCardComponent);

