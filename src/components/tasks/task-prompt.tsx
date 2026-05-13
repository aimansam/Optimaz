'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTask } from '@/hooks/use-tasks';
import { detectDueDate, detectPriority, getFirstPromptLine, getPromptDetails } from '@/lib/prompt-parser';
import type { TaskStatus } from '@/lib/types';

interface TaskPromptProps {
  defaultStatus?: TaskStatus;
  defaultProjectId?: string;
  defaultGoalId?: string;
  onClose: () => void;
}

export function TaskPrompt({ defaultStatus = 'todo', defaultProjectId, defaultGoalId, onClose }: TaskPromptProps) {
  const createTask = useCreateTask();
  const [prompt, setPrompt] = useState('');
  const title = getFirstPromptLine(prompt);
  const dueDate = detectDueDate(prompt);
  const priority = detectPriority(prompt);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;

    await createTask.mutateAsync({
      title: title.trim(),
      notes: getPromptDetails(prompt) || undefined,
      priority,
      status: defaultStatus,
      due_date: dueDate,
      project_id: defaultProjectId,
      goal_id: defaultGoalId,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <Sparkles className="h-4 w-4" />
          Prompt your task
        </div>
        <Textarea
          value={prompt}
          onChange={event => setPrompt(event.target.value)}
          placeholder={'Example: Submit beta launch checklist tomorrow high priority\nInclude Vercel env vars and production smoke test'}
          rows={5}
          autoFocus
          disabled={createTask.isPending}
          className="bg-white dark:bg-slate-900"
        />
      </div>

      {title && (
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
          <p className="font-medium text-slate-900 dark:text-slate-100">{title}</p>
          <p className="mt-1 text-xs text-slate-400">
            Priority: {priority}{dueDate ? ` · Due: ${dueDate}` : ''}
          </p>
        </div>
      )}

      {createTask.isError && <p className="text-sm text-red-500">{createTask.error.message}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={createTask.isPending}>Cancel</Button>
        <Button type="submit" disabled={!title.trim() || createTask.isPending}>
          {createTask.isPending ? 'Creating...' : 'Create task'}
        </Button>
      </div>
    </form>
  );
}