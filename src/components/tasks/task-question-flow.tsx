'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ListChecks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateTask } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useGoals } from '@/hooks/use-goals';
import type { Priority, RecurrenceRule, TaskStatus } from '@/lib/types';

interface TaskQuestionFlowProps {
  defaultStatus?: TaskStatus;
  defaultProjectId?: string;
  defaultGoalId?: string;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];
const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];
const RECURRENCE_OPTIONS: { value: RecurrenceRule | ''; label: string }[] = [
  { value: '', label: 'No repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

export function TaskQuestionFlow({ defaultStatus = 'todo', defaultProjectId, defaultGoalId, onClose }: TaskQuestionFlowProps) {
  const createTask = useCreateTask();
  const { data: projects } = useProjects();
  const { data: goals } = useGoals();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? '');
  const [goalId, setGoalId] = useState(defaultGoalId ?? '');
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | ''>('');

  const steps = useMemo(() => [
    { label: 'Task', question: 'What task do you want to add?' },
    { label: 'Details', question: 'Anything important to remember?' },
    { label: 'Priority', question: 'How important is this task?' },
    { label: 'Status', question: 'Where should this task start?' },
    { label: 'Date', question: 'When should this be due?' },
    { label: 'Project', question: 'Which project should this belong to?' },
    { label: 'Goal', question: 'Does this support a goal?' },
    { label: 'Repeat', question: 'Should this task repeat?' },
    { label: 'Review', question: 'Ready to create this task?' },
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

    await createTask.mutateAsync({
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      status,
      due_date: dueDate || undefined,
      project_id: projectId || undefined,
      goal_id: goalId || undefined,
      is_recurring: Boolean(recurrenceRule),
      recurrence_rule: recurrenceRule || undefined,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <ListChecks className="h-4 w-4" />
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
            placeholder="Prepare slides for tomorrow's meeting"
            autoFocus
            disabled={createTask.isPending}
            className="bg-white dark:bg-slate-900"
          />
        )}

        {step === 1 && (
          <Textarea
            value={notes}
            onChange={event => setNotes(event.target.value)}
            placeholder="Add the latest numbers, check the agenda, and send the deck before 5 PM."
            rows={4}
            autoFocus
            disabled={createTask.isPending}
            className="bg-white dark:bg-slate-900"
          />
        )}

        {step === 2 && (
          <Select value={priority} onChange={event => setPriority(event.target.value as Priority)} disabled={createTask.isPending} autoFocus>
            {PRIORITIES.map(item => <option key={item} value={item}>{item}</option>)}
          </Select>
        )}

        {step === 3 && (
          <Select value={status} onChange={event => setStatus(event.target.value as TaskStatus)} disabled={createTask.isPending} autoFocus>
            {STATUSES.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
          </Select>
        )}

        {step === 4 && (
          <Input
            type="date"
            value={dueDate}
            onChange={event => setDueDate(event.target.value)}
            autoFocus
            disabled={createTask.isPending}
            className="bg-white dark:bg-slate-900"
          />
        )}

        {step === 5 && (
          <Select value={projectId} onChange={event => setProjectId(event.target.value)} disabled={createTask.isPending} autoFocus>
            <option value="">No project</option>
            {projects?.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}
          </Select>
        )}

        {step === 6 && (
          <Select value={goalId} onChange={event => setGoalId(event.target.value)} disabled={createTask.isPending} autoFocus>
            <option value="">No goal</option>
            {goals?.map(goal => <option key={goal.id} value={goal.id}>{goal.title}</option>)}
          </Select>
        )}

        {step === 7 && (
          <Select value={recurrenceRule} onChange={event => setRecurrenceRule(event.target.value as RecurrenceRule | '')} disabled={createTask.isPending} autoFocus>
            {RECURRENCE_OPTIONS.map(item => <option key={item.value || 'none'} value={item.value}>{item.label}</option>)}
          </Select>
        )}

        {step === 8 && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-medium text-slate-900 dark:text-slate-100">{title}</p>
            {notes.trim() && <p className="text-slate-500 dark:text-slate-400">{notes}</p>}
            <p className="text-xs text-slate-400">
              Priority: {priority} · Status: {STATUSES.find(item => item.value === status)?.label}
              {dueDate ? ` · Due: ${dueDate}` : ''}
              {recurrenceRule ? ` · Repeats ${recurrenceRule}` : ''}
            </p>
          </div>
        )}
      </div>

      {createTask.isError && <p className="text-sm text-red-500">{createTask.error.message}</p>}

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={createTask.isPending}>Cancel</Button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={() => setStep(current => Math.max(current - 1, 0))} disabled={createTask.isPending}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          <Button type="submit" disabled={!canContinue || createTask.isPending}>
            {isLastStep ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {isLastStep ? (createTask.isPending ? 'Creating...' : 'Create task') : 'Next'}
          </Button>
        </div>
      </div>
    </form>
  );
}