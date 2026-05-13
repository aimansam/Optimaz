'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { usePushSubscription } from '@/hooks/use-push';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Bell, Download, Palette, Trash2, User } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useUpdateUser } from '@/hooks/use-update-user';
import { useDeleteAccount, useExportAccountData } from '@/hooks/use-account-controls';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const { mutate: subscribe, isPending, isSuccess, error: pushError } = usePushSubscription();
  const { data: user } = useUser();
  const { mutate: updateUser, isPending: isSaving, isSuccess: saveSuccess, isError: saveError } = useUpdateUser();
  const exportAccountData = useExportAccountData();
  const deleteAccount = useDeleteAccount();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name ?? '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

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

          {/* Account */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Account</h2>
            </div>
            <div className="space-y-4">
              <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Export your data</p>
                  <p className="text-xs text-slate-400">Download your profile, projects, tasks, goals, feedback, and account activity.</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => exportAccountData.mutate()}
                  disabled={exportAccountData.isPending}
                >
                  <Download className="h-4 w-4" />
                  {exportAccountData.isPending ? 'Exporting...' : 'Export'}
                </Button>
              </div>
              {exportAccountData.isError && (
                <p className="text-xs text-red-500">{exportAccountData.error.message}</p>
              )}
              {exportAccountData.isSuccess && (
                <p className="text-xs text-green-600 dark:text-green-400">Export downloaded.</p>
              )}

              <div className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/60 dark:bg-red-950/20 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Delete account</p>
                  <p className="text-xs text-red-500 dark:text-red-300/80">Permanently remove your account and TaskFlow data.</p>
                </div>
                <Button type="button" variant="danger" size="sm" onClick={() => setDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
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
            <div className="mt-3 flex gap-3 text-sm">
              <Link href="/privacy" className="font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="font-medium text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
                Terms
              </Link>
            </div>
          </section>
        </div>
      </div>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deleteAccount.isPending) {
            setDeleteDialogOpen(false);
            setDeleteConfirmation('');
          }
        }}
        title="Delete Account"
        className="max-w-md min-h-0"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            This permanently deletes your TaskFlow account, projects, tasks, goals, feedback, and notifications. Export your data first if you need a copy.
          </p>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="deleteConfirmation">
              Type DELETE to confirm
            </label>
            <Input
              id="deleteConfirmation"
              value={deleteConfirmation}
              onChange={event => setDeleteConfirmation(event.target.value)}
              disabled={deleteAccount.isPending}
              autoComplete="off"
            />
          </div>
          {deleteAccount.isError && (
            <p className="text-sm text-red-500">{deleteAccount.error.message}</p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setDeleteDialogOpen(false);
                setDeleteConfirmation('');
              }}
              disabled={deleteAccount.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleteConfirmation !== 'DELETE' || deleteAccount.isPending}
              onClick={() => deleteAccount.mutate(undefined, {
                onSuccess: () => {
                  router.push('/auth/login');
                  router.refresh();
                },
              })}
            >
              {deleteAccount.isPending ? 'Deleting...' : 'Delete account'}
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
