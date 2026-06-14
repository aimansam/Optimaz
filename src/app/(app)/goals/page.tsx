'use client';

import { useState } from 'react';
import { GoalCard } from '@/components/goals/goal-card';
import { GoalQuestionFlow } from '@/components/goals/goal-question-flow';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useGoals } from '@/hooks/use-goals';
import { Plus, Target, LayoutGrid, List, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface GoalListRowProps {
  goal: {
    id: string;
    title: string;
    description?: string | null;
    tasks?: { status: string }[];
  };
}

function GoalListRow({ goal }: GoalListRowProps) {
  const total = goal.tasks?.length ?? 0;
  const done = goal.tasks?.filter((t) => t.status === 'done').length ?? 0;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      href={`/goals/${goal.id}`}
      className="group flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-[var(--card-bg)] transition-colors"
    >
      <Target className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
      <span className="flex-1 truncate text-sm font-medium" style={{ color: 'var(--foreground)' }}>
        {goal.title}
      </span>
      {goal.description && (
        <span className="hidden lg:block text-xs truncate max-w-[160px]" style={{ color: 'var(--muted-fg)' }}>
          {goal.description}
        </span>
      )}
      {total > 0 && (
        <>
          <div className="hidden md:flex items-center gap-1.5">
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--card-border)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${percent}%`, background: 'var(--accent)' }}
              />
            </div>
            <span className="text-xs tabular-nums w-8 text-right" style={{ color: 'var(--muted-fg)' }}>
              {percent}%
            </span>
          </div>
          <span className="hidden sm:block text-xs tabular-nums" style={{ color: 'var(--muted-fg)' }}>
            {done}/{total} tasks
          </span>
        </>
      )}
      {total === 0 && (
        <span className="hidden sm:block text-xs" style={{ color: 'var(--muted-fg)' }}>No tasks</span>
      )}
      <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-50 transition-opacity" style={{ color: 'var(--muted-fg)' }} />
    </Link>
  );
}

export default function GoalsPage() {
  const { data: goals, isLoading, error } = useGoals();
  const [addOpen, setAddOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const active = goals?.filter((g) => {
    const total = g.tasks?.length ?? 0;
    const done = g.tasks?.filter((t) => t.status === 'done').length ?? 0;
    return total === 0 || done < total;
  });

  const achieved = goals?.filter((g) => {
    const total = g.tasks?.length ?? 0;
    const done = g.tasks?.filter((t) => t.status === 'done').length ?? 0;
    return total > 0 && done === total;
  });

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 pb-24 sm:p-6" style={{ background: 'var(--background)' }}>
        {/* Toolbar */}
        <div className="mb-5 flex items-center justify-end gap-2">
          {/* Grid / List toggle */}
          <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
            <button
              onClick={() => setViewMode('grid')}
              className="flex items-center justify-center h-8 w-8 transition-colors"
              style={{
                background: viewMode === 'grid' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'grid' ? '#fff' : 'var(--muted-fg)',
              }}
              title="Grid view"
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center justify-center h-8 w-8 transition-colors"
              style={{
                background: viewMode === 'list' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'list' ? '#fff' : 'var(--muted-fg)',
              }}
              title="List view"
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            <p className="font-semibold">Failed to load goals</p>
            <p className="mt-1 opacity-80">{error.message}</p>
          </div>
        ) : isLoading ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-3 px-3 animate-pulse"
                  style={i < 3 ? { borderBottom: '1px solid var(--card-border)' } : undefined}
                >
                  <span className="h-3.5 w-3.5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                  <div className="h-4 w-44 rounded bg-slate-200 dark:bg-slate-700 flex-1" />
                  <div className="h-2 w-20 rounded-full bg-slate-100 dark:bg-slate-800 hidden md:block" />
                  <div className="h-3 w-12 rounded bg-slate-100 dark:bg-slate-800 hidden sm:block" />
                </div>
              ))}
            </div>
          )
        ) : goals?.length === 0 ? (
          <EmptyState
            icon={<Target className="h-6 w-6" />}
            title="No goals yet"
            description="Create a goal to group tasks around an outcome and track progress over time."
            action={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Create Goal</Button>}
          />
        ) : viewMode === 'grid' ? (
          <div className="space-y-8">
            {/* Active goals */}
            {(active?.length ?? 0) > 0 && (
              <section>
                <h2 className="gradient-text mb-3 text-sm font-semibold uppercase tracking-wider">
                  In Progress ({active?.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {active?.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            )}

            {/* Achieved goals */}
            {(achieved?.length ?? 0) > 0 && (
              <section>
                <h2 className="gradient-text mb-3 text-sm font-semibold uppercase tracking-wider">
                  Achieved ({achieved?.length})
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {achieved?.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* List view */
          <div className="space-y-6">
            {(active?.length ?? 0) > 0 && (
              <section>
                <h2 className="gradient-text mb-2 text-sm font-semibold uppercase tracking-wider">
                  In Progress ({active?.length})
                </h2>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
                  {active?.map((goal, idx, arr) => (
                    <div
                      key={goal.id}
                      style={idx < arr.length - 1 ? { borderBottom: '1px solid var(--card-border)' } : undefined}
                    >
                      <GoalListRow goal={goal} />
                    </div>
                  ))}
                </div>
              </section>
            )}
            {(achieved?.length ?? 0) > 0 && (
              <section>
                <h2 className="gradient-text mb-2 text-sm font-semibold uppercase tracking-wider">
                  Achieved ({achieved?.length})
                </h2>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--card-border)', background: 'var(--card-bg)' }}>
                  {achieved?.map((goal, idx, arr) => (
                    <div
                      key={goal.id}
                      style={idx < arr.length - 1 ? { borderBottom: '1px solid var(--card-border)' } : undefined}
                    >
                      <GoalListRow goal={goal} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Goal" className="min-h-0 sm:max-w-lg">
        <GoalQuestionFlow onClose={() => setAddOpen(false)} />
      </Dialog>
    </>
  );
}
