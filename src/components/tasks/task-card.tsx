'use client';
import { Check, CalendarDays, RefreshCw } from 'lucide-react';
import { cn, PRIORITY_CONFIG, formatDate, isOverdue } from '@/lib/utils';
import { getWeekdayLabel } from '@/lib/recurrence';
import { Badge } from '@/components/ui/badge';
import { TaskActions } from './task-actions';
import { useUpdateTask } from '@/hooks/use-tasks';
import type { Task } from '@/lib/types';
import { SubtaskList } from './subtask-list';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

const PRIORITY_LEFT_BORDER: Record<string, string> = {
  low: 'border-l-blue-400',
  medium: 'border-l-amber-400',
  high: 'border-l-orange-400',
  urgent: 'border-l-red-500',
};

export function TaskCard({ task, compact = false }: TaskCardProps) {
  // ...existing code...
  const updateTask = useUpdateTask();

  const priority = PRIORITY_CONFIG[task.priority];
  const overdue = isOverdue(task.due_date, task.due_time) && task.status !== 'done';
  const isDone = task.status === 'done';
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;
  const percentComplete = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const toggleDone = () => {
    updateTask.mutate({ id: task.id, status: isDone ? 'todo' : 'done' });
  };

  return (
    <div
      className={cn(
        'group relative rounded-xl border-l-[3px] bg-white shadow-sm ring-1 ring-slate-900/5 transition-all duration-150 hover:shadow-md dark:bg-slate-900 dark:ring-slate-800',
        isDone
          ? 'border-l-slate-200 opacity-60 dark:border-l-slate-700'
          : PRIORITY_LEFT_BORDER[task.priority],
        overdue && 'border-l-red-500!'
      )}
    >
        <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3.5">
          {/* Checkbox */}
          <button
            onClick={toggleDone}
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-150',
              isDone
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : 'border-slate-300 hover:border-slate-400 hover:shadow-sm hover:shadow-slate-400/20 dark:border-slate-600'
            )}
          >
            {isDone && <Check className="h-3 w-3 stroke-3" />}
          </button>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-sm font-medium leading-snug text-slate-800 dark:text-slate-100',
                isDone && 'line-through text-slate-400 dark:text-slate-500'
              )}
            >
              {task.title}
            </p>

            {!compact && task.notes && (
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">{task.notes}</p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {/* Priority badge */}
              <Badge className={cn('text-[10px] font-semibold tracking-wide', priority.bg, priority.color)}>
                {priority.label}
              </Badge>

              {/* Project */}
              {task.project && (
                <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px]">
                  <span
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: task.project.color }}
                  />
                  {task.project.name}
                </Badge>
              )}

              {/* Due date */}
              {task.due_date && (
                <span className={cn('flex items-center gap-0.5 text-[10px] font-medium', overdue ? 'text-red-500' : 'text-slate-400 dark:text-slate-500')}>
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(task.due_date, task.due_time)}
                  {/* Deadline countdown badge */}
                  <span className={cn('ml-1 rounded px-1.5 py-0.5 text-[10px] font-semibold',
                    overdue ? 'bg-red-100 text-red-600 dark:bg-red-900/40' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40')}
                  >
                    {(() => {
                      const today = new Date();
                      const due = new Date(`${task.due_date}T00:00:00`);
                      const diff = Math.ceil((due.setHours(0,0,0,0) - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24));
                      if (diff < 0) return 'Overdue';
                      if (diff === 0) return 'Due today';
                      if (diff === 1) return 'Due tomorrow';
                      return `Due in ${diff} days`;
                    })()}
                  </span>
                </span>
              )}

              {/* Recurring */}
              {task.is_recurring && (
                <span title={`Recurring ${task.recurrence_rule}${task.recurrence_rule === 'weekly' && getWeekdayLabel(task.recurrence_weekdays) ? ` on ${getWeekdayLabel(task.recurrence_weekdays)}` : ''}`}>
                  <RefreshCw className="h-3 w-3 text-slate-400" />
                </span>
              )}

              {/* Subtasks progress */}
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
          </div>

          {/* Actions */}
          <TaskActions task={task} className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" />
        </div>

        {/* Subtasks: always visible if present */}
        {totalSubtasks > 0 && (
          <div className="border-t border-slate-100 px-3.5 pb-3 pt-2.5 pl-12 dark:border-slate-800">
            <SubtaskList task={task} />
          </div>
        )}
    </div>
  );
}

