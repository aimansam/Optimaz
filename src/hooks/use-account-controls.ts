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

export function useExportAccount() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/account/export');

      if (!response.ok) {
        throw new Error(await getErrorMessage(response, 'Could not export account data'));
      }

      const blob = await response.blob();
      const disposition = response.headers.get('Content-Disposition') ?? '';
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? 'taskflow-export.json';

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}
