'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KanbanCard } from './kanban-card';
import type { Task, TaskStatus } from '@/lib/types';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { TaskQuestionFlow } from '@/components/tasks/task-question-flow';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';

const COLUMN_DOT: Record<TaskStatus, string> = {
  todo: 'bg-red-500',
  in_progress: 'bg-yellow-400',
  done: 'bg-green-500',
};

const COLUMN_COUNT_STYLE: Record<TaskStatus, string> = {
  todo: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  in_progress: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  done: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
};

const COLUMN_BAR_COLOR: Record<TaskStatus, string> = {
  todo: '#ef4444',
  in_progress: '#f59e0b',
  done: '#10b981',
};

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  totalTasks: number;
}

export function KanbanColumn({ id, label, tasks, totalTasks }: KanbanColumnProps) {
  const [addOpen, setAddOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id });
  const proportion = totalTasks > 0 ? Math.round((tasks.length / totalTasks) * 100) : 0;

  return (
    <>
      <div
        className={cn(
          'flex flex-col rounded-2xl transition-all duration-200',
          isOver && 'ring-2 ring-[rgb(var(--accent)/0.4)]',
          'w-full md:w-[320px] min-w-0 md:min-w-[320px] h-full max-h-full'
        )}
        style={{
          background: 'var(--muted-bg)',
          border: isOver ? '1px solid rgb(var(--accent) / 0.35)' : '1px solid var(--card-border)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Column header */}
        <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-3.5">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
            <span className={cn('h-2 w-2 rounded-full', COLUMN_DOT[id])} />
            <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{label}</span>
            <span
              className="rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold tabular-nums"
              style={{
                background: 'var(--card-bg)',
                color: 'var(--muted-fg)',
                border: '1px solid var(--card-border)',
              }}
            >
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-lg p-1 transition-all duration-150"
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
            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

        {/* Proportion bar */}
        <div className="mx-2 sm:mx-3 md:mx-4 mb-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${proportion}%`,
              background: COLUMN_BAR_COLOR[id],
              opacity: 0.7,
            }}
          />
        </div>

        {/* Tasks */}
        <div ref={setNodeRef} className="list-animated flex flex-1 flex-col gap-1.5 sm:gap-2 md:gap-2.5 overflow-y-auto px-2 sm:px-3 pb-2 sm:pb-3" style={{ minHeight: 100 }}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
          </SortableContext>
          {tasks.length === 0 && (
            <EmptyState
              compact
              icon={<Plus className="h-4 w-4" />}
              title="No tasks"
              description="Drop a card here or create one directly in this column."
              action={<Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}><Plus className="h-3.5 w-3.5" />Add</Button>}
            />
          )}
        </div>
      </div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Task" className="min-h-0 sm:max-w-lg">
        <TaskQuestionFlow defaultStatus={id} onClose={() => setAddOpen(false)} />
      </Dialog>
    </>
  );
}
