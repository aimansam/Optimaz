'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';
import { getNextRecurringDueDate } from '@/lib/recurrence';
import type { Subtask, Task, TaskStatus, Priority, RecurrenceRule } from '@/lib/types';

const DEFAULT_TASK_QUERY_LIMIT = 300;
const DASHBOARD_TASK_QUERY_LIMIT = 100;
const NOTIFICATION_TASK_QUERY_LIMIT = 80;
const ROUTINE_HISTORY_TASK_QUERY_LIMIT = 200;
const SCHEDULED_TASK_QUERY_LIMIT = 300;
const NOTIFICATION_TASK_SELECT = 'id, user_id, project_id, goal_id, title, notes, priority, status, due_date, due_time, due_timezone, position, completed_at, archived_at, is_recurring, recurrence_rule, recurrence_weekdays, created_at, updated_at';

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

/** Returns today's date as YYYY-MM-DD in the browser's LOCAL timezone (not UTC). */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

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

export function useScheduledTasks(limit = SCHEDULED_TASK_QUERY_LIMIT, includeArchived = true) {
  return useQuery({
    queryKey: ['tasks', 'scheduled', limit, includeArchived],
    queryFn: async () => {
      const query = supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color), goal:goals(id,title,color)')
        .not('due_date', 'is', null)
        .order('due_date', { ascending: true })
        .order('due_time', { ascending: true, nullsFirst: false })
        .limit(limit);
      const { data, error } = await (includeArchived ? query : applyActiveTaskFilter(query));
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useRoutineHistoryTasks(limit = ROUTINE_HISTORY_TASK_QUERY_LIMIT) {
  return useQuery({
    queryKey: ['tasks', 'routine-history', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color), goal:goals(id,title,color)')
        .eq('status', 'done')
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useNotificationTasks(limit = NOTIFICATION_TASK_QUERY_LIMIT) {
  return useQuery({
    queryKey: ['tasks', 'notifications', limit],
    queryFn: async () => {
      const upcoming = new Date();
      upcoming.setDate(upcoming.getDate() + 7);
      const upcomingKey = upcoming.toISOString().split('T')[0];
      const completedSince = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

      const [activeResult, completedResult] = await Promise.all([
        applyActiveTaskFilter(supabase
          .from('tasks')
          .select(NOTIFICATION_TASK_SELECT)
          .neq('status', 'done')
          .lte('due_date', upcomingKey)
          .order('due_date', { ascending: true })
          .order('due_time', { ascending: true, nullsFirst: false })
          .limit(limit)),
        applyActiveTaskFilter(supabase
          .from('tasks')
          .select(NOTIFICATION_TASK_SELECT)
          .eq('status', 'done')
          .gte('updated_at', completedSince)
          .order('updated_at', { ascending: false })
          .limit(Math.min(limit, 24))),
      ]);

      if (activeResult.error) throw activeResult.error;
      if (completedResult.error) throw completedResult.error;
      return [...(activeResult.data ?? []), ...(completedResult.data ?? [])] as Task[];
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
      const today = localToday();
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
      const today = localToday();
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
  recurrence_weekdays?: number[] | null;
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
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      void trackEvent('task_created', {
        task_id: task.id,
        has_due_date: Boolean(task.due_date),
        has_due_time: Boolean(task.due_time),
        has_project: Boolean(task.project_id),
        has_goal: Boolean(task.goal_id),
      });
      toast.success('Task created!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    onMutate: async ({ id, ...updates }: Partial<Task> & { id: string }) => {
      // Cancel any in-flight refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['tasks'] });

      // Snapshot ALL task query caches so we can roll back on error
      const previousSnapshots: { queryKey: unknown[]; data: unknown }[] = [];
      const allTaskCaches = queryClient.getQueriesData<Task[]>({ queryKey: ['tasks'] });

      for (const [queryKey, cachedData] of allTaskCaches) {
        if (!Array.isArray(cachedData)) continue;
        previousSnapshots.push({ queryKey: queryKey as unknown[], data: cachedData });

        const isToday = Array.isArray(queryKey) && queryKey[1] === 'today';

        queryClient.setQueryData<Task[]>(queryKey, (old) => {
          if (!Array.isArray(old)) return old;

          // If this task is being marked done, remove it from "today" queries
          // (useTodayTasks only returns non-done tasks)
          if (updates.status === 'done' && isToday) {
            return old.filter((t) => t.id !== id);
          }

          // Otherwise patch the task in-place
          return old.map((t) => {
            if (t.id !== id) return t;
            const now = new Date().toISOString();
            return {
              ...t,
              ...updates,
              completed_at:
                updates.status === 'done'
                  ? now
                  : updates.status !== undefined
                  ? null
                  : t.completed_at,
              archived_at:
                updates.status !== undefined && updates.status !== 'done'
                  ? null
                  : t.archived_at,
            } as Task;
          });
        });
      }

      return { previousSnapshots };
    },
    onError: (_err, _variables, context) => {
      // Roll back all optimistic updates
      if (context?.previousSnapshots) {
        for (const { queryKey, data } of context.previousSnapshots) {
          queryClient.setQueryData(queryKey, data);
        }
      }
    },
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

      const { data: recurringSubtasks, error: recurringSubtasksError } = await supabase
        .from('subtasks')
        .select('title, position')
        .eq('task_id', updatedTask.id)
        .order('position', { ascending: true });

      if (recurringSubtasksError) throw recurringSubtasksError;
      const subtaskTemplates = (recurringSubtasks ?? []) as Pick<Subtask, 'title' | 'position'>[];

      const nextDueDate = getNextRecurringDueDate(updatedTask.due_date, updatedTask.recurrence_rule as RecurrenceRule, updatedTask.recurrence_weekdays);
      const { data: nextTask, error: nextTaskError } = await supabase
        .from('tasks')
        .insert({
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
          recurrence_weekdays: updatedTask.recurrence_rule === 'weekly' ? updatedTask.recurrence_weekdays : null,
        })
        .select('id')
        .single();

      if (nextTaskError) throw nextTaskError;

      if (subtaskTemplates.length > 0) {
        const { error: nextSubtasksError } = await supabase.from('subtasks').insert(
          subtaskTemplates.map(subtask => ({
            task_id: nextTask.id,
            user_id: updatedTask.user_id,
            title: subtask.title,
            completed: false,
            position: subtask.position,
          }))
        );

        if (nextSubtasksError) throw nextSubtasksError;
      }

      const { error: pauseCompletedTaskError } = await supabase
        .from('tasks')
        .update({ is_recurring: false, recurrence_rule: null, recurrence_weekdays: null })
        .eq('id', updatedTask.id);

      if (pauseCompletedTaskError) throw pauseCompletedTaskError;

      return { ...updatedTask, is_recurring: false, recurrence_rule: null, recurrence_weekdays: null } as Task;
    },
    onSuccess: (task, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
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
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      toast.success('Task deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete task: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      void trackEvent('task_archived', { task_id: task.id });
      toast.success('Task archived');
    },
    onError: (error: Error) => {
      toast.error(`Failed to archive task: ${error.message}`);
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
      queryClient.invalidateQueries({ queryKey: ['task-stats'] });
      void trackEvent('task_restored', { task_id: task.id });
      toast.success('Task restored');
    },
    onError: (error: Error) => {
      toast.error(`Failed to restore task: ${error.message}`);
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
