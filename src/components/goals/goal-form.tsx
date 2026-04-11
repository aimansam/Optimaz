'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateGoal, useUpdateGoal } from '@/hooks/use-goals';
import type { Goal } from '@/lib/types';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

interface GoalFormProps {
  goal?: Goal;
  onClose: () => void;
}

interface FormValues {
  title: string;
  description: string;
  color: string;
  due_date: string;
}

export function GoalForm({ goal, onClose }: GoalFormProps) {
  'use no memo';
  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const isEdit = !!goal;

  const { register, handleSubmit, watch, setValue, formState: { isSubmitting } } = useForm<FormValues>({
    defaultValues: {
      title: goal?.title ?? '',
      description: goal?.description ?? '',
      color: goal?.color ?? COLORS[0],
      due_date: goal?.due_date ?? '',
    },
  });

  const selectedColor = watch('color');

  const onSubmit = async (values: FormValues) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      color: values.color,
      due_date: values.due_date || undefined,
    };

    if (isEdit) {
      await updateGoal.mutateAsync({ id: goal.id, ...payload });
    } else {
      await createGoal.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Goal Title *</label>
        <Input {...register('title', { required: true })} placeholder="e.g. Launch my side project" autoFocus />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
        <Textarea {...register('description')} placeholder="What does achieving this goal look like?" rows={3} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Target Date</label>
        <Input type="date" {...register('due_date')} />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue('color', c)}
              className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                borderColor: selectedColor === c ? 'white' : 'transparent',
                boxShadow: selectedColor === c ? `0 0 0 3px ${c}` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Goal'}
        </Button>
      </div>
    </form>
  );
}
