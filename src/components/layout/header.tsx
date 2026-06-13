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
      className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 px-3 sm:px-6"
      style={{
        background: 'var(--sidebar-bg)',
        borderBottom: '1px solid var(--sidebar-border)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex min-w-0 items-center gap-2">
        <button
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200 md:hidden"
          style={{
            background: 'rgb(var(--accent) / 0.08)',
            color: 'var(--foreground)',
            border: '1px solid var(--glass-border)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgb(var(--accent) / 0.15)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgb(var(--accent) / 0.08)';
          }}
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <h1 className="gradient-text truncate text-base font-semibold tracking-tight">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        {actions}
        <GlobalSearch />
        <FeedbackButton />
        <NotificationBell />
        <ThemeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          title="Sign out"
          className="h-8 w-8 rounded-lg transition-all duration-200"
          style={{
            color: 'var(--muted-fg)',
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
