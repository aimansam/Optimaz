'use client';

import { useState } from 'react';
import { GoalCard } from '@/components/goals/goal-card';
import { GoalPrompt } from '@/components/goals/goal-prompt';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useGoals } from '@/hooks/use-goals';
import { Plus, Target } from 'lucide-react';

export default function GoalsPage() {
  const { data: goals, isLoading } = useGoals();
  const [addOpen, setAddOpen] = useState(false);

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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-5 flex items-center justify-end">
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </div>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : goals?.length === 0 ? (
          <EmptyState
            icon={<Target className="h-6 w-6" />}
            title="No goals yet"
            description="Create a goal to group tasks around an outcome and track progress over time."
            action={<Button onClick={() => setAddOpen(true)}><Plus className="h-4 w-4" />Create Goal</Button>}
          />
        ) : (
          <div className="space-y-8">
            {/* Active goals */}
            {(active?.length ?? 0) > 0 && (
              <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
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
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
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
        )}
      </div>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Prompt Goal">
        <GoalPrompt onClose={() => setAddOpen(false)} />
      </Dialog>
    </>
  );
}
