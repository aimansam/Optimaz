'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';
import type { Task, TaskStatus, Priority, RecurrenceRule } from '@/lib/types';

const DEFAULT_TASK_QUERY_LIMIT = 500;
const DASHBOARD_TASK_QUERY_LIMIT = 100;

function getNextRecurringDueDate(dueDate: string | null, rule: RecurrenceRule) {
  if (!dueDate) return null;

  const nextDate = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(nextDate.getTime())) return null;

  if (rule === 'daily') nextDate.setDate(nextDate.getDate() + 1);
  if (rule === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
  if (rule === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);

  return nextDate.toISOString().split('T')[0];
}

function applyActiveTaskFilter<T extends { is: (column: string, value: null) => T }>(query: T) {
  return query.is('archived_at', null);
}

export function useGoalTasks(goalId: string, limit = DEFAULT_TASK_QUERY_LIMIT) {
  return useQuery({
    queryKey: ['tasks', 'goal', goalId, limit],
    queryFn: async () => {
      const { data, error } = await applyActiveTaskFilter(supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .eq('goal_id', goalId)
        .order('position', { ascending: true })
        .limit(limit));
      if (error) throw error;
      return data as Task[];
    },
  });
}

const supabase = createClient();

export function useTasks(projectId?: string, limit = DEFAULT_TASK_QUERY_LIMIT) {
  return useQuery({
    queryKey: ['tasks', projectId, limit],
    queryFn: async () => {
      let query = applyActiveTaskFilter(supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .order('position', { ascending: true })
        .limit(limit));

      if (projectId) query = query.eq('project_id', projectId);

      const { data, error } = await query;
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useTasksByStatus(limit = DEFAULT_TASK_QUERY_LIMIT, includeArchived = false) {
  return useQuery({
    queryKey: ['tasks', 'all', limit, includeArchived],
    queryFn: async () => {
      const query = supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color), goal:goals(id,title,color)')
        .order('position', { ascending: true })
        .limit(limit);
      const { data, error } = await (includeArchived ? query : applyActiveTaskFilter(query));
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useRecurringTasks(limit = DEFAULT_TASK_QUERY_LIMIT) {
  return useQuery({
    queryKey: ['tasks', 'recurring', limit],
    queryFn: async () => {
      const { data, error } = await applyActiveTaskFilter(supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color), goal:goals(id,title,color)')
        .eq('is_recurring', true)
        .neq('status', 'done')
        .order('recurrence_rule', { ascending: true })
        .order('due_date', { ascending: true })
        .order('position', { ascending: true })
        .limit(limit));
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useTodayTasks(limit = DASHBOARD_TASK_QUERY_LIMIT) {
  return useQuery({
    queryKey: ['tasks', 'today', limit],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await applyActiveTaskFilter(supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .eq('due_date', today)
        .neq('status', 'done')
        .order('position', { ascending: true })
        .limit(limit));
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useOverdueTasks(limit = DASHBOARD_TASK_QUERY_LIMIT) {
  return useQuery({
    queryKey: ['tasks', 'overdue', limit],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await applyActiveTaskFilter(supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .lt('due_date', today)
        .neq('status', 'done')
        .order('due_date', { ascending: true })
        .limit(limit));
      if (error) throw error;
      return data as Task[];
    },
  });
}

interface CreateTaskInput {
  title: string;
  notes?: string;
  priority?: Priority;
  status?: TaskStatus;
  due_date?: string;
  due_time?: string;
  due_timezone?: string;
  project_id?: string;
  goal_id?: string;
  is_recurring?: boolean;
  recurrence_rule?: RecurrenceRule;
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...input,
          user_id: user.id,
          completed_at: input.status === 'done' ? new Date().toISOString() : null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      void trackEvent('task_created', {
        task_id: task.id,
        has_due_date: Boolean(task.due_date),
        has_due_time: Boolean(task.due_time),
        has_project: Boolean(task.project_id),
        has_goal: Boolean(task.goal_id),
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      let previousTask: Pick<Task, 'status' | 'is_recurring' | 'recurrence_rule'> | null = null;

      if (updates.status === 'done') {
        const { data: existingTask, error: existingTaskError } = await supabase
          .from('tasks')
          .select('status, is_recurring, recurrence_rule')
          .eq('id', id)
          .single();

        if (existingTaskError) throw existingTaskError;
        previousTask = existingTask as Pick<Task, 'status' | 'is_recurring' | 'recurrence_rule'>;
      }

      const normalizedUpdates = { ...updates };
      if ('status' in updates) {
        normalizedUpdates.completed_at = updates.status === 'done' ? new Date().toISOString() : null;
        if (updates.status !== 'done') normalizedUpdates.archived_at = null;
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(normalizedUpdates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      const updatedTask = data as Task;

      const shouldCreateNextOccurrence = updates.status === 'done'
        && previousTask?.status !== 'done'
        && updatedTask.is_recurring
        && updatedTask.recurrence_rule;

      if (!shouldCreateNextOccurrence) return updatedTask;

      const nextDueDate = getNextRecurringDueDate(updatedTask.due_date, updatedTask.recurrence_rule as RecurrenceRule);
      const { error: nextTaskError } = await supabase.from('tasks').insert({
        user_id: updatedTask.user_id,
        project_id: updatedTask.project_id,
        goal_id: updatedTask.goal_id,
        title: updatedTask.title,
        notes: updatedTask.notes,
        priority: updatedTask.priority,
        status: 'todo',
        due_date: nextDueDate,
        due_time: updatedTask.due_time,
        due_timezone: updatedTask.due_timezone,
        position: updatedTask.position,
        is_recurring: true,
        recurrence_rule: updatedTask.recurrence_rule,
      });

      if (nextTaskError) throw nextTaskError;

      const { error: pauseCompletedTaskError } = await supabase
        .from('tasks')
        .update({ is_recurring: false, recurrence_rule: null })
        .eq('id', updatedTask.id);

      if (pauseCompletedTaskError) throw pauseCompletedTaskError;

      return { ...updatedTask, is_recurring: false, recurrence_rule: null } as Task;
    },
    onSuccess: (task, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      if (variables.status === 'done') {
        void trackEvent('task_completed', { task_id: task.id });
      }
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });
}

export function useArchiveTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('tasks')
        .update({ status: 'done', completed_at: now, archived_at: now })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      void trackEvent('task_archived', { task_id: task.id });
    },
  });
}

export function useRestoreTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ archived_at: null })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
    },
    onSuccess: (task) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      void trackEvent('task_restored', { task_id: task.id });
    },
  });
}

export function useToggleSubtask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { error } = await supabase.from('subtasks').update({ completed }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useCreateSubtask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ task_id, title }: { task_id: string; title: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('subtasks').insert({ task_id, title, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteSubtask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('subtasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
