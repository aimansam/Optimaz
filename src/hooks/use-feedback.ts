'use client';

import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { trackEvent } from '@/lib/analytics';

const supabase = createClient();

export type FeedbackCategory = 'general' | 'bug' | 'idea' | 'pricing';

interface SubmitFeedbackInput {
  category: FeedbackCategory;
  message: string;
  pagePath?: string;
}


export function useSubmitFeedback() {
  return useMutation({
    mutationFn: async ({ category, message, pagePath }: SubmitFeedbackInput) => {
      const trimmedMessage = message.trim();
      if (trimmedMessage.length < 3) throw new Error('Feedback is too short');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('feedback')
        .insert({
          user_id: user.id,
          category,
          message: trimmedMessage,
          page_path: pagePath,
        })
        .select('id')
        .single();

      if (error) throw error;
      return data as { id: string };
    },
    onSuccess: (_data, variables) => {
      toast.success('Feedback sent. Thank you.');
      void trackEvent('feedback_submitted', { category: variables.category, page_path: variables.pagePath });
    },
    onError: () => {
      toast.error('Could not send feedback');
    },
  });
}