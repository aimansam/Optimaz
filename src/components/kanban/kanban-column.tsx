'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KanbanCard } from './kanban-card';
import type { Task, TaskStatus } from '@/lib/types';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';

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

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  tasks: Task[];
}

export function KanbanColumn({ id, label, tasks }: KanbanColumnProps) {
  const [addOpen, setAddOpen] = useState(false);
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <>
      <div
        className={cn(
          'flex flex-col rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800/60 transition-all duration-200',
          isOver && 'ring-2 ring-slate-400 border-transparent',
          'w-full md:w-[320px] min-w-0 md:min-w-[320px]'
        )}
      >
        {/* Column header */}
        <div className="flex items-center justify-between px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-3.5">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
            <span className={cn('h-2 w-2 rounded-full', COLUMN_DOT[id])} />
            <span className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200">{label}</span>
            <span className={cn('rounded-full px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-[11px] font-semibold tabular-nums', COLUMN_COUNT_STYLE[id])}>
              {tasks.length}
            </span>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/80 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-colors"
          >
            <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>

        {/* Tasks */}
        <div ref={setNodeRef} className="flex flex-1 flex-col gap-1.5 sm:gap-2 md:gap-2.5 overflow-y-auto px-2 sm:px-3 pb-2 sm:pb-3" style={{ minHeight: 100 }}>
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
          </SortableContext>
          {tasks.length === 0 && (
            <div className="flex flex-1 items-center justify-center py-6 sm:py-10">
              <p className="text-xs text-slate-400 dark:text-slate-600">Drop tasks here</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="New Task">
        <TaskForm defaultStatus={id} onClose={() => setAddOpen(false)} />
      </Dialog>
    </>
  );
}
