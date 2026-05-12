'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import type { Project } from '@/lib/types';

const supabase = createClient();

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Project[];
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; description?: string; color?: string; tags?: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { data, error } = await supabase
        .from('projects')
        .insert({ ...input, user_id: user.id, tags: input.tags ?? [] })
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Project> & { id: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data as Project;
    },
    onSuccess: (_data, variables) => {
      if (variables) {
        if ('favorite' in variables) {
          toast.success(variables.favorite ? 'Marked as favorite' : 'Removed from favorites');
        } else if ('archived' in variables) {
          toast.success('Project archived');
        } else if ('color' in variables && !('name' in variables)) {
          toast.success('Project color updated');
        } else if ('name' in variables) {
          toast.success('Project updated');
        }
      }
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (_error, variables) => {
      if (variables) {
        if ('favorite' in variables) {
          toast.error('Failed to update favorite');
        } else if ('archived' in variables) {
          toast.error('Failed to archive project');
        } else if ('color' in variables && !('name' in variables)) {
          toast.error('Failed to update color');
        } else if ('name' in variables) {
          toast.error('Failed to update project');
        } else {
          toast.error('Failed to update project');
        }
      } else {
        toast.error('Failed to update project');
      }
    },
  });
}
export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
