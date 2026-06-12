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
    <header
      className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 px-3 backdrop-blur-sm sm:px-6"
      style={{
        background: 'var(--card-bg, var(--background))',
        borderBottom: '2px solid rgb(var(--accent) / 0.6)',
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border shadow-sm md:hidden"
          style={{
            borderColor: 'var(--card-border)',
            background: 'var(--card-bg)',
            color: 'var(--foreground)',
          }}
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="truncate text-base font-semibold" style={{ color: 'var(--foreground)' }}>{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
        {actions}
        <GlobalSearch />
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
