'use client';

import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { useCreateTask, useUpdateTask } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useGoals } from '@/hooks/use-goals';
import type { Task, Priority, TaskStatus, RecurrenceRule } from '@/lib/types';
import { SubtaskList } from './subtask-list2';

interface TaskFormProps {
  defaultStatus?: TaskStatus;
  defaultProjectId?: string;
  defaultGoalId?: string;
  task?: Task;
  onClose: () => void;
}

interface FormValues {
  title: string;
  notes: string;
  priority: Priority;
  status: TaskStatus;
  due_date: string;
  project_id: string;
  goal_id: string;
  is_recurring: boolean;
  recurrence_rule: RecurrenceRule | '';
}

export function TaskForm({ defaultStatus = 'todo', defaultProjectId, defaultGoalId, task, onClose }: TaskFormProps) {
  'use no memo';
  const { data: projects } = useProjects();
  const { data: goals } = useGoals();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const isEdit = !!task;

  const { register, handleSubmit, control, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      title: task?.title ?? '',
      notes: task?.notes ?? '',
      priority: task?.priority ?? 'medium',
      status: task?.status ?? defaultStatus,
      due_date: task?.due_date ?? '',
      project_id: task?.project_id ?? defaultProjectId ?? '',
      goal_id: task?.goal_id ?? defaultGoalId ?? '',
      is_recurring: task?.is_recurring ?? false,
      recurrence_rule: task?.recurrence_rule ?? '',
    },
  });

  const isRecurring = useWatch({ control, name: 'is_recurring' }) ?? false;

  const onSubmit = async (values: FormValues) => {
    const recurrenceRule = values.is_recurring && values.recurrence_rule ? values.recurrence_rule : undefined;
    const createPayload = {
      title: values.title,
      notes: values.notes || undefined,
      priority: values.priority,
      status: values.status,
      due_date: values.due_date || undefined,
      project_id: values.project_id || undefined,
      goal_id: values.goal_id || undefined,
      is_recurring: values.is_recurring,
      recurrence_rule: recurrenceRule as RecurrenceRule | undefined,
    };

    if (isEdit) {
      await updateTask.mutateAsync({
        id: task.id,
        title: values.title,
        notes: values.notes || null,
        priority: values.priority,
        status: values.status,
        due_date: values.due_date || null,
        project_id: values.project_id || null,
        goal_id: values.goal_id || null,
        is_recurring: values.is_recurring,
        recurrence_rule: recurrenceRule ?? null,
      });
    } else {
      await createTask.mutateAsync(createPayload);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Title *</label>
        <Input {...register('title', { required: true })} placeholder="What needs to be done?" autoFocus className="text-base font-medium" />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Notes</label>
        <Textarea {...register('notes')} placeholder="Add details..." rows={3} />
      </div>


      {/* Subtasks section (edit mode only) */}
      {isEdit && task && (
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Subtasks</label>
          <SubtaskList task={task} />
        </div>
      )}

      <div className="h-px bg-slate-100 dark:bg-slate-800" />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Priority</label>
          <Select {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Status</label>
          <Select {...register('status')}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Due Date</label>
          <Input type="date" {...register('due_date')} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Project</label>
          <Select {...register('project_id')}>
            <option value="">No project</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Goal</label>
        <Select {...register('goal_id')}>
          <option value="">No goal</option>
          {goals?.map((g) => (
            <option key={g.id} value={g.id}>{g.title}</option>
          ))}
        </Select>
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-800" />

      <div className="space-y-2">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div className="relative">
            <input type="checkbox" {...register('is_recurring')} className="peer sr-only" />
            <div className="h-4 w-4 rounded border-2 border-slate-300 peer-checked:border-slate-900 peer-checked:bg-slate-900 transition-colors dark:border-slate-600 dark:peer-checked:border-white dark:peer-checked:bg-white" />
            <svg className="absolute inset-0 m-auto h-2.5 w-2.5 text-white dark:text-slate-900 opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Recurring task</span>
        </label>
        {isRecurring && (
          <Select {...register('recurrence_rule')}>
            <option value="">Select frequency</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}

