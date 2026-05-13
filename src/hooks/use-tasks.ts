'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';
import type { Task, TaskStatus, Priority, RecurrenceRule } from '@/lib/types';

const DEFAULT_TASK_QUERY_LIMIT = 500;
const DASHBOARD_TASK_QUERY_LIMIT = 100;

export function useGoalTasks(goalId: string, limit = DEFAULT_TASK_QUERY_LIMIT) {
  return useQuery({
    queryKey: ['tasks', 'goal', goalId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .eq('goal_id', goalId)
        .order('position', { ascending: true })
        .limit(limit);
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
      let query = supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .order('position', { ascending: true })
        .limit(limit);

      if (projectId) query = query.eq('project_id', projectId);

      const { data, error } = await query;
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useTasksByStatus(limit = DEFAULT_TASK_QUERY_LIMIT) {
  return useQuery({
    queryKey: ['tasks', 'all', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .order('position', { ascending: true })
        .limit(limit);
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
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .eq('due_date', today)
        .neq('status', 'done')
        .order('position', { ascending: true })
        .limit(limit);
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
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .lt('due_date', today)
        .neq('status', 'done')
        .order('due_date', { ascending: true })
        .limit(limit);
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
        .insert({ ...input, user_id: user.id })
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
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Task;
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
