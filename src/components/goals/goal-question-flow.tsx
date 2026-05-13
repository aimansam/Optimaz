'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateGoal } from '@/hooks/use-goals';

const DEFAULT_COLOR = '#6366f1';

export function GoalQuestionFlow({ onClose }: { onClose: () => void }) {
  const createGoal = useCreateGoal();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

  const steps = useMemo(() => [
    { label: 'Goal', question: 'What goal do you want to add?' },
    { label: 'Why', question: 'What does success look like?' },
    { label: 'Date', question: 'Is there a target date?' },
    { label: 'Review', question: 'Ready to create this goal?' },
  ], []);

  const isLastStep = step === steps.length - 1;
  const canContinue = step !== 0 || title.trim().length > 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLastStep) {
      if (canContinue) setStep(current => Math.min(current + 1, steps.length - 1));
      return;
    }

    if (!title.trim()) return;

    await createGoal.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      due_date: dueDate || undefined,
      color: DEFAULT_COLOR,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Target className="h-4 w-4" />
          <span>{steps[step].question}</span>
        </div>
        <div className="mb-3 flex gap-1">
          {steps.map((item, index) => (
            <div
              key={item.label}
              className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-800'}`}
            />
          ))}
        </div>

        {step === 0 && (
          <Input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Example: Launch TaskFlow beta"
            autoFocus
            disabled={createGoal.isPending}
            className="bg-white dark:bg-slate-900"
          />
        )}

        {step === 1 && (
          <Textarea
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="Optional success notes"
            rows={4}
            autoFocus
            disabled={createGoal.isPending}
            className="bg-white dark:bg-slate-900"
          />
        )}

        {step === 2 && (
          <Input
            type="date"
            value={dueDate}
            onChange={event => setDueDate(event.target.value)}
            autoFocus
            disabled={createGoal.isPending}
            className="bg-white dark:bg-slate-900"
          />
        )}

        {step === 3 && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-medium text-slate-900 dark:text-slate-100">{title}</p>
            {description.trim() && <p className="text-slate-500 dark:text-slate-400">{description}</p>}
            {dueDate && <p className="text-xs text-slate-400">Target date: {dueDate}</p>}
          </div>
        )}
      </div>

      {createGoal.isError && <p className="text-sm text-red-500">{createGoal.error.message}</p>}

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={createGoal.isPending}>Cancel</Button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={() => setStep(current => Math.max(current - 1, 0))} disabled={createGoal.isPending}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          <Button type="submit" disabled={!canContinue || createGoal.isPending}>
            {isLastStep ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {isLastStep ? (createGoal.isPending ? 'Creating...' : 'Create goal') : 'Next'}
          </Button>
        </div>
      </div>
    </form>
  );
}