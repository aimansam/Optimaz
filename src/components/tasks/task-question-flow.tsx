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
import { WEEKDAYS, WEEKDAY_PRESETS, getWeekdayLabel, normalizeWeekdays } from '@/lib/recurrence';
import type { Priority, RecurrenceRule, TaskStatus } from '@/lib/types';

interface TaskQuestionFlowProps {
  defaultStatus?: TaskStatus;
  defaultProjectId?: string;
  defaultGoalId?: string;
  defaultDueDate?: string;
  defaultRecurrenceRule?: RecurrenceRule | '';
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

export function TaskQuestionFlow({ defaultStatus = 'todo', defaultProjectId, defaultGoalId, defaultDueDate, defaultRecurrenceRule = '', onClose }: TaskQuestionFlowProps) {
  const createTask = useCreateTask();
  const { data: projects } = useProjects();
  const { data: goals } = useGoals();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState(defaultDueDate ?? '');
  const [dueTime, setDueTime] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? '');
  const [goalId, setGoalId] = useState(defaultGoalId ?? '');
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule | ''>(defaultRecurrenceRule);
  const [recurrenceWeekdays, setRecurrenceWeekdays] = useState<number[]>([]);

  const steps = useMemo(() => [
    { label: 'Task', question: 'What task do you want to add?', optional: false },
    { label: 'Details', question: 'Anything important to remember?', optional: true },
    { label: 'Priority', question: 'How important is this task?', optional: false },
    { label: 'Status', question: 'Where should this task start?', optional: false },
    { label: 'Due', question: 'When should this be due?', optional: true },
    { label: 'Project', question: 'Which project should this belong to?', optional: true },
    { label: 'Goal', question: 'Does this support a goal?', optional: true },
    { label: 'Repeat', question: 'Should this task repeat?', optional: true },
    { label: 'Days', question: 'Which days should this repeat?', optional: true },
    { label: 'Review', question: 'Ready to create this task?', optional: false },
  ], []);

  const isLastStep = step === steps.length - 1;
  const currentStep = steps[step];
  const canContinue = step !== 0 || title.trim().length > 0;
  const stepHasValue = (
    step === 1 ? notes.trim().length > 0
    : step === 4 ? dueDate.length > 0 || dueTime.length > 0
    : step === 5 ? projectId.length > 0
    : step === 6 ? goalId.length > 0
    : step === 7 ? recurrenceRule.length > 0
    : step === 8 ? recurrenceWeekdays.length > 0
    : true
  );
  const nextLabel = currentStep.optional && !stepHasValue ? 'Skip' : 'Next';

  function goToPreviousStep() {
    setStep(current => {
      if (current === 9 && recurrenceRule !== 'weekly') return 7;
      return Math.max(current - 1, 0);
    });
  }

  function goToNextStep() {
    setStep(current => {
      // "Skip" on any optional unfilled step → jump to review
      if (currentStep.optional && !stepHasValue) return steps.length - 1;
      // Skip the weekdays step if recurrence is not weekly
      if (current === 7 && recurrenceRule !== 'weekly') return 9;
      return Math.min(current + 1, steps.length - 1);
    });
  }

  function handleRecurrenceChange(value: RecurrenceRule | '') {
    setRecurrenceRule(value);
    if (value !== 'weekly') setRecurrenceWeekdays([]);
  }

  function toggleWeekday(day: number) {
    setRecurrenceWeekdays(current => (
      current.includes(day)
        ? current.filter(item => item !== day)
        : normalizeWeekdays([...current, day])
    ));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isLastStep) {
      if (canContinue) goToNextStep();
      return;
    }

    if (!title.trim()) return;

