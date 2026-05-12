'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { NotificationBell } from '@/components/ui/notification-bell';
import { FeedbackButton } from '@/components/feedback/feedback-button';

const supabase = createClient();

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions, onMenuClick }: HeaderProps & { onMenuClick?: () => void }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/80">
      <div className="flex items-center gap-2">
        {/* Hamburger/Menu button (mobile only) */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow md:hidden border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu h-6 w-6 text-slate-900 dark:text-white"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </button>
        <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>
      <div className="flex items-center gap-1.5">
        {actions}
        <FeedbackButton />
        <NotificationBell />
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

