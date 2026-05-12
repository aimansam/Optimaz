'use client';

import { use, useState } from 'react';
import { TaskList } from '@/components/tasks/task-list';
import { GoalForm } from '@/components/goals/goal-form';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGoal } from '@/hooks/use-goals';
import { useGoalTasks } from '@/hooks/use-tasks';
import { CalendarDays, Edit2, CheckCircle2, Target } from 'lucide-react';
import { cn, formatDate, isOverdue } from '@/lib/utils';

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: goal, isLoading: goalLoading } = useGoal(id);
  const { data: tasks, isLoading: tasksLoading } = useGoalTasks(id);
  const [editOpen, setEditOpen] = useState(false);

  const total = tasks?.length ?? 0;
  const completed = tasks?.filter((t) => t.status === 'done').length ?? 0;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const overdue = goal ? isOverdue(goal.due_date) : false;

  return (
    <>


      <div className="flex-1 overflow-y-auto p-6">
        {goalLoading ? (
          <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-6" />
        ) : goal ? (
          <div
            className="mb-6 rounded-xl border p-5"
            style={{ borderColor: goal.color + '40', backgroundColor: goal.color + '08' }}
          >
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
                style={{ backgroundColor: goal.color + '20' }}
              >
                <Target className="h-6 w-6" style={{ color: goal.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{goal.title}</h2>
                {goal.description && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{goal.description}</p>
                )}
                {goal.due_date && (
                  <p className={cn('mt-1 flex items-center gap-1 text-sm', overdue ? 'text-red-500' : 'text-slate-400')}>
                    <CalendarDays className="h-4 w-4" />
                    Target: {formatDate(goal.due_date)}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-3xl font-bold" style={{ color: goal.color }}>{percent}%</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                  <CheckCircle2 className="h-3 w-3" />
                  {completed}/{total} tasks
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="mt-3 gap-1"
                  onClick={() => setEditOpen(true)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{ width: `${percent}%`, backgroundColor: goal.color }}
                />
              </div>
            </div>

            {percent === 100 && (
              <p className="mt-3 text-center text-sm font-semibold text-green-600 dark:text-green-400">
                Goal achieved! Great work!
              </p>
            )}
          </div>
        ) : null}

        <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Linked Tasks</h3>
        {tasksLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <TaskList
            tasks={tasks ?? []}
            emptyMessage="No tasks linked to this goal yet. Create a task and assign it to this goal."
            defaultGoalId={id}
          />
        )}
      </div>

      {goal && (
        <Dialog open={editOpen} onClose={() => setEditOpen(false)} title="Edit Goal">
          <GoalForm goal={goal} onClose={() => setEditOpen(false)} />
        </Dialog>
      )}
    </>
  );
}
