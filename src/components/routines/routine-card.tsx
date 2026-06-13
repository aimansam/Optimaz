'use client';

import { useState } from 'react';
import { CalendarDays, CheckCircle2, Edit2, Flame, History, ListChecks, PauseCircle, Repeat2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { useUpdateTask } from '@/hooks/use-tasks';
import { getWeekdayLabel } from '@/lib/recurrence';
import { cn, formatDate, PRIORITY_CONFIG } from '@/lib/utils';
import type { Task } from '@/lib/types';

interface RoutineCardProps {
  task: Task;
  history?: Task[];
  onPause: (task: Task) => void;
  pausePending?: boolean;
}

function getStreak(history: Task[], recurrenceRule: string | null): number {
  if (history.length === 0) return 0;
  const completions = history
    .filter(t => t.completed_at)
    .map(t => new Date(t.completed_at as string))
    .sort((a, b) => b.getTime() - a.getTime());
  if (completions.length === 0) return 0;
  let streak = 1;
  for (let i = 0; i < completions.length - 1; i++) {
    const curr = completions[i];
    const prev = completions[i + 1];
    if (recurrenceRule === 'daily') {
      const c = new Date(curr.getFullYear(), curr.getMonth(), curr.getDate());
      const p = new Date(prev.getFullYear(), prev.getMonth(), prev.getDate());
      const diff = Math.round((c.getTime() - p.getTime()) / 86400000);
      if (diff === 1) streak++;
      else break;
    } else if (recurrenceRule === 'weekly') {
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
      if (diffDays >= 5 && diffDays <= 9) streak++;
      else break;
    } else if (recurrenceRule === 'monthly') {
      const monthDiff = (curr.getFullYear() - prev.getFullYear()) * 12 + (curr.getMonth() - prev.getMonth());
      if (monthDiff === 1) streak++;
      else break;
    } else break;
  }
  return streak;
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

function formatCompletedAt(value: string | null) {
  if (!value) return 'Unknown date';
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function RoutineCard({ task, history = [], onPause, pausePending = false }: RoutineCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const updateTask = useUpdateTask();
  const priority = PRIORITY_CONFIG[task.priority];
  const completedSubtasks = task.subtasks?.filter(subtask => subtask.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;
  const subtaskPercent = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;
  const hasChecklist = totalSubtasks > 0;
  const lastCompleted = history[0];
  const recentHistory = history.slice(0, 8);
  const streak = getStreak(history, task.recurrence_rule);

  return (
    <>
      <div
        className="group relative rounded-xl transition-all duration-200"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          padding: '20px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: 'var(--muted-bg)',
              color: 'rgb(var(--accent))',
            }}
          >
            <Repeat2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-semibold" style={{ color: 'var(--foreground)' }}>
                {task.title}
              </p>
              {streak >= 2 && (
                <span
                  className="shrink-0 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold"
                  style={{
                    background: 'rgba(249,115,22,0.12)',
                    color: '#f97316',
                    border: '1px solid rgba(249,115,22,0.2)',
                  }}
                >
                  <Flame className="h-3 w-3" /> {streak}
                </span>
              )}
            </div>
            {task.notes && (
              <p className="mt-0.5 line-clamp-2 text-xs" style={{ color: 'var(--muted-fg)' }}>
                {task.notes}
              </p>
            )}
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <span
            className={cn('rounded-full px-2 py-1 text-[11px] font-semibold', priority.bg, priority.color)}
          >
            {priority.label}
          </span>
          {task.project && (
            <span
              className="rounded-full px-2 py-1 text-[11px] font-semibold"
              style={{
                background: 'var(--muted-bg)',
                color: 'var(--muted-fg)',
              }}
            >
              {task.project.name}
            </span>
          )}
          {task.goal && (
            <span
              className="rounded-full px-2 py-1 text-[11px] font-semibold"
              style={{
                background: 'var(--muted-bg)',
                color: 'var(--muted-fg)',
              }}
            >
              {task.goal.title}
            </span>
          )}
        </div>

        <div className="mb-3 space-y-2 text-xs" style={{ color: 'var(--muted-fg)' }}>
          <div className="flex min-w-0 items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Next: {getNextLabel(task)}</span>
          </div>
          <div className="flex min-w-0 items-center gap-1.5">
            <Repeat2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate capitalize">{getCadenceLabel(task)}</span>
          </div>

          {hasChecklist ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5">
                  <ListChecks className="h-3.5 w-3.5" />
                  {completedSubtasks}/{totalSubtasks} checks
                </span>
                <span className="font-semibold">{subtaskPercent}%</span>
              </div>
              <div
                className="h-1.5 w-full rounded-full overflow-hidden"
                style={{ background: 'var(--muted-bg)' }}
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${subtaskPercent}%`,
                    background: 'linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent) / 0.7))',
                  }}
                />
              </div>
            </>
          ) : (
            <span className="flex items-center gap-1.5" style={{ color: 'var(--muted-fg)', opacity: 0.6 }}>
              <ListChecks className="h-3.5 w-3.5" />
              No checklist
            </span>
          )}

          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-all duration-150"
            style={{
              background: 'var(--muted-bg)',
              border: '1px solid var(--card-border)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgb(var(--accent) / 0.25)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--card-border)';
            }}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <History className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{history.length} completion{history.length === 1 ? '' : 's'}</span>
            </span>
            <span className="shrink-0" style={{ color: 'var(--muted-fg)', opacity: 0.7 }}>
              {lastCompleted ? formatCompletedAt(lastCompleted.completed_at) : 'No history'}
            </span>
          </button>
        </div>

        <div
          className="flex flex-wrap items-center justify-between gap-2 pt-3"
          style={{ borderTop: '1px solid var(--card-border)' }}
        >
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => updateTask.mutate({ id: task.id, status: 'done' })}
            disabled={updateTask.isPending}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {updateTask.isPending ? 'Completing...' : 'Complete today'}
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
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} title="Routine History" className="min-h-0 sm:max-w-lg">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{task.title}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--muted-fg)' }}>
              {history.length > 0 ? `${history.length} completed occurrence${history.length === 1 ? '' : 's'} found.` : 'No completed occurrences yet.'}
            </p>
          </div>
          {recentHistory.length > 0 ? (
            <div className="space-y-2">
              {recentHistory.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl p-3"
                  style={{
                    background: 'var(--muted-bg)',
                    border: '1px solid var(--card-border)',
                  }}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium" style={{ color: 'var(--foreground)' }}>{item.title}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-fg)' }}>
                      Due {item.due_date ? formatDate(item.due_date, item.due_time) : 'without date'}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold"
                    style={{
                      background: 'rgba(16,185,129,0.1)',
                      color: '#10b981',
                      border: '1px solid rgba(16,185,129,0.2)',
                    }}
                  >
                    {formatCompletedAt(item.completed_at)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="rounded-xl p-4 text-sm"
              style={{
                border: '1px dashed var(--card-border)',
                color: 'var(--muted-fg)',
              }}
            >
              Complete this routine once to start building history.
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}
