'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

type UpdateUserInput = string | {
  displayName?: string;
  metadata?: Record<string, unknown>;
};

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateUserInput) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const displayName = typeof input === 'string' ? input : input.displayName;
      const metadata = typeof input === 'string' ? {} : input.metadata ?? {};
      const data = {
        ...user?.user_metadata,
        ...metadata,
        ...(displayName !== undefined ? { full_name: displayName } : {}),
      };

      const { error } = await supabase.auth.updateUser({
        data,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
