'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useDisablePushSubscription, usePushSubscription, useSendTestPushNotification } from '@/hooks/use-push';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { AlertTriangle, Bell, BellOff, Check, CheckCircle2, CreditCard, Download, ExternalLink, Gift, Palette, Send, ShieldCheck, Sparkles, Trash2, User, XCircle, Zap } from 'lucide-react';
import { THEMES } from '@/components/providers/theme-provider';
import { useUser } from '@/hooks/use-user';
import { useUpdateUser } from '@/hooks/use-update-user';
import { useDeleteAccount, useExportAccount } from '@/hooks/use-account-controls';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useBetaAccess, useHasBetaPro } from '@/hooks/use-beta-access';

const supabase = createClient();

type MfaFactor = { id: string; friendly_name?: string };
type MfaStatus = 'loading' | 'disabled' | 'enrolling' | 'enabled';

function MfaSection() {
  const [mfaStatus, setMfaStatus] = useState<MfaStatus>('loading');
  const [enrolledFactor, setEnrolledFactor] = useState<MfaFactor | null>(null);
  const [enrollData, setEnrollData] = useState<{ factorId: string; qrCode: string; secret: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [mfaError, setMfaError] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaSuccess, setMfaSuccess] = useState('');

  React.useEffect(() => {
    loadFactors();
  }, []);

  async function loadFactors() {
    setMfaStatus('loading');
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.find((f: { id: string; status: string; friendly_name?: string }) => f.status === 'verified');
    if (verified) {
      setEnrolledFactor(verified);
      setMfaStatus('enabled');
    } else {
      setMfaStatus('disabled');
    }
  }

  async function startEnroll() {
    setMfaError('');
    setMfaLoading(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Authenticator App' });
    setMfaLoading(false);
    if (error || !data) { setMfaError(error?.message ?? 'Failed to start enrollment'); return; }
    setEnrollData({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
    // Create a challenge immediately so it's ready for verify
    const { data: c, error: ce } = await supabase.auth.mfa.challenge({ factorId: data.id });
    if (ce || !c) { setMfaError(ce?.message ?? 'Failed to create challenge'); return; }
    setChallengeId(c.id);
    setMfaStatus('enrolling');
  }

  async function verifyEnroll() {
    if (!enrollData || !challengeId) return;
    if (verifyCode.length !== 6) { setMfaError('Enter the 6-digit code from your app.'); return; }
    setMfaError('');
    setMfaLoading(true);
    const { error } = await supabase.auth.mfa.verify({ factorId: enrollData.factorId, challengeId, code: verifyCode });
    setMfaLoading(false);
    if (error) { setMfaError(error.message); setVerifyCode(''); return; }
    setMfaSuccess('Two-factor authentication enabled!');
    setEnrollData(null);
    setVerifyCode('');
    setChallengeId(null);
    await loadFactors();
    setTimeout(() => setMfaSuccess(''), 3000);
  }

  async function cancelEnroll() {
    if (enrollData) {
      await supabase.auth.mfa.unenroll({ factorId: enrollData.factorId });
    }
    setEnrollData(null);
    setVerifyCode('');
    setChallengeId(null);
    setMfaError('');
    setMfaStatus('disabled');
  }

  async function disableMfa() {
    if (!enrolledFactor) return;
    setMfaError('');
    setMfaLoading(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: enrolledFactor.id });
    setMfaLoading(false);
    if (error) { setMfaError(error.message); return; }
    setEnrolledFactor(null);
    setMfaStatus('disabled');
    setMfaSuccess('Two-factor authentication disabled.');
    setTimeout(() => setMfaSuccess(''), 3000);
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-slate-400" />
        <h2 className="gradient-text font-semibold">Two-factor authentication</h2>
        {mfaStatus === 'enabled' && (
          <span className="ml-auto rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/40 dark:text-green-300">
            Enabled
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        Add an extra layer of security. After signing in you&apos;ll be asked for a code from your authenticator app.
      </p>

      {mfaStatus === 'loading' && (
        <p className="text-sm text-slate-400">Loading…</p>
      )}

      {mfaStatus === 'disabled' && (
        <Button type="button" variant="secondary" onClick={startEnroll} disabled={mfaLoading}>
          {mfaLoading ? 'Setting up…' : 'Set up 2FA'}
        </Button>
      )}

      {mfaStatus === 'enrolling' && enrollData && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              1. Scan this QR code with your authenticator app
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enrollData.qrCode} alt="MFA QR Code" className="mx-auto h-40 w-40 rounded-lg bg-white p-2" />
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                Can&apos;t scan? Enter setup key manually
              </summary>
              <p className="mt-2 break-all rounded-lg border border-slate-200 bg-white p-2 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                {enrollData.secret}
              </p>
            </details>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              2. Enter the 6-digit code to confirm
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => { setVerifyCode(e.target.value.replace(/\D/g, '')); setMfaError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && verifyEnroll()}
                placeholder="000000"
                disabled={mfaLoading}
                className="w-36 text-center font-mono tracking-widest"
              />
              <Button type="button" onClick={verifyEnroll} disabled={mfaLoading || verifyCode.length !== 6}>
                {mfaLoading ? 'Verifying…' : 'Verify & Enable'}
              </Button>
              <Button type="button" variant="ghost" onClick={cancelEnroll} disabled={mfaLoading}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {mfaStatus === 'enabled' && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Your account is protected by an authenticator app.
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={disableMfa}
            disabled={mfaLoading}
            className="self-start sm:self-auto"
          >
            {mfaLoading ? 'Removing…' : 'Remove 2FA'}
          </Button>
        </div>
      )}

      {mfaError && <p className="mt-2 text-xs text-red-500">{mfaError}</p>}
      {mfaSuccess && <p className="mt-2 text-xs text-green-600 dark:text-green-400">{mfaSuccess}</p>}
    </section>
  );
}

function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const lightThemes = THEMES.filter(t => !t.dark);
  const darkThemes = THEMES.filter(t => t.dark);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-2 mb-5">
        <Palette className="h-5 w-5 text-slate-400" />
        <h2 className="gradient-text font-semibold">Appearance</h2>
      </div>

      {/* Light themes */}
      <div className="mb-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Light themes</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {lightThemes.map(t => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-left transition-all hover:shadow-md focus:outline-none"
                style={active ? {
                  borderColor: t.accent,
                  background: t.bg,
                } : {
                  borderColor: 'var(--card-border)',
                  background: t.bg,
                }}
              >
                {/* Preview swatch */}
                <div
                  className="h-10 w-full rounded-lg border"
                  style={{
                    background: `linear-gradient(135deg, ${t.bg} 60%, ${t.accent} 100%)`,
                    borderColor: t.accent + '40',
                  }}
                />
                <div className="flex w-full items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{t.label}</p>
                    <p className="text-[10px] text-slate-400">{t.description}</p>
                  </div>
                  {active && (
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: t.accent }}
                    >
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dark themes */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Dark themes</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {darkThemes.map(t => {
            const active = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className="group relative flex flex-col items-center gap-2 rounded-xl border-2 p-3 text-left transition-all hover:shadow-md focus:outline-none"
                style={active ? {
                  borderColor: t.accent,
                  background: '#1e293b',
                } : {
                  borderColor: '#334155',
                  background: t.bg,
                }}
              >
                {/* Preview swatch */}
                <div
                  className="h-10 w-full rounded-lg border"
                  style={{
                    background: `linear-gradient(135deg, ${t.bg} 60%, ${t.accent} 100%)`,
                    borderColor: t.accent + '40',
                  }}
                />
                <div className="flex w-full items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{t.label}</p>
                    <p className="text-[10px] text-slate-500">{t.description}</p>
                  </div>
                  {active && (
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ background: t.accent }}
                    >
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const FREE_FEATURES = [
  'Unlimited tasks & subtasks',
  'Calendar view',
  'Goals tracking',
  'Up to 3 projects',
  'Mobile PWA (installable)',
  'Daily streak & progress',
];

const PRO_FEATURES = [
  'Everything in Free',
  'Unlimited projects',
  'Kanban board',
  'Recurring routines',
  'Push notifications',
  'Full analytics & insights',
  '7 themes (customization)',
  'Priority support',
];

function PlanSection() {
  const { data: betaAccess, isLoading } = useBetaAccess();
  const hasPro = useHasBetaPro();

  const grantedDate = betaAccess?.granted_at
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(betaAccess.granted_at))
    : null;

  const expiryDate = betaAccess?.pro_expires_at
    ? new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(betaAccess.pro_expires_at))
    : null;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-slate-400" />
        <h2 className="gradient-text font-semibold">Plan &amp; Billing</h2>
        {!isLoading && (
          hasPro ? (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
              <Sparkles className="h-3 w-3" />
              Pro — Beta
            </span>
          ) : (
            <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Free
            </span>
          )
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading plan…</p>
      ) : hasPro ? (
        /* ── Pro (beta) active ── */
        <div className="space-y-4">
          {/* Status banner */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900/40 dark:bg-green-950/20">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                <Zap className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                  You&apos;re on Pro — Beta Access
                </p>
                <p className="mt-0.5 text-xs text-green-700 dark:text-green-400">
                  {betaAccess?.pro_expires_at === null
                    ? 'Active for the full beta period — no expiry set yet.'
                    : `Active until ${expiryDate}.`}
                  {grantedDate && ` Granted on ${grantedDate}.`}
                </p>
              </div>
            </div>
          </div>

          {/* What's included */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">What&apos;s included</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {PRO_FEATURES.map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <Check className="h-4 w-4 shrink-0 text-green-500" strokeWidth={2.5} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Info note */}
          <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <Gift className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Thank you for being a beta tester! Your Pro access is complimentary during the beta. Pricing details will be shared before v1.0 launch.
            </p>
          </div>
        </div>
      ) : (
        /* ── Free plan ── */
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You&apos;re on the <strong className="text-slate-700 dark:text-slate-300">Free plan</strong>. Upgrade to Pro for unlimited projects, Kanban, recurring routines, analytics and more.
          </p>

          {/* Feature comparison */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Free</p>
              <div className="space-y-1.5">
                {FREE_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Pro */}
            <div className="rounded-xl border-2 p-4" style={{ borderColor: 'rgb(var(--accent))' }}>
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Pro</p>
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: 'rgb(var(--accent))' }}>
                  RM 15/mo
                </span>
              </div>
              <div className="space-y-1.5">
                {PRO_FEATURES.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 shrink-0 text-green-500" strokeWidth={2.5} />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Link href="/pricing" target="_blank">
              <Button type="button">
                <Zap className="h-4 w-4" />
                Upgrade to Pro
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </Button>
            </Link>
            <p className="text-xs text-slate-400">First month free for beta users · Cancel anytime</p>
          </div>
        </div>
      )}
    </section>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { mutate: subscribe, data: pushSubscription, isPending, isSuccess, error: pushError, reset: resetPushSubscription } = usePushSubscription();
  const testPush = useSendTestPushNotification();
  const disablePush = useDisablePushSubscription();
  const { data: user } = useUser();
  const { mutate: updateUser, isPending: isSaving, isSuccess: saveSuccess, isError: saveError } = useUpdateUser();
  const notificationPrefsUpdate = useUpdateUser();
  const deleteAccount = useDeleteAccount();
  const exportAccount = useExportAccount();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name ?? '');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [pushStatus, setPushStatus] = useState<'checking' | 'unsupported' | 'denied' | 'available' | 'enabled'>('checking');
  const [pushDevice, setPushDevice] = useState('This device');
  const [leadTimeMinutes, setLeadTimeMinutes] = useState(String(user?.user_metadata?.notification_lead_time_minutes ?? 60));
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
    setLeadTimeMinutes(String(user?.user_metadata?.notification_lead_time_minutes ?? 60));
  }, [user?.user_metadata?.notification_lead_time_minutes]);

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
      description: 'Optimaz is checking whether this browser can receive push notifications.',
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

      <div className="flex-1 overflow-y-auto overscroll-y-contain p-6" style={{ background: 'var(--background)', paddingBottom: 'max(6rem, calc(5.5rem + env(safe-area-inset-bottom, 0px)))' }}>
        <div className="max-w-2xl space-y-6">
          {/* Account settings */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-2">
              <User className="h-5 w-5 text-slate-400" />
              <h2 className="gradient-text font-semibold">Account settings</h2>
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
            <div className="border-b border-slate-100 py-5 dark:border-slate-800">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Export your data</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Download all your goals, projects, tasks, and subtasks as a JSON file.</p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => exportAccount.mutate()}
                  disabled={exportAccount.isPending}
                  className="self-start sm:self-auto"
                >
                  <Download className="h-4 w-4" />
                  {exportAccount.isPending ? 'Exporting...' : 'Export data'}
                </Button>
              </div>
              {exportAccount.isError && (
                <p className="mt-2 text-xs text-red-500">{exportAccount.error.message}</p>
              )}
            </div>
            <div className="pt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Danger zone</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Delete account</p>
                  <p className="text-xs text-red-500 dark:text-red-300/80">Permanently remove your account and Optimaz data.</p>
                </div>
                <Button type="button" variant="danger" size="sm" onClick={() => setDeleteDialogOpen(true)} className="self-start sm:self-auto">
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </section>

          {/* Two-factor authentication */}
          <MfaSection />

          {/* Appearance */}
          <AppearanceSection />

          {/* Notifications */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-slate-400" />
              <h2 className="gradient-text font-semibold">Push Notifications</h2>
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
            <form
              className="mt-5 border-t border-slate-100 pt-5 dark:border-slate-800"
              onSubmit={(event) => {
                event.preventDefault();
                notificationPrefsUpdate.mutate({
                  metadata: {
                    notification_lead_time_minutes: Number(leadTimeMinutes),
                  },
                });
              }}
            >
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="notificationLeadTime">
                  Reminder timing
                </label>
                <Select
                  id="notificationLeadTime"
                  value={leadTimeMinutes}
                  onChange={(event) => setLeadTimeMinutes(event.target.value)}
                  disabled={notificationPrefsUpdate.isPending}
                >
                  <option value="0">At due time</option>
                  <option value="15">15 minutes before</option>
                  <option value="60">1 hour before</option>
                  <option value="1440">1 day before</option>
                </Select>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Button type="submit" size="sm" disabled={notificationPrefsUpdate.isPending}>
                  {notificationPrefsUpdate.isPending ? 'Saving...' : 'Save reminder timing'}
                </Button>
                {notificationPrefsUpdate.isSuccess && <span className="text-xs text-green-600 dark:text-green-400">Saved!</span>}
                {notificationPrefsUpdate.isError && <span className="text-xs text-red-500">Could not save reminder timing</span>}
              </div>
            </form>
          </section>

          {/* Plan & Billing */}
          <PlanSection />

          {/* About */}
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="gradient-text font-semibold mb-2">About Optimaz</h2>
            <p className="text-sm text-slate-400">
              Optimaz helps you organize projects, goals, tasks, deadlines, and daily progress in one focused workspace.
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
                  Optimaz will permanently remove your account and all workspace data.
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
