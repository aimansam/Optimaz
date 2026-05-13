'use client';

import { useState } from 'react';
import { Check, Trash2, Plus } from 'lucide-react';
import { useToggleSubtask, useCreateSubtask, useDeleteSubtask } from '@/hooks/use-tasks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task } from '@/lib/types';

export function SubtaskList({ task }: { task: Task }) {
  const [newTitle, setNewTitle] = useState('');
  const [showInput, setShowInput] = useState(false);
  const toggleSubtask = useToggleSubtask();
  const createSubtask = useCreateSubtask();
  const deleteSubtask = useDeleteSubtask();

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createSubtask.mutateAsync({ task_id: task.id, title: newTitle.trim() });
    setNewTitle('');
    setShowInput(false);
  };

  return (
    <div className="space-y-1.5">
      {toggleSubtask.isError && (
        <div className="text-xs text-red-500 font-semibold">{toggleSubtask.error?.message || 'Failed to update subtask.'}</div>
      )}
      {task.subtasks?.map((subtask) => (
        <div key={subtask.id} className="group flex items-center gap-2">
          <button
            onClick={() => toggleSubtask.mutate({ id: subtask.id, completed: !subtask.completed })}
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all',
              subtask.completed
                ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                : 'border-slate-300 hover:border-slate-400 dark:border-slate-600'
            )}
          >
            {subtask.completed && <Check className="h-2.5 w-2.5" />}
          </button>
          <span
            className={cn(
              'flex-1 text-xs text-slate-700 dark:text-slate-300',
              subtask.completed && 'line-through text-slate-400'
            )}
          >
            {subtask.title}
          </span>
          <button
            onClick={() => deleteSubtask.mutate(subtask.id)}
            aria-label={`Delete ${subtask.title}`}
            className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
          >
            <Trash2 className="h-3 w-3 text-red-400" />
          </button>
        </div>
      ))}

      {showInput ? (
        <div className="flex items-center gap-2 pt-1">
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && newTitle.trim()) {
                handleAdd(e);
              } else if (e.key === 'Escape') {
                setShowInput(false);
                setNewTitle('');
              }
            }}
            placeholder="Add subtask..."
            className="h-7 text-xs"
            autoFocus
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={!newTitle.trim()}
            onClick={handleAdd}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => { setShowInput(false); setNewTitle(''); }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          onClick={() => setShowInput(true)}
        >
          <Plus className="h-3 w-3" /> Add subtask
        </Button>
      )}
    </div>
  );
}
