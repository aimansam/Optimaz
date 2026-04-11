'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CalendarDays, RefreshCw } from 'lucide-react';
import { cn, PRIORITY_CONFIG, formatDate, isOverdue } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';

const PRIORITY_BORDER: Record<string, string> = {
  low: 'border-l-blue-400',
  medium: 'border-l-amber-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500',
};

export function KanbanCard({ task }: { task: Task }) {
  const [editOpen, setEditOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due_date) && task.status !== 'done';

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group relative rounded-xl border-l-[3px] bg-white ring-1 ring-slate-900/5 shadow-sm dark:bg-slate-900 dark:ring-slate-800 cursor-pointer transition-all duration-150',
          isDragging ? 'opacity-40 shadow-xl scale-[0.98]' : 'hover:shadow-md',
          overdue ? 'border-l-red-500!' : PRIORITY_BORDER[task.priority]
        )}
        onClick={() => setEditOpen(true)}
      >
        <div className="flex items-start gap-2 p-3">
          {/* Drag handle — only visible on hover */}
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
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
              {(task.subtasks?.length ?? 0) > 0 && (
                <span className="text-[10px] font-medium text-slate-400">
                  {task.subtasks?.filter((s) => s.completed).length}/{task.subtasks?.length}
                </span>
              )}
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

