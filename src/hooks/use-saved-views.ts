'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import type { SavedView } from '@/lib/types';

const supabase = createClient();

export function useSavedViews<TFilters = Record<string, unknown>>(viewType: SavedView['view_type']) {
  return useQuery({
    queryKey: ['saved-views', viewType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('saved_views')
        .select('*')
        .eq('view_type', viewType)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data as SavedView<TFilters>[];
    },
  });
}

export function useUpsertSavedView<TFilters = Record<string, unknown>>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { view_type: SavedView['view_type']; name: string; filters: TFilters }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('saved_views')
        .upsert(
          {
            user_id: user.id,
            view_type: input.view_type,
            name: input.name,
            filters: input.filters,
          },
          { onConflict: 'user_id,view_type,name' }
        )
        .select()
        .single();
      if (error) throw error;
      return data as SavedView<TFilters>;
    },
    onSuccess: (_view, variables) => {
      queryClient.invalidateQueries({ queryKey: ['saved-views', variables.view_type] });
    },
  });
}

export function useDeleteSavedView() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, view_type }: { id: string; view_type: SavedView['view_type'] }) => {
      const { error } = await supabase.from('saved_views').delete().eq('id', id);
      if (error) throw error;
      return view_type;
    },
    onSuccess: (viewType) => {
      queryClient.invalidateQueries({ queryKey: ['saved-views', viewType] });
    },
  });
}