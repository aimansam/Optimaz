'use client';

import { Header } from '@/components/layout/header';
import { TaskList } from '@/components/tasks/task-list';
import { useTodayTasks, useOverdueTasks } from '@/hooks/use-tasks';
import { useUser } from '@/hooks/use-user';
import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function TaskSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-17 rounded-xl bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { data: todayTasks, isLoading: loadingToday } = useTodayTasks();
  const { data: overdueTasks, isLoading: loadingOverdue } = useOverdueTasks();
  const { data: user } = useUser();
  const [addOpen, setAddOpen] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.user_metadata?.full_name?.split(' ')[0]
    ?? user?.user_metadata?.name?.split(' ')[0]
    ?? user?.email?.split('@')[0]
    ?? null;

  const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const isLoading = loadingToday || loadingOverdue;

  return (
    <>
      <Header
        title="Today"
        actions={
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        }
      />
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-8">
          {/* Date hero */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">{weekday} &middot; {dateStr}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {greeting}{firstName ? `, ${firstName}` : ''}
            </h2>
          </div>

          {/* Overdue section */}
          {!isLoading && overdueTasks && overdueTasks.length > 0 && (
            <section className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <h3 className="text-xs font-semibold uppercase tracking-widest text-red-500">
                  Overdue &middot; {overdueTasks.length}
                </h3>
              </div>
              <TaskList tasks={overdueTasks} showAddButton={false} />
            </section>
          )}

          {/* Today section */}
          <section>
            {(overdueTasks?.length ?? 0) > 0 && (
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Today
                </h3>
              </div>
            )}
            {isLoading ? (
              <TaskSkeleton />
            ) : (
              <TaskList
                tasks={todayTasks ?? []}
                emptyMessage={
                  (overdueTasks?.length ?? 0) > 0
                    ? 'No additional tasks due today.'
                    : 'Nothing due today — great job!'
                }
                showAddButton={false}
              />
            )}
          </section>
        </div>
      </div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="New Task">
        <TaskForm onClose={() => setAddOpen(false)} />
      </Dialog>
    </>
  );
}
