'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Circle, FolderOpen, Target, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingPanelProps {
  taskCount: number;
  projectCount: number;
  goalCount: number;
  onCreateTask: () => void;
  onComplete: () => void;
  completing?: boolean;
}


const steps = [
  {
    key: 'project',
    label: 'Create a project',
    href: '/projects',
    icon: FolderOpen,
    complete: (props: OnboardingPanelProps) => props.projectCount > 0,
  },
  {
    key: 'goal',
    label: 'Add a goal',
    href: '/goals',
    icon: Target,
    complete: (props: OnboardingPanelProps) => props.goalCount > 0,
  },
  {
    key: 'task',
    label: 'Plan your first task',
    href: null,
    icon: CheckCircle2,
    complete: (props: OnboardingPanelProps) => props.taskCount > 0,
  },
] as const;

export function OnboardingPanel(props: OnboardingPanelProps) {
  const completedSteps = steps.filter((step) => step.complete(props)).length;
  const isComplete = completedSteps === steps.length;

  return (
    <section className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Start strong</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">Set up your workspace</h3>
          <p className="mt-1 max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Build the basic loop: project, goal, task. Then your dashboard starts working as a daily command center.
          </p>
        </div>
        <button
          type="button"
          onClick={props.onComplete}
          disabled={props.completing}
          aria-label="Dismiss onboarding"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-900 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-2 p-3 sm:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const complete = step.complete(props);
          const content = (
            <>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">{step.label}</span>
                {complete ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-700" />
                )}
              </div>
              {!complete && (
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Start <ArrowRight className="h-3 w-3" />
                </span>
              )}
            </>
          );

          if (step.href) {
            return (
              <Link
                key={step.key}
                href={step.href}
                className="rounded-lg border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900"
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={step.key}
              type="button"
              onClick={props.onCreateTask}
              className="rounded-lg border border-slate-200 p-3 text-left transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900"
            >
              {content}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{completedSteps}/3 complete</p>
        <Button size="sm" variant={isComplete ? 'primary' : 'secondary'} onClick={props.onComplete} disabled={props.completing}>
          {isComplete ? 'Finish setup' : 'Hide for now'}
        </Button>
      </div>
    </section>
  );
}