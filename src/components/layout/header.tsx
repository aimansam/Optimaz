'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { NotificationBell } from '@/components/ui/notification-bell';
import { FeedbackButton } from '@/components/feedback/feedback-button';
import { GlobalSearch } from './global-search';

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
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200/80 bg-white/80 px-3 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/80 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm md:hidden dark:border-slate-700 dark:bg-slate-900"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5 text-slate-900 dark:text-white" />
        </button>
        <h1 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
        {actions}
        <GlobalSearch />
        <FeedbackButton className="hidden min-[390px]:inline-flex" />
        <NotificationBell />
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

