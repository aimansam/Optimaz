'use client';

import { useState } from 'react';
import { Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateGoal } from '@/hooks/use-goals';
import { detectDueDate, getFirstPromptLine, getPromptDetails } from '@/lib/prompt-parser';

const DEFAULT_COLOR = '#6366f1';

export function GoalPrompt({ onClose }: { onClose: () => void }) {
  const createGoal = useCreateGoal();
  const [prompt, setPrompt] = useState('');
  const title = getFirstPromptLine(prompt);
  const dueDate = detectDueDate(prompt);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    await createGoal.mutateAsync({
      title: title.trim(),
      description: getPromptDetails(prompt) || undefined,
      due_date: dueDate,
      color: DEFAULT_COLOR,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Target className="h-4 w-4" />
          Prompt your goal
        </div>
        <Textarea
          value={prompt}
          onChange={event => setPrompt(event.target.value)}
          placeholder={'Example: Launch TaskFlow beta next week\nInvite 20 users and collect feedback daily'}
          rows={5}
          autoFocus
          disabled={createGoal.isPending}
          className="bg-white dark:bg-slate-900"
        />
      </div>

      {title && (
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
          <p className="font-medium text-slate-900 dark:text-slate-100">{title}</p>
          {dueDate && <p className="mt-1 text-xs text-slate-400">Target date: {dueDate}</p>}
        </div>
      )}

      {createGoal.isError && <p className="text-sm text-red-500">{createGoal.error.message}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={createGoal.isPending}>Cancel</Button>
        <Button type="submit" disabled={!title.trim() || createGoal.isPending}>
          {createGoal.isPending ? 'Creating...' : 'Create goal'}
        </Button>
      </div>
    </form>
  );
}