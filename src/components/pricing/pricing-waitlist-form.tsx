'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

async function getErrorMessage(response: Response) {
  try {
    const body = await response.json();
    return typeof body.error === 'string' ? body.error : 'Could not join waitlist';
  } catch {
    return 'Could not join waitlist';
  }
}

export function PricingWaitlistForm() {
  const [email, setEmail] = useState('');
  const [intent, setIntent] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('submitting');
    setMessage('');

    const response = await fetch('/api/pricing-waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, intent }),
    });

    if (!response.ok) {
      setStatus('error');
      setMessage(await getErrorMessage(response));
      return;
    }

    setStatus('success');
    setMessage('You are on the pricing waitlist.');
    setEmail('');
    setIntent('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="pricing-email">
          Email
        </label>
        <Input
          id="pricing-email"
          type="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
          disabled={status === 'submitting'}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="pricing-intent">
          What would make Optimaz worth paying for?
        </label>
        <Textarea
          id="pricing-intent"
          value={intent}
          onChange={event => setIntent(event.target.value)}
          placeholder="Recurring tasks, calendar view, team sharing..."
          maxLength={500}
          disabled={status === 'submitting'}
        />
      </div>
      <Button type="submit" disabled={status === 'submitting' || !email.trim()}>
        {status === 'submitting' ? 'Joining...' : 'Join waitlist'}
      </Button>
      {message && (
        <p className={status === 'error' ? 'text-sm text-red-500' : 'text-sm text-green-600 dark:text-green-400'}>{message}</p>
      )}
    </form>
  );
}