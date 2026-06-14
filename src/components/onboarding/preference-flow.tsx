'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckSquare,
  FolderOpen,
  Globe,
  GraduationCap,
  Leaf,
  RefreshCw,
  Rocket,
  Target,
  Users,
} from 'lucide-react';
import { useUpdateUser } from '@/hooks/use-update-user';

const STEPS = [
  {
    id: 'role' as const,
    question: 'What best describes you?',
    subtitle: "We'll personalise your getting-started experience.",
    options: [
      { value: 'student',      label: 'Student',      Icon: GraduationCap, hint: 'Assignments, study goals & revision',       color: '#6366f1' },
      { value: 'professional', label: 'Professional',  Icon: Briefcase,     hint: 'Work tasks, projects & deadlines',          color: '#0ea5e9' },
      { value: 'personal',     label: 'Personal',      Icon: Leaf,          hint: 'Life goals, habits & self-improvement',     color: '#10b981' },
      { value: 'team',         label: 'Team / Lead',   Icon: Users,         hint: 'Managing projects & collaborating',         color: '#f59e0b' },
    ],
  },
  {
    id: 'focus' as const,
    question: "What's your main focus?",
    subtitle: "We'll surface the features you'll use most.",
    options: [
      { value: 'tasks',    label: 'Getting tasks done',  Icon: CheckSquare, hint: 'Capture, prioritise & complete work',    color: '#6366f1' },
      { value: 'goals',    label: 'Tracking goals',      Icon: Target,      hint: 'Long-term outcomes & milestones',        color: '#ef4444' },
      { value: 'habits',   label: 'Building habits',     Icon: RefreshCw,   hint: 'Daily routines & streaks',              color: '#10b981' },
      { value: 'projects', label: 'Managing projects',   Icon: FolderOpen,  hint: 'Organise work into named projects',     color: '#f59e0b' },
    ],
  },
  {
    id: 'planning' as const,
    question: 'How do you prefer to plan?',
    subtitle: 'This shapes how we present your work to you.',
    options: [
      { value: 'daily',    label: 'Day by day',     Icon: CalendarDays, hint: 'Review & plan each morning',           color: '#6366f1' },
      { value: 'weekly',   label: 'Weekly review',  Icon: Calendar,     hint: 'Plan a week at a time',               color: '#0ea5e9' },
      { value: 'flexible', label: 'Big picture',    Icon: Globe,        hint: 'Long-horizon, flexible planning',     color: '#10b981' },
    ],
  },
] as const;

type StepId = (typeof STEPS)[number]['id'];
type Preferences = Record<StepId, string>;

interface PreferenceFlowProps {
  onComplete: () => void;
  onSkip?: () => void;
}

export function PreferenceFlow({ onComplete, onSkip }: PreferenceFlowProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [prefs, setPrefs] = useState<Partial<Preferences>>({});
  const updateUser = useUpdateUser();

  const step = STEPS[stepIndex];
  const selected = prefs[step.id];
  const isLast = stepIndex === STEPS.length - 1;

  function pick(value: string) {
    setPrefs(prev => ({ ...prev, [step.id]: value }));
  }

  function handleNext() {
    if (!selected) return;
    if (isLast) {
      const finalPrefs = { ...prefs, [step.id]: selected } as Preferences;
      updateUser.mutate({
        metadata: {
          preferences: finalPrefs,
          preferences_completed: true,
        },
      }, { onSuccess: onComplete });
    } else {
      setStepIndex(i => i + 1);
    }
  }

  function handleSkip() {
    updateUser.mutate({
      metadata: { preferences_completed: true },
    }, { onSuccess: onSkip ?? onComplete });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Step dots */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              flex: i === stepIndex ? 3 : 1,
              background: i <= stepIndex ? 'rgb(var(--accent))' : 'var(--card-border)',
            }}
          />
        ))}
      </div>

      {/* Question header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)', opacity: 0.6 }}>
          Step {stepIndex + 1} of {STEPS.length}
        </p>
        <h2 className="mt-1 text-xl font-bold" style={{ color: 'var(--foreground)' }}>
          {step.question}
        </h2>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--muted-fg)' }}>
          {step.subtitle}
        </p>
      </div>

      {/* Option grid */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {step.options.map((opt) => {
          const isSelected = selected === opt.value;
          const Icon = opt.Icon;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => pick(opt.value)}
              className="flex items-start gap-3 rounded-xl p-3.5 text-left transition-all duration-150"
              style={{
                background: isSelected ? `${opt.color}12` : 'var(--card-bg)',
                border: isSelected ? `2px solid ${opt.color}60` : '1px solid var(--card-border)',
                transform: isSelected ? 'translateY(-1px)' : 'translateY(0)',
                boxShadow: isSelected ? `0 4px 16px ${opt.color}20` : 'none',
              }}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: isSelected ? `${opt.color}20` : 'var(--muted-bg)',
                  color: isSelected ? opt.color : 'var(--muted-fg)',
                }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className="font-semibold text-sm leading-tight"
                  style={{ color: isSelected ? opt.color : 'var(--foreground)' }}
                >
                  {opt.label}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug" style={{ color: 'var(--muted-fg)' }}>
                  {opt.hint}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {stepIndex > 0 ? (
            <button
              type="button"
              className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: 'var(--muted-fg)' }}
              onClick={() => setStepIndex(i => i - 1)}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          ) : (
            <button
              type="button"
              className="text-xs font-medium transition-colors"
              style={{ color: 'var(--muted-fg)', opacity: 0.6 }}
              onClick={handleSkip}
              disabled={updateUser.isPending}
            >
              Skip for now
            </button>
          )}
        </div>

        <button
          type="button"
          disabled={!selected || updateUser.isPending}
          onClick={handleNext}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.85))',
            boxShadow: selected ? '0 2px 12px var(--glow)' : 'none',
          }}
        >
          {updateUser.isPending ? (
            'Saving…'
          ) : isLast ? (
            <>
              <Rocket className="h-4 w-4" />
              Get started
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
