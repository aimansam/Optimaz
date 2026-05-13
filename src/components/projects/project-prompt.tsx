'use client';

import { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProject } from '@/hooks/use-projects';
import { extractTags, getFirstPromptLine, getPromptDetails } from '@/lib/prompt-parser';

const DEFAULT_COLOR = '#6366f1';

export function ProjectPrompt({ onClose }: { onClose: () => void }) {
  const createProject = useCreateProject();
  const [prompt, setPrompt] = useState('');
  const name = getFirstPromptLine(prompt).replace(/#[\w-]+/g, '').trim();
  const tags = extractTags(prompt);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    await createProject.mutateAsync({
      name: name.trim(),
      description: getPromptDetails(prompt) || undefined,
      color: DEFAULT_COLOR,
      tags,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <FolderOpen className="h-4 w-4" />
          Prompt your project
        </div>
        <Textarea
          value={prompt}
          onChange={event => setPrompt(event.target.value)}
          placeholder={'Example: TaskFlow beta launch #product #beta\nCoordinate rollout, feedback, and production checks'}
          rows={5}
          autoFocus
          disabled={createProject.isPending}
          className="bg-white dark:bg-slate-900"
        />
      </div>

      {name && (
        <div className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-800">
          <p className="font-medium text-slate-900 dark:text-slate-100">{name}</p>
          {tags.length > 0 && <p className="mt-1 text-xs text-slate-400">Tags: {tags.join(', ')}</p>}
        </div>
      )}

      {createProject.isError && <p className="text-sm text-red-500">{createProject.error.message}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose} disabled={createProject.isPending}>Cancel</Button>
        <Button type="submit" disabled={!name.trim() || createProject.isPending}>
          {createProject.isPending ? 'Creating...' : 'Create project'}
        </Button>
      </div>
    </form>
  );
}