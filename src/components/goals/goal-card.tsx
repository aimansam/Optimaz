'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trash2, Target, CalendarDays, CheckCircle2, Sparkles } from 'lucide-react';
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
  const [hovered, setHovered] = useState(false);
  const deleteGoal = useDeleteGoal();
  const total = goal.tasks?.length ?? 0;
  const completed = goal.tasks?.filter((t) => t.status === 'done').length ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdue = isOverdue(goal.due_date);

  return (
    <div
      className="group relative rounded-xl transition-all duration-200"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: hovered ? `0 8px 28px var(--glow), 0 2px 8px rgba(0,0,0,0.08)` : '0 1px 3px rgba(0,0,0,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/goals/${goal.id}`} className="block p-5 active:opacity-80 transition-opacity duration-150">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: `${goal.color}18`,
              boxShadow: `0 0 12px ${goal.color}25`,
            }}
          >
            <Target className="h-5 w-5" style={{ color: goal.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
              {goal.title}
            </p>
            {goal.description && (
              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--muted-fg)' }}>
                {goal.description}
              </p>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs" style={{ color: 'var(--muted-fg)' }}>Progress</span>
            <span className="text-xs font-bold" style={{ color: goal.color }}>{percent}%</span>
          </div>
          <div
            className="h-1.5 w-full rounded-full overflow-hidden"
            style={{ background: 'var(--muted-bg)' }}
          >
            <div
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${percent}%`,
                background: `linear-gradient(90deg, ${goal.color}, ${goal.color}bb)`,
                boxShadow: percent > 0 ? `0 0 8px ${goal.color}50` : 'none',
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-fg)' }}>
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
          <div
            className="mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold text-center"
            style={{
              background: 'rgba(16,185,129,0.1)',
              color: '#10b981',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <Sparkles className="inline h-3.5 w-3.5 mr-1" />Goal Achieved!
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
        className="absolute right-3 top-3 rounded-lg p-1.5 transition-all duration-150"
        style={{ color: 'var(--muted-fg)' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)';
          (e.currentTarget as HTMLButtonElement).style.color = '#ef4444';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-fg)';
        }}
      >
        <Trash2 className="h-4 w-4" />
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
