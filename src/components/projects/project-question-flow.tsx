'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '@/hooks/use-projects';

const DEFAULT_COLOR = '#6366f1';

function parseTags(value: string) {
  return value
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);
}

export function ProjectQuestionFlow({ onClose }: { onClose: () => void }) {
  const createProject = useCreateProject();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');

  const tags = parseTags(tagInput);
  const steps = useMemo(() => [
    { label: 'Project', question: 'What project do you want to add?' },
    { label: 'Details', question: 'What is this project about?' },
    { label: 'Tags', question: 'Any tags for this project?' },
    { label: 'Review', question: 'Ready to create this project?' },
  ], []);

  const isLastStep = step === steps.length - 1;
  const canContinue = step !== 0 || name.trim().length > 0;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLastStep) {
      if (canContinue) setStep(current => Math.min(current + 1, steps.length - 1));
      return;
    }

    if (!name.trim()) return;

    await createProject.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      color: DEFAULT_COLOR,
      tags,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <FolderOpen className="h-4 w-4" />
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
            value={name}
            onChange={event => setName(event.target.value)}
            placeholder="Example: TaskFlow beta launch"
            autoFocus
            disabled={createProject.isPending}
            className="bg-white dark:bg-slate-900"
          />
        )}

        {step === 1 && (
          <Textarea
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="Optional project notes"
            rows={4}
            autoFocus
            disabled={createProject.isPending}
            className="bg-white dark:bg-slate-900"
          />
        )}

        {step === 2 && (
          <Input
            value={tagInput}
            onChange={event => setTagInput(event.target.value)}
            placeholder="Optional, comma-separated tags"
            autoFocus
            disabled={createProject.isPending}
            className="bg-white dark:bg-slate-900"
          />
        )}

        {step === 3 && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-medium text-slate-900 dark:text-slate-100">{name}</p>
            {description.trim() && <p className="text-slate-500 dark:text-slate-400">{description}</p>}
            {tags.length > 0 && <p className="text-xs text-slate-400">Tags: {tags.join(', ')}</p>}
          </div>
        )}
      </div>

      {createProject.isError && <p className="text-sm text-red-500">{createProject.error.message}</p>}

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={createProject.isPending}>Cancel</Button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={() => setStep(current => Math.max(current - 1, 0))} disabled={createProject.isPending}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          <Button type="submit" disabled={!canContinue || createProject.isPending}>
            {isLastStep ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {isLastStep ? (createProject.isPending ? 'Creating...' : 'Create project') : 'Next'}
          </Button>
        </div>
      </div>
    </form>
  );
}