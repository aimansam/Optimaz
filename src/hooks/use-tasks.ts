'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { Task, TaskStatus, Priority, RecurrenceRule } from '@/lib/types';

export function useGoalTasks(goalId: string) {
  return useQuery({
    queryKey: ['tasks', 'goal', goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .eq('goal_id', goalId)
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
  });
}

const supabase = createClient();

export function useTasks(projectId?: string) {
  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      let query = supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .order('position', { ascending: true });

      if (projectId) query = query.eq('project_id', projectId);

      const { data, error } = await query;
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useTasksByStatus() {
  return useQuery({
    queryKey: ['tasks', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useTodayTasks() {
  return useQuery({
    queryKey: ['tasks', 'today'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .eq('due_date', today)
        .neq('status', 'done')
        .order('position', { ascending: true });
      if (error) throw error;
      return data as Task[];
    },
  });
}

export function useOverdueTasks() {
  return useQuery({
    queryKey: ['tasks', 'overdue'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('tasks')
        .select('*, subtasks(*), project:projects(id,name,color)')
        .lt('due_date', today)
        .neq('status', 'done')
        .order('due_date', { ascending: true });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
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
