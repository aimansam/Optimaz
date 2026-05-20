'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { useDisablePushSubscription, usePushSubscription, useSendTestPushNotification } from '@/hooks/use-push';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { AlertTriangle, Bell, BellOff, CheckCircle2, Palette, Send, Trash2, User, XCircle } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useUpdateUser } from '@/hooks/use-update-user';
import { useDeleteAccount } from '@/hooks/use-account-controls';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const { mutate: subscribe, data: pushSubscription, isPending, isSuccess, error: pushError, reset: resetPushSubscription } = usePushSubscription();
  const testPush = useSendTestPushNotification();
  const disablePush = useDisablePushSubscription();
  const { data: user } = useUser();
  const { mutate: updateUser, isPending: isSaving, isSuccess: saveSuccess, isError: saveError } = useUpdateUser();
  const deleteAccount = useDeleteAccount();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name ?? '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [pushStatus, setPushStatus] = useState<'checking' | 'unsupported' | 'denied' | 'available' | 'enabled'>('checking');
  const [pushDevice, setPushDevice] = useState('This device');
  const accountName = user?.user_metadata?.full_name ?? user?.user_metadata?.name ?? user?.email ?? 'Signed in user';
  const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture;
  const accountInitial = accountName.trim().charAt(0).toUpperCase() || 'U';
  const accountCreatedAt = user?.created_at
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(user.created_at))
    : 'Unavailable';

  // Keep input in sync if user changes
  React.useEffect(() => {
    setDisplayName(user?.user_metadata?.full_name ?? '');
  }, [user?.user_metadata?.full_name]);

  React.useEffect(() => {
    let active = true;

    async function checkPushStatus() {
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        if (active) setPushStatus('unsupported');
        return;
      }

      if (Notification.permission === 'denied') {
        if (active) setPushStatus('denied');
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!active) return;

        if (subscription) {
          setPushStatus('enabled');
          setPushDevice(new URL(subscription.endpoint).hostname);
        } else {
          setPushStatus('available');
        }
      } catch {
        if (active) setPushStatus('available');
      }
    }

    checkPushStatus();

    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    if (pushSubscription) {
      setPushStatus('enabled');
      setPushDevice(new URL(pushSubscription.endpoint).hostname);
    }
  }, [pushSubscription]);

  const pushStatusConfig = {
    checking: {
      icon: Bell,
      label: 'Checking device support',
      description: 'TaskFlow is checking whether this browser can receive push notifications.',
      className: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300',
    },
    unsupported: {
      icon: XCircle,
      label: 'Not supported on this browser',
      description: 'Use a browser with service worker and push notification support to enable alerts.',
      className: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300',
    },
    denied: {
      icon: XCircle,
      label: 'Notifications are blocked',
      description: 'Enable notifications for this site in your browser settings, then return here.',
      className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300',
    },
    available: {
      icon: Bell,
      label: 'Ready to enable',
      description: 'Turn on reminders for upcoming tasks on this device.',
      className: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-300',
    },
    enabled: {
      icon: CheckCircle2,
      label: 'Enabled on this device',
      description: `Subscribed through ${pushDevice}.`,
      className: 'border-green-200 bg-green-50 text-green-700 dark:border-green-900/60 dark:bg-green-950/20 dark:text-green-300',
    },
  }[pushStatus];
  const PushStatusIcon = pushStatusConfig.icon;
  const pushButtonLabel = pushStatus === 'enabled'
    ? 'Enabled'
    : isPending
      ? 'Enabling...'
      : 'Enable Notifications';
  const pushButtonDisabled = isPending || pushStatus === 'checking' || pushStatus === 'unsupported' || pushStatus === 'denied' || pushStatus === 'enabled';

  return (
    <>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Account settings */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">Account settings</h2>
            </div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 bg-cover bg-center text-sm font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
                style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
                aria-hidden="true"
              >
                {!avatarUrl && accountInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{accountName}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.email ?? 'No email available'}</p>
                <p className="mt-1 text-xs text-slate-400">Joined {accountCreatedAt}</p>
              </div>
            </div>
            <form
              className="space-y-3 border-b border-slate-100 py-5 dark:border-slate-800"
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
            <div className="pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Danger zone</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Delete account</p>
                  <p className="text-xs text-red-500 dark:text-red-300/80">Permanently remove your account and TaskFlow data.</p>
                </div>
                <Button type="button" variant="danger" size="sm" onClick={() => setDeleteDialogOpen(true)} className="self-start sm:self-auto">
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
            <div className={`mb-4 rounded-lg border p-3 ${pushStatusConfig.className}`}>
              <div className="flex gap-2">
                <PushStatusIcon className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="text-sm font-medium">{pushStatusConfig.label}</p>
                  <p className="mt-1 text-xs opacity-80">{pushStatusConfig.description}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={() => {
                  disablePush.reset();
                  testPush.reset();
                  subscribe();
                }}
                disabled={pushButtonDisabled}
              >
                {pushButtonLabel}
              </Button>
              {pushStatus === 'enabled' && (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      disablePush.reset();
                      testPush.mutate();
                    }}
                    disabled={testPush.isPending || disablePush.isPending}
                  >
                    <Send className="h-4 w-4" />
                    {testPush.isPending ? 'Sending...' : 'Send test'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => disablePush.mutate(undefined, {
                      onSuccess: () => {
                        setPushStatus('available');
                        setPushDevice('This device');
                        resetPushSubscription();
                        testPush.reset();
                      },
                    })}
                    disabled={disablePush.isPending || testPush.isPending}
                  >
                    <BellOff className="h-4 w-4" />
                    {disablePush.isPending ? 'Disabling...' : 'Disable'}
                  </Button>
                </>
              )}
            </div>
            {isSuccess && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">Notifications enabled!</p>
            )}
            {pushError && (
              <p className="mt-2 text-sm text-red-500">{pushError.message}</p>
            )}
            {testPush.isSuccess && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">Test notification sent.</p>
            )}
            {testPush.isError && (
              <p className="mt-2 text-sm text-red-500">{testPush.error.message}</p>
            )}
            {disablePush.isSuccess && (
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">Notifications disabled on this device.</p>
            )}
            {disablePush.isError && (
              <p className="mt-2 text-sm text-red-500">{disablePush.error.message}</p>
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
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/60 dark:bg-red-950/20">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-300">This cannot be undone.</p>
                <p className="mt-1 text-xs text-red-600 dark:text-red-300/80">
                  TaskFlow will permanently remove your account and all workspace data.
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-red-700 dark:text-red-300 sm:grid-cols-3">
              {['Projects', 'Tasks', 'Subtasks', 'Goals', 'Feedback', 'Notifications'].map((item) => (
                <span key={item} className="rounded-md bg-white/70 px-2 py-1 text-center dark:bg-red-950/40">
                  {item}
                </span>
              ))}
            </div>
          </div>
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
