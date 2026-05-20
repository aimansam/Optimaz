'use client';

import { useState } from 'react';
import { CalendarDays, CheckCircle2, Edit2, ListChecks, PauseCircle, Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { useUpdateTask } from '@/hooks/use-tasks';
import { getWeekdayLabel } from '@/lib/recurrence';
import { cn, formatDate, PRIORITY_CONFIG } from '@/lib/utils';
import type { Task } from '@/lib/types';

interface RoutineCardProps {
  task: Task;
  onPause: (task: Task) => void;
  pausePending?: boolean;
}

function getCadenceLabel(task: Task) {
  if (task.recurrence_rule !== 'weekly') return task.recurrence_rule;
  const weekdays = getWeekdayLabel(task.recurrence_weekdays);
  return weekdays ? `weekly on ${weekdays}` : 'weekly';
}

function getNextLabel(task: Task) {
  if (!task.due_date) return 'No next date';
  return formatDate(task.due_date, task.due_time);
}

export function RoutineCard({ task, onPause, pausePending = false }: RoutineCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const updateTask = useUpdateTask();
  const priority = PRIORITY_CONFIG[task.priority];
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;
  const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <>
      <div className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <Repeat2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">{task.title}</p>
            {task.notes && <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">{task.notes}</p>}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <span className={cn('rounded-full px-2 py-1 text-[11px] font-semibold', priority.bg, priority.color)}>{priority.label}</span>
          {task.project && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {task.project.name}
            </span>
          )}
          {task.goal && (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {task.goal.title}
            </span>
          )}
        </div>

        <div className="mb-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Next: {getNextLabel(task)}</span>
            </span>
            <span className="shrink-0 capitalize">{getCadenceLabel(task)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" />
              {completedSubtasks}/{totalSubtasks} checks
            </span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">{subtaskPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-2 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${subtaskPercent}%` }} />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
          <Button type="button" variant="secondary" size="sm" onClick={() => updateTask.mutate({ id: task.id, status: 'done' })} disabled={updateTask.isPending}>
            <CheckCircle2 className="h-3.5 w-3.5" />
            Done
          </Button>
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" onClick={() => setEditOpen(true)}>
              <Edit2 className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => onPause(task)} disabled={pausePending}>
              <PauseCircle className="h-3.5 w-3.5" />
              Pause
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Routine">
        <TaskForm task={task} onClose={() => setEditOpen(false)} />
      </Dialog>
    </>
  );
}