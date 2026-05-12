'use client';

import { useState } from 'react';
import { GoalCard } from '@/components/goals/goal-card';
import { GoalForm } from '@/components/goals/goal-form';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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


      {/* Floating Add Goal Button */}
      <button
        type="button"
        aria-label="Add Goal"
        title="Add Goal"
        onClick={() => setAddOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-black hover:bg-white border-2 border-black text-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white px-5 py-3 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-black"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">Add Goal</span>
      </button>
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-44 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : goals?.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-slate-400">
            <Target className="h-14 w-14" />
            <p className="text-lg font-medium">No goals yet</p>
            <p className="text-sm">Create a goal and link tasks to track your progress</p>
            <Button onClick={() => setAddOpen(true)}>Create your first goal</Button>
          </div>
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

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="New Goal">
        <GoalForm onClose={() => setAddOpen(false)} />
      </Dialog>
    </>
  );
}
