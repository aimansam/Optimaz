'use client';

import { useState } from 'react';
import { Plus, X, CheckSquare, Target, FolderOpen } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { TaskQuestionFlow } from '@/components/tasks/task-question-flow';
import { GoalQuestionFlow } from '@/components/goals/goal-question-flow';
import { ProjectQuestionFlow } from '@/components/projects/project-question-flow';
import { cn } from '@/lib/utils';

type ActiveForm = 'task' | 'goal' | 'project' | null;

const ACTIONS = [
  { id: 'task' as const,    label: 'Task',    icon: CheckSquare, color: 'bg-indigo-500 hover:bg-indigo-600',    ring: 'ring-indigo-300' },
  { id: 'goal' as const,    label: 'Goal',    icon: Target,      color: 'bg-emerald-500 hover:bg-emerald-600',  ring: 'ring-emerald-300' },
  { id: 'project' as const, label: 'Project', icon: FolderOpen,  color: 'bg-rose-500 hover:bg-rose-600',        ring: 'ring-rose-300' },
];

// Pages that have their own dedicated add buttons — FAB would overlap content
// Supports exact match or startsWith prefix matching for nested routes
const FAB_HIDDEN_PREFIXES = ['/dashboard', '/tasks', '/calendar', '/kanban', '/routines', '/projects', '/goals'];

export function QuickAddFAB() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeForm, setActiveForm] = useState<ActiveForm>(null);
  const isFabHidden = FAB_HIDDEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));

  function handleAction(id: ActiveForm) {
    setOpen(false);
    setActiveForm(id);
  }

  function handleClose() {
    setActiveForm(null);
  }

  return (
    <>
      {/* Backdrop when FAB is expanded */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* FAB cluster — peeks from bottom edge, slides up on open */}
      <div
        className={cn(
          'fixed right-5 z-50 flex flex-col-reverse items-end gap-2.5',
          isFabHidden && 'pointer-events-none opacity-0'
        )}
        style={{
          bottom: isFabHidden
            ? '-120px'
            : open
              ? 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))'
              : '-2rem',
          transition: 'bottom 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
        }}
      >
        {/* Action buttons (shown when open) */}
        {ACTIONS.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={action.id}
              className={cn(
                'flex items-center gap-2.5 transition-all duration-200',
                open
                  ? 'translate-y-0 opacity-100'
                  : 'translate-y-4 opacity-0 pointer-events-none'
              )}
              style={{ transitionDelay: open ? `${index * 50}ms` : '0ms' }}
            >
              <span
                className="rounded-lg px-2.5 py-1 text-xs font-semibold"
                style={{
                  background: 'var(--card-bg)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {action.label}
              </span>
              <button
                onClick={() => handleAction(action.id)}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white transition-transform hover:scale-110 active:scale-95 dark:ring-slate-900',
                  action.color
                )}
                aria-label={`Add ${action.label}`}
              >
                <Icon className="h-5 w-5" />
              </button>
            </div>
          );
        })}

        {/* Main FAB button */}
        <button
          onClick={() => setOpen(v => !v)}
          className={cn(
            'flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95',
            open ? 'rotate-45' : 'rotate-0',
          )}
          style={{
            background: open
              ? 'var(--muted-bg)'
              : 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.82))',
            boxShadow: open
              ? '0 4px 16px rgba(0,0,0,0.15)'
              : '0 4px 20px var(--glow), 0 8px 32px rgba(0,0,0,0.2)',
            border: '2px solid var(--glass-border)',
          }}
          aria-label={open ? 'Close quick add menu' : 'Quick add'}
          aria-expanded={open}
        >
          {open
            ? <X className="h-6 w-6" style={{ color: 'var(--foreground)' }} />
            : <Plus className="h-6 w-6 text-white" />
          }
        </button>
      </div>

      {/* Task dialog */}
      <Dialog open={activeForm === 'task'} onClose={handleClose} title="Add Task" className="min-h-0 sm:max-w-lg">
        <TaskQuestionFlow onClose={handleClose} />
      </Dialog>

      {/* Goal dialog */}
      <Dialog open={activeForm === 'goal'} onClose={handleClose} title="Add Goal" className="min-h-0 sm:max-w-lg">
        <GoalQuestionFlow onClose={handleClose} />
      </Dialog>

      {/* Project dialog */}
      <Dialog open={activeForm === 'project'} onClose={handleClose} title="Add Project" className="min-h-0 sm:max-w-lg">
        <ProjectQuestionFlow onClose={handleClose} />
      </Dialog>
    </>
  );
}