    await createTask.mutateAsync({
      title: title.trim(),
      notes: notes.trim() || undefined,
      priority,
      status,
      due_date: dueDate || undefined,
      due_time: dueDate && dueTime ? dueTime : undefined,
      due_timezone: dueDate && dueTime ? Intl.DateTimeFormat().resolvedOptions().timeZone : undefined,
      project_id: projectId || undefined,
      goal_id: goalId || undefined,
      is_recurring: Boolean(recurrenceRule),
      recurrence_rule: recurrenceRule || undefined,
      recurrence_weekdays: recurrenceRule === 'weekly' ? normalizeWeekdays(recurrenceWeekdays) : undefined,
    });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-3 flex items-start justify-between gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
          <div className="flex min-w-0 items-center gap-2">
            <ListChecks className="h-4 w-4 shrink-0" />
            <span>{currentStep.question}</span>
          </div>
          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            Step {step + 1} of {steps.length}
          </span>
        </div>
        {currentStep.optional && (
          <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">Optional. Leave it blank and continue if it does not matter right now.</p>
        )}
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
            autoFocus
            disabled={createTask.isPending}
            className="bg-white dark:bg-slate-900"
          />
        )}

        {step === 1 && (
          <Textarea
            value={notes}
            onChange={event => setNotes(event.target.value)}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              type="date"
              value={dueDate}
              onChange={event => setDueDate(event.target.value)}
              autoFocus
              disabled={createTask.isPending}
              className="bg-white dark:bg-slate-900"
            />
            <Input
              type="time"
              value={dueTime}
              onChange={event => setDueTime(event.target.value)}
              disabled={createTask.isPending || !dueDate}
              className="bg-white dark:bg-slate-900"
            />
          </div>
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
          <Select value={recurrenceRule} onChange={event => handleRecurrenceChange(event.target.value as RecurrenceRule | '')} disabled={createTask.isPending} autoFocus>
            {RECURRENCE_OPTIONS.map(item => <option key={item.value || 'none'} value={item.value}>{item.label}</option>)}
          </Select>
        )}

        {step === 8 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {WEEKDAY_PRESETS.map(preset => (
                <Button
                  key={preset.label}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setRecurrenceWeekdays([...preset.days])}
                  disabled={createTask.isPending}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {WEEKDAYS.map(day => {
                const selected = recurrenceWeekdays.includes(day.value);
                return (
                  <Button
                    key={day.value}
                    type="button"
                    variant={selected ? 'secondary' : 'ghost'}
                    size="sm"
                    className="h-9 px-2"
                    onClick={() => toggleWeekday(day.value)}
                    aria-pressed={selected}
                    disabled={createTask.isPending}
                  >
                    {day.short}
                  </Button>
                );
              })}
            </div>
            {recurrenceWeekdays.length > 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">Selected: {getWeekdayLabel(recurrenceWeekdays)}</p>
            )}
          </div>
        )}

        {step === 9 && (
          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-medium text-slate-900 dark:text-slate-100">{title}</p>
            {notes.trim() && <p className="text-slate-500 dark:text-slate-400">{notes}</p>}
            <p className="text-xs text-slate-400">
              Priority: {priority} · Status: {STATUSES.find(item => item.value === status)?.label}
              {dueDate ? ` · Due: ${dueDate}${dueTime ? ` at ${dueTime}` : ''}` : ''}
              {recurrenceRule ? ` · Repeats ${recurrenceRule}${recurrenceRule === 'weekly' && recurrenceWeekdays.length > 0 ? ` on ${getWeekdayLabel(recurrenceWeekdays)}` : ''}` : ''}
            </p>
          </div>
        )}
      </div>

      {createTask.isError && <p className="text-sm text-red-500">{createTask.error.message}</p>}

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="ghost" onClick={onClose} disabled={createTask.isPending}>Cancel</Button>
        <div className="flex gap-2">
          {step > 0 && (
            <Button type="button" variant="secondary" onClick={goToPreviousStep} disabled={createTask.isPending}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
          <Button type="submit" disabled={!canContinue || createTask.isPending}>
            {isLastStep ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {isLastStep ? (createTask.isPending ? 'Creating...' : 'Create task') : nextLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}