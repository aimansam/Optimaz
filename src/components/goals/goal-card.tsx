'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Target, CalendarDays, CheckCircle2 } from 'lucide-react';
import { cn, formatDate, isOverdue } from '@/lib/utils';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useDeleteGoal } from '@/hooks/use-goals';
import type { Goal } from '@/lib/types';

interface GoalWithTasks extends Omit<Goal, 'tasks'> {
  tasks: { id: string; status: string }[];
}

interface GoalCardProps {
  goal: GoalWithTasks;
}

export function GoalCard({ goal }: GoalCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteGoal = useDeleteGoal();
  const total = goal.tasks?.length ?? 0;
  const completed = goal.tasks?.filter((t) => t.status === 'done').length ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdue = isOverdue(goal.due_date);

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-slate-700 dark:bg-slate-900">
      <Link href={`/goals/${goal.id}`} className="block">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: goal.color + '20' }}
          >
            <Target className="h-5 w-5" style={{ color: goal.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{goal.title}</p>
            {goal.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{goal.description}</p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Progress</span>
            <span className="text-xs font-semibold" style={{ color: goal.color }}>{percent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{ width: `${percent}%`, backgroundColor: goal.color }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {completed}/{total} tasks
          </span>
          {goal.due_date && (
            <span className={cn('flex items-center gap-1', overdue ? 'text-red-500' : '')}>
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(goal.due_date)}
            </span>
          )}
        </div>

        {/* Completion badge */}
        {percent === 100 && (
          <div className="mt-3 rounded-lg bg-green-50 dark:bg-green-900/20 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 text-center">
            Goal Achieved!
          </div>
        )}
      </Link>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setDeleteOpen(true);
        }}
        aria-label={`Delete goal ${goal.title}`}
        className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity rounded p-1 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <Trash2 className="h-4 w-4 text-red-400" />
      </button>
      <ConfirmationDialog
        open={deleteOpen}
        title="Delete goal"
        description={`Delete "${goal.title}"? Tasks linked to it will be unlinked.`}
        pending={deleteGoal.isPending}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteGoal.mutate(goal.id, { onSuccess: () => setDeleteOpen(false) })}
      />
    </div>
  );
}
