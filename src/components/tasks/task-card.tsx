'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, CalendarDays, RefreshCw, Expand } from 'lucide-react';
import { cn, PRIORITY_CONFIG, formatDate, isOverdue } from '@/lib/utils';
import { getWeekdayLabel } from '@/lib/recurrence';
import { Badge } from '@/components/ui/badge';
import { TaskActions } from './task-actions';
import { Drawer } from '@/components/ui/drawer';
import { TaskForm } from './task-form';
import { useUpdateTask } from '@/hooks/use-tasks';
import type { Task } from '@/lib/types';
import { SubtaskList } from './subtask-list';

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

// Priority glow colors for box-shadow
const PRIORITY_GLOW: Record<string, string> = {
  low: 'rgba(59, 130, 246, 0.18)',
  medium: 'rgba(245, 158, 11, 0.18)',
  high: 'rgba(249, 115, 22, 0.2)',
  urgent: 'rgba(239, 68, 68, 0.22)',
};

const PRIORITY_LEFT_COLOR: Record<string, string> = {
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const updateTask = useUpdateTask();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [detailOpen, setDetailOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  // Local optimistic done state — flip instantly on click, sync back when task prop updates
  const [pendingDone, setPendingDone] = useState<boolean | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Keep editValue in sync if task.title changes externally
  useEffect(() => {
    if (!editingTitle) setEditValue(task.title);
  }, [task.title, editingTitle]);

  // Once React Query propagates the real status, clear the local pending state
  useEffect(() => {
    setPendingDone(null);
  }, [task.status]);

  // Auto-focus and select all when entering edit mode
  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);

  const priority = PRIORITY_CONFIG[task.priority];
  // isDone uses local pending state for instant visual feedback; syncs to task.status once React Query propagates
  const isDone = pendingDone !== null ? pendingDone : task.status === 'done';
  const overdue = isOverdue(task.due_date, task.due_time) && !isDone;
  const completedSubtasks = task.subtasks?.filter((s) => s.completed).length ?? 0;
  const totalSubtasks = task.subtasks?.length ?? 0;
  const percentComplete = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  const leftBorderColor = overdue ? '#ef4444' : isDone ? 'var(--card-border)' : PRIORITY_LEFT_COLOR[task.priority];
  const glowColor = overdue ? 'rgba(239,68,68,0.15)' : isDone ? 'transparent' : PRIORITY_GLOW[task.priority];

  const toggleDone = () => {
    const nextDone = !isDone;
    setPendingDone(nextDone); // instant visual flip
    updateTask.mutate({ id: task.id, status: nextDone ? 'done' : 'todo' });
  };

  function startEditing() {
    if (isDone) return;
    setEditValue(task.title);
    setEditingTitle(true);
  }

  function commitEdit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== task.title) {
      updateTask.mutate({ id: task.id, title: trimmed });
    }
    setEditingTitle(false);
  }

  function cancelEdit() {
    setEditValue(task.title);
    setEditingTitle(false);
  }

  return (
    <>
    <div
      className={cn(
        'group relative rounded-xl border-l-[3px] transition-all duration-200',
        isDone && 'opacity-60'
      )}
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderLeft: `3px solid ${leftBorderColor}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: hovered && !isDone
          ? `0 4px 24px ${glowColor}, 0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgb(var(--accent) / 0.06)`
          : `0 1px 3px rgba(0,0,0,0.08)`,
        transform: hovered && !isDone ? 'translateY(-1px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
        <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3.5">
          {/* Checkbox */}
          <button
            onClick={toggleDone}
            className={cn(
              'mt-0.5 flex h-8 w-8 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
            )}
            style={isDone ? {
              borderColor: '#10b981',
              background: '#10b981',
              color: '#fff',
              boxShadow: '0 0 8px rgba(16,185,129,0.4)',
            } : {
              borderColor: 'var(--card-border)',
              background: 'transparent',
            }}
            onMouseEnter={e => {
              if (!isDone) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgb(var(--accent))';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 8px var(--glow)';
              }
            }}
            onMouseLeave={e => {
              if (!isDone) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--card-border)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
              }
            }}
          >
            {isDone && <Check className="h-3 w-3 stroke-[3]" />}
          </button>

          {/* Content */}
          <div className="min-w-0 flex-1">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); commitEdit(); }
                  if (e.key === 'Escape') { e.preventDefault(); cancelEdit(); }
                }}
                maxLength={255}
                className="w-full bg-transparent text-sm font-medium leading-snug outline-none py-px"
                style={{
                  color: 'var(--foreground)',
                  borderBottom: '1px solid rgb(var(--accent) / 0.4)',
                }}
                aria-label="Edit task title"
              />
            ) : (
              <p
                onClick={!isDone ? startEditing : undefined}
                title={!isDone ? 'Click to rename' : undefined}
                className={cn(
                  'text-sm font-medium leading-snug',
                  isDone && 'line-through',
                  !isDone && 'cursor-text'
                )}
                style={{
                  color: isDone ? 'var(--muted-fg)' : 'var(--foreground)',
                }}
              >
                {task.title}
              </p>
            )}

            {!compact && task.notes && (
              <p
                className="mt-1 text-xs leading-relaxed line-clamp-2"
                style={{ color: 'var(--muted-fg)' }}
              >
                {task.notes}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {/* Priority badge */}
              <Badge className={cn('text-[10px] font-semibold tracking-wide', priority.bg, priority.color)}>
                {priority.label}
              </Badge>

              {/* Project */}
              {task.project && (
                <span
                  className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium"
                  style={{
                    background: 'rgb(var(--accent) / 0.08)',
                    color: 'var(--muted-fg)',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  <span
                    className="mr-1 inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: task.project.color }}
                  />
                  {task.project.name}
                </span>
              )}

              {/* Due date */}
              {task.due_date && (
                <span
                  className={cn('flex items-center gap-0.5 text-[10px] font-medium')}
                  style={{ color: overdue ? '#ef4444' : 'var(--muted-fg)' }}
                >
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(task.due_date, task.due_time)}
                  {/* Deadline countdown badge */}
                  <span
                    className="ml-1 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={overdue ? {
                      background: 'rgba(239,68,68,0.12)',
                      color: '#ef4444',
                    } : {
                      background: 'rgba(245,158,11,0.12)',
                      color: '#d97706',
                    }}
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
                  <RefreshCw className="h-3 w-3" style={{ color: 'var(--muted-fg)' }} />
                </span>
              )}

              {/* Subtasks progress */}
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
                  <div
                    className="h-1 w-full rounded-full overflow-hidden"
                    style={{ background: 'var(--muted-bg)' }}
                  >
                    <div
                      className="h-1 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentComplete}%`,
                        background: 'linear-gradient(90deg, rgb(var(--accent)), rgb(var(--accent) / 0.7))',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => setDetailOpen(true)}
              title="View full details"
              aria-label="View task details"
              className="flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded-lg transition-all duration-150"
              style={{ color: 'var(--muted-fg)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgb(var(--accent) / 0.1)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgb(var(--accent))';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-fg)';
              }}
            >
              <Expand className="h-3.5 w-3.5" />
            </button>
            <TaskActions task={task} onEdit={() => setDetailOpen(true)} className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100" buttonClassName="h-10 w-10 sm:h-7 sm:w-7 rounded-lg" />
          </div>
        </div>

        {/* Subtasks: always visible if present */}
        {totalSubtasks > 0 && (
          <div
            className="px-3.5 pb-3 pt-2.5 pl-12"
            style={{ borderTop: '1px solid var(--card-border)' }}
          >
            <SubtaskList task={task} />
          </div>
        )}
    </div>

    <Drawer open={detailOpen} onClose={() => setDetailOpen(false)} title="Task Details">
      <TaskForm task={task} onClose={() => setDetailOpen(false)} />
    </Drawer>
    </>
  );
}
