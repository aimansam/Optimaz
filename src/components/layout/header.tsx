'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { NotificationBell } from '@/components/ui/notification-bell';
import { usePushSubscription } from '@/hooks/use-push';

const supabase = createClient();

interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  const router = useRouter();
  const { mutate: subscribe } = usePushSubscription();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-950/80">
      <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
      <div className="flex items-center gap-1.5">
        {actions}
        <NotificationBell notifications={[]} />
        <ThemeToggle />
        <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}

