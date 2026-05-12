'use client';

import { ThemeToggle } from '@/components/layout/theme-toggle';
import { usePushSubscription } from '@/hooks/use-push';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Palette, User } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useUpdateUser } from '@/hooks/use-update-user';
import React, { useState } from 'react';

export default function SettingsPage() {
  const { mutate: subscribe, isPending, isSuccess, error: pushError } = usePushSubscription();
  const { data: user } = useUser();
  const { mutate: updateUser, isPending: isSaving, isSuccess: saveSuccess, isError: saveError } = useUpdateUser();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name ?? '');

  // Keep input in sync if user changes
  React.useEffect(() => {
    setDisplayName(user?.user_metadata?.full_name ?? '');
  }, [user?.user_metadata?.full_name]);

  return (
    <>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg space-y-6">
          {/* Profile */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Profile</h2>
            </div>
            <form
              className="space-y-3"
              onSubmit={e => {
                e.preventDefault();
                updateUser(displayName);
              }}
            >
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1" htmlFor="displayName">Display Name</label>
              <Input
                id="displayName"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                autoComplete="off"
                disabled={isSaving}
              />
              <div className="flex items-center gap-2">
                <Button type="submit" size="sm" disabled={isSaving || !displayName.trim()}>
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                {saveSuccess && <span className="text-xs text-green-600 dark:text-green-400">Saved!</span>}
                {saveError && <span className="text-xs text-red-500">Error saving name</span>}
              </div>
            </form>
          </section>

          {/* Appearance */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Appearance</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</p>
                <p className="text-xs text-slate-400">Light, dark, or follow system</p>
              </div>
              <ThemeToggle />
            </div>
          </section>

          {/* Notifications */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Push Notifications</h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Get notified about upcoming tasks on your device (desktop and mobile).
            </p>
            <Button onClick={() => subscribe()} disabled={isPending}>
              {isPending ? 'Enabling...' : 'Enable Notifications'}
            </Button>
            {isSuccess && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">Notifications enabled!</p>
            )}
            {pushError && (
              <p className="mt-2 text-sm text-red-500">{pushError.message}</p>
            )}
          </section>

          {/* About */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">About TaskFlow</h2>
            <p className="text-sm text-slate-400">
              TaskFlow helps you organize projects, goals, tasks, deadlines, and daily progress in one focused workspace.
              Install it on your phone or desktop for quick access whenever you plan your day.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
