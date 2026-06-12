'use client';

import { useMemo } from 'react';
import { Quote } from 'lucide-react';

const QUOTES: { text: string; author: string }[] = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
  { text: 'You don\'t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
  { text: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
  { text: 'Don\'t wait. The time will never be just right.', author: 'Napoleon Hill' },
  { text: 'Focus on being productive instead of busy.', author: 'Tim Ferriss' },
  { text: 'Either you run the day or the day runs you.', author: 'Jim Rohn' },
  { text: 'You will never find time for anything. If you want time, you must make it.', author: 'Charles Buxton' },
  { text: 'The key is not to prioritise what\'s on your schedule, but to schedule your priorities.', author: 'Stephen Covey' },
  { text: 'Productivity is never an accident. It is always the result of a commitment to excellence.', author: 'Paul J. Meyer' },
  { text: 'Work smarter not harder and trust your instincts.', author: 'Susan Wojcicki' },
  { text: 'If you spend too much time thinking about a thing, you\'ll never get it done.', author: 'Bruce Lee' },
  { text: 'Done is better than perfect.', author: 'Sheryl Sandberg' },
  { text: 'The successful warrior is the average man with laser-like focus.', author: 'Bruce Lee' },
  { text: 'Ordinary people think merely of spending time. Great people think of using it.', author: 'Arthur Schopenhauer' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe' },
  { text: 'If you want to achieve greatness, stop asking for permission.', author: 'Anonymous' },
  { text: 'Things may come to those who wait, but only the things left by those who hustle.', author: 'Abraham Lincoln' },
  { text: 'One day or day one — you decide.', author: 'Unknown' },
  { text: 'Every accomplishment starts with the decision to try.', author: 'John F. Kennedy' },
  { text: 'Do it now. Sometimes "later" becomes "never".', author: 'Unknown' },
  { text: 'You don\'t need more time. You need to decide.', author: 'Seth Godin' },
  { text: 'Progress is more important than perfection.', author: 'Simon Sinek' },
  { text: 'The harder you work for something, the greater you\'ll feel when you achieve it.', author: 'Unknown' },
  { text: 'Push yourself, because no one else is going to do it for you.', author: 'Unknown' },
  { text: 'Great things never come from comfort zones.', author: 'Unknown' },
  { text: 'Dream bigger. Do bigger.', author: 'Unknown' },
  { text: 'Work hard in silence; let success be your noise.', author: 'Frank Ocean' },
  { text: 'Be stronger than your excuses.', author: 'Unknown' },
  { text: 'You\'re capable of more than you know.', author: 'Unknown' },
  { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'Little by little, day by day, what is meant for you will find its way.', author: 'Unknown' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'You are braver than you believe, stronger than you seem.', author: 'A.A. Milne' },
  { text: 'Don\'t stop when you\'re tired. Stop when you\'re done.', author: 'Unknown' },
  { text: 'Today is the day you were waiting for yesterday.', author: 'Unknown' },
  { text: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
];

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

interface MotivationQuoteProps {
  inline?: boolean;
}

export function MotivationQuote({ inline }: MotivationQuoteProps = {}) {
  const quote = useMemo(() => {
    const today = new Date();
    const index = getDayOfYear(today) % QUOTES.length;
    return QUOTES[index];
  }, []);

  // Inline mode — single italic line for use in header bar
  if (inline) {
    return (
      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
        <Quote className="h-3 w-3 shrink-0 text-indigo-300 dark:text-indigo-700" />
        <span className="italic">&ldquo;{quote.text}&rdquo;</span>
        <span className="not-italic font-medium">— {quote.author}</span>
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/30 dark:bg-indigo-950/20">
      <div className="mb-1.5 flex items-center gap-1.5">
        <Quote className="h-3 w-3 shrink-0 text-indigo-400" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Daily quote</span>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-700 dark:text-slate-300 italic">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="mt-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
        — {quote.author}
      </p>
    </div>
  );
}
