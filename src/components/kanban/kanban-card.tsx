'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalendarDays, RefreshCw } from 'lucide-react';
import { cn, PRIORITY_CONFIG, formatDate, isOverdue } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/lib/types';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { SubtaskList } from '@/components/tasks/subtask-list';



export function KanbanCard({ task }: { task: Task }) {
  const [editOpen, setEditOpen] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  // Subtask completion
  const totalSubtasks = task.subtasks?.length ?? 0;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const percentComplete = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due_date);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <>
      <div
        className={cn(
          'flex flex-col rounded-xl bg-white dark:bg-slate-800 shadow border border-slate-200 dark:border-slate-700 transition-all duration-200',
          'px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3 gap-1.5 sm:gap-2',
          isDragging && 'ring-2 ring-blue-400 border-transparent',
          'cursor-grab active:cursor-grabbing select-none'
        )}
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{task.title}</span>
          {task.due_date && (
            <span className="ml-auto text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">{formatDate(task.due_date)}</span>
          )}
        </div>
        {task.notes && (
          <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{task.notes}</div>
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
      </div>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Task">
        <TaskForm task={task} onClose={() => setEditOpen(false)} />
      </Dialog>
    </>
  );
}

