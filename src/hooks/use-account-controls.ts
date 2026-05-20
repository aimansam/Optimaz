'use client';

import { useMutation } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const body = await response.json();
    return typeof body.error === 'string' ? body.error : fallback;
  } catch {
    return fallback;
  }
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Could not delete account'));
      }

      await supabase.auth.signOut();
    },
  });
}