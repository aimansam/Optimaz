'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitFeedback, type FeedbackCategory } from '@/hooks/use-feedback';

interface FeedbackButtonProps {
  className?: string;
}

const CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  general: 'General feedback',
  bug: 'Bug report',
  idea: 'Feature idea',
  pricing: 'Pricing feedback',
};

export function FeedbackButton({ className }: FeedbackButtonProps) {
  const pathname = usePathname();
  const submitFeedback = useSubmitFeedback();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [message, setMessage] = useState('');

  function closeDialog() {
    if (submitFeedback.isPending) return;
    setOpen(false);
  }

  function resetForm() {
    setCategory('general');
    setMessage('');
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitFeedback.mutate(
      { category, message, pagePath: pathname },
      {
        onSuccess: () => {
          resetForm();
          setOpen(false);
        },
      }
    );
  }

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)} title="Send feedback" className={className}>
        <MessageSquare className="h-4 w-4" />
      </Button>

      <Dialog open={open} onClose={closeDialog} title="Send feedback" className="min-h-0 sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="feedbackCategory" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Category
            </label>
            <Select
              id="feedbackCategory"
              value={category}
              disabled={submitFeedback.isPending}
              onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
            >
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </Select>
          </div>

          <div>
            <label htmlFor="feedbackMessage" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Message
            </label>
            <Textarea
              id="feedbackMessage"
              value={message}
              minLength={3}
              maxLength={2000}
              required
              disabled={submitFeedback.isPending}
              placeholder="Tell us what is confusing, broken, missing, or worth improving."
              className="min-h-32"
              onChange={(event) => setMessage(event.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">Sent with the current page path so feedback has context.</p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={closeDialog} disabled={submitFeedback.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitFeedback.isPending || message.trim().length < 3}>
              {submitFeedback.isPending ? 'Sending...' : 'Send feedback'}
            </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
