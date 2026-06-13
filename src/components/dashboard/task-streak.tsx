'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Crown, X, Zap, Trophy, Star, Medal, Gem } from 'lucide-react';
import type { Task } from '@/lib/types';

interface TaskStreakProps {
  tasks: Task[];
  inline?: boolean;
}

function getDateKey(dateStr: string): string {
  return new Date(dateStr).toISOString().split('T')[0];
}

function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function calculateStreak(tasks: Task[]): number {
  const doneTasks = tasks.filter(t => t.status === 'done');
  const completedDates = new Set(
    doneTasks.map(t => getDateKey(t.completed_at ?? t.updated_at))
  );
  if (completedDates.size === 0) return 0;
  const today = getTodayKey();
  const yesterday = getYesterdayKey();
  if (!completedDates.has(today) && !completedDates.has(yesterday)) return 0;
  let streak = 0;
  const cursor = new Date();
  if (!completedDates.has(today)) cursor.setDate(cursor.getDate() - 1);
  while (streak < 365) {
    const key = cursor.toISOString().split('T')[0];
    if (!completedDates.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ── Achievement tiers
const TIERS = [
  { name: 'Bronze',  icon: Medal,  days: 7,   color: '#d97706', bg: 'rgba(217,119,6,0.1)',   border: 'rgba(217,119,6,0.25)',  glow: '0 0 12px rgba(217,119,6,0.35)' },
  { name: 'Silver',  icon: Medal,  days: 14,  color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.25)', glow: '0 0 12px rgba(148,163,184,0.35)' },
  { name: 'Gold',    icon: Trophy, days: 30,  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.3)',   glow: '0 0 14px rgba(245,158,11,0.45)' },
  { name: 'Diamond', icon: Gem,    days: 100, color: '#818cf8', bg: 'rgba(129,140,248,0.1)',  border: 'rgba(129,140,248,0.3)',  glow: '0 0 16px rgba(129,140,248,0.5)' },
];

function getCurrentTier(streak: number) {
  return [...TIERS].reverse().find(t => streak >= t.days) ?? null;
}

function getNextTier(streak: number) {
  return TIERS.find(t => t.days > streak) ?? null;
}

// ── Status label
function getStatusLabel(streak: number): string {
  if (streak === 0) return 'Start today';
  if (streak <= 2) return 'Getting started';
  if (streak < 7) return 'Building momentum';
  if (streak < 14) return 'On a roll!';
  if (streak < 30) return "You're on fire!";
  if (streak < 100) return 'Legendary!';
  return 'Hall of fame';
}

// ── Flame glow filter
function getFlameFilter(streak: number): string {
  if (streak === 0) return 'none';
  if (streak < 7) return 'drop-shadow(0 0 6px rgba(245,158,11,0.5))';
  if (streak < 30) return 'drop-shadow(0 0 8px rgba(249,115,22,0.65))';
  return 'drop-shadow(0 0 12px rgba(239,68,68,0.8))';
}

function getFlameColor(streak: number): string {
  if (streak === 0) return 'var(--muted-fg)';
  if (streak < 7) return '#f59e0b';
  if (streak < 30) return '#f97316';
  return '#ef4444';
}

// ── Milestone banner (celebration)
const MILESTONE_KEY = 'streak_celebrated_milestone';
const MILESTONE_MSGS: Record<number, { icon: React.ElementType; text: string }> = {
  7:   { icon: Medal,  text: 'Bronze achieved! 7-day streak.' },
  14:  { icon: Zap,    text: 'Silver tier unlocked! 2 weeks strong.' },
  30:  { icon: Trophy, text: 'Gold tier — 30 days legendary!' },
  100: { icon: Gem,    text: 'Diamond status — 100 day elite!' },
  365: { icon: Star,   text: 'One full year — Hall of fame forever!' },
};

function MilestoneBanner({ streak, onDismiss }: { streak: number; onDismiss: () => void }) {
  const prevMilestone = [...[7, 14, 30, 100, 365]].reverse().find(m => m <= streak) ?? 0;
  if (!prevMilestone) return null;
  const msg = MILESTONE_MSGS[prevMilestone];
  if (!msg) return null;
  const MilestoneIcon = msg.icon;
  return (
    <div
      className="mb-3 flex items-center justify-between gap-2 rounded-xl px-3 py-2 animate-bounce"
      style={{
        background: 'rgba(249,115,22,0.1)',
        border: '1px solid rgba(249,115,22,0.28)',
      }}
    >
      <span className="flex items-center gap-1.5 text-sm font-bold" style={{ color: '#ea580c' }}>
        <MilestoneIcon className="h-4 w-4 shrink-0" />
        {msg.text}
      </span>
      <button
        onClick={onDismiss}
        className="flex items-center justify-center transition-opacity hover:opacity-70"
        style={{ color: '#f97316' }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Fire burst particles
function FireBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const particles = [
    { x: -30, y: -72, delay: 0,   rot: -20 },
    { x: -16, y: -92, delay: 70,  rot:  12 },
    { x:   0, y: -84, delay: 40,  rot:   0 },
    { x:  16, y: -92, delay: 110, rot: -12 },
    { x:  30, y: -72, delay: 200, rot:  22 },
    { x:  -7, y: -104, delay: 55, rot:  16 },
    { x:   7, y: -104, delay: 150, rot: -16 },
    { x: -22, y: -58, delay: 250, rot:  35 },
    { x:  22, y: -58, delay: 190, rot: -35 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" style={{ zIndex: 100 }}>
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute left-1/2 top-1/2 select-none"
          style={{
            fontSize: '14px',
            lineHeight: 1,
            marginLeft: '-7px',
            marginTop: '-7px',
            ...{
              '--fx': `${p.x}px`,
              '--fy': `${p.y}px`,
              '--fr': `${p.rot}deg`,
            },
            animation: 'fire-particle 1.4s ease-out forwards',
            animationDelay: `${p.delay}ms`,
          } as React.CSSProperties}
        >
          🔥
        </span>
      ))}
    </div>
  );
}

// ── Shared streak card content (used in both popover and full-card modes)
function StreakCard({
  streak,
  showMilestone,
  showBurst,
  onDismissMilestone,
}: {
  streak: number;
  showMilestone: boolean;
  showBurst: boolean;
  onDismissMilestone: () => void;
}) {
  const currentTier = getCurrentTier(streak);
  const nextTier = getNextTier(streak);
  const statusLabel = getStatusLabel(streak);

  // Progress between current and next tier
  const prevTierDays = currentTier?.days ?? 0;
  const tierProgressPct = nextTier
    ? Math.max(Math.round(((streak - prevTierDays) / (nextTier.days - prevTierDays)) * 100), 3)
    : 100;

  return (
    <div className="relative">
      {/* Orange ambient radial light */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: 'radial-gradient(ellipse 90% 55% at 50% 0%, rgba(249,115,22,0.1) 0%, transparent 70%)',
        }}
      />

      <div className="relative p-4">
        {showMilestone && (
          <MilestoneBanner streak={streak} onDismiss={onDismissMilestone} />
        )}

        {/* Top row: number + flame icon */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-5xl font-black leading-none tracking-tight"
                style={streak > 0 ? {
                  background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                } : { color: 'var(--muted-fg)' }}
              >
                {streak}
              </span>
              <span className="text-sm font-bold" style={{ color: streak > 0 ? '#f97316' : 'var(--muted-fg)' }}>
                {streak === 1 ? 'day' : 'days'}
              </span>
            </div>
            <p
              className="mt-0.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'var(--muted-fg)', opacity: 0.7 }}
            >
              Task streak
            </p>
            <p
              className="mt-1 text-xs font-semibold"
              style={{ color: streak > 0 ? '#f97316' : 'var(--muted-fg)' }}
            >
              {statusLabel}
            </p>
          </div>

          {/* Flame icon with burst */}
          <div
            className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: streak > 0
                ? 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(251,191,36,0.08))'
                : 'var(--muted-bg)',
              border: '1px solid rgba(249,115,22,0.18)',
            }}
          >
            <FireBurst active={showBurst} />
            <Flame
              className={`h-9 w-9 ${streak > 0 ? 'animate-flame' : ''}`}
              style={{
                color: getFlameColor(streak),
                filter: getFlameFilter(streak),
              }}
            />
            {currentTier && (
              <span
                className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center bg-white dark:bg-black rounded-full"
                style={{ width: '20px', height: '20px', padding: '2px' }}
              >
                <currentTier.icon style={{ width: '12px', height: '12px', color: currentTier.color }} />
              </span>
            )}
          </div>
        </div>

        {/* Current tier badge */}
        {currentTier && (
          <div className="mb-3">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                background: currentTier.bg,
                border: `1px solid ${currentTier.border}`,
                color: currentTier.color,
                boxShadow: currentTier.glow,
              }}
            >
              <currentTier.icon className="h-3 w-3 shrink-0" /> {currentTier.name} Tier
            </span>
          </div>
        )}

        {/* Progress to next tier */}
        {nextTier && (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[10px]">
              <span style={{ color: 'var(--muted-fg)' }}>
                <nextTier.icon className="inline h-3 w-3 mr-0.5" style={{ color: nextTier.color }} />{nextTier.name} in {nextTier.days - streak} day{(nextTier.days - streak) === 1 ? '' : 's'}
              </span>
              <span className="font-semibold" style={{ color: '#f97316' }}>
                {tierProgressPct}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: 'rgba(249,115,22,0.1)' }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${tierProgressPct}%`,
                  background: 'linear-gradient(90deg, #f97316, #fbbf24)',
                  boxShadow: '0 0 8px rgba(249,115,22,0.5)',
                }}
              />
            </div>
          </div>
        )}

        {/* No streak */}
        {streak === 0 && (
          <p className="text-[11px]" style={{ color: 'var(--muted-fg)' }}>
            Complete a task today to start your streak!
          </p>
        )}

        {/* Diamond achieved — max */}
        {!nextTier && streak > 0 && (
          <div
            className="flex items-center gap-1.5 text-[11px] font-semibold"
            style={{ color: '#818cf8' }}
          >
            <Crown className="h-3.5 w-3.5 shrink-0" />
            Maximum tier reached — Hall of fame!
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main exported component
export function TaskStreak({ tasks, inline }: TaskStreakProps) {
  const streak = useMemo(() => calculateStreak(tasks), [tasks]);
  const [showMilestone, setShowMilestone] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentTier = getCurrentTier(streak);
  const nextTier = getNextTier(streak);
  const statusLabel = getStatusLabel(streak);

  // Detect uncelebrated milestones → trigger burst
  useEffect(() => {
    if (typeof window === 'undefined' || streak === 0) return;
    const lastCelebrated = Number(localStorage.getItem(MILESTONE_KEY) ?? '0');
    const prevMil = [...[7, 14, 30, 100, 365]].reverse().find(m => m <= streak) ?? 0;
    if (prevMil && prevMil > lastCelebrated) {
      setShowMilestone(true);
      setShowBurst(true);
      localStorage.setItem(MILESTONE_KEY, String(prevMil));
      const milTimer = setTimeout(() => setShowMilestone(false), 5000);
      const burstTimer = setTimeout(() => setShowBurst(false), 2200);
      return () => { clearTimeout(milTimer); clearTimeout(burstTimer); };
    }
  }, [streak]);

  // Click-outside to close popover
  useEffect(() => {
    if (!popoverOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [popoverOpen]);

  // ── Inline mode: compact pill + popover
  if (inline) {
    return (
      <div ref={popoverRef} className="relative">
        {/* Premium streak pill */}
        <button
          type="button"
          onClick={() => setPopoverOpen(v => !v)}
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: streak > 0
              ? 'linear-gradient(135deg, rgba(249,115,22,0.12), rgba(251,191,36,0.08))'
              : 'var(--muted-bg)',
            border: streak > 0
              ? '1px solid rgba(249,115,22,0.22)'
              : '1px solid var(--card-border)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Animated flame */}
          <Flame
            className={`h-3.5 w-3.5 shrink-0 ${streak > 0 ? 'animate-flame' : ''}`}
            style={{
              color: getFlameColor(streak),
              filter: streak > 5 ? getFlameFilter(streak) : 'none',
            }}
          />

          {/* Streak count */}
          <span
            className="text-xs font-bold whitespace-nowrap"
            style={{
              color: streak > 0 ? '#ea580c' : 'var(--muted-fg)',
            }}
          >
            {streak} {streak === 1 ? 'Day' : 'Day'} Streak
          </span>

          {/* Status — sm+ */}
          {streak > 0 && (
            <>
              <span className="hidden sm:inline text-xs opacity-30" style={{ color: streak > 0 ? '#f97316' : 'var(--muted-fg)' }}>·</span>
              <span
                className="hidden sm:inline text-xs font-semibold whitespace-nowrap"
                style={{ color: '#f97316' }}
              >
                {statusLabel}
              </span>
            </>
          )}

        </button>

        {/* Premium popover */}
        {popoverOpen && (
          <div
            className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl overflow-hidden"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 0 40px rgba(249,115,22,0.1)',
            }}
          >
            <StreakCard
              streak={streak}
              showMilestone={showMilestone}
              showBurst={showBurst}
              onDismissMilestone={() => setShowMilestone(false)}
            />
          </div>
        )}
      </div>
    );
  }

  // ── Full card mode (non-inline, e.g. standalone use)
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--glass-border)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(249,115,22,0.08)',
      }}
    >
      <StreakCard
        streak={streak}
        showMilestone={showMilestone}
        showBurst={showBurst}
        onDismissMilestone={() => setShowMilestone(false)}
      />
    </div>
  );
}
