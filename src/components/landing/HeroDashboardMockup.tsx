/**
 * HeroDashboardMockup
 * Pure JSX/CSS hero background — skeleton placeholder version.
 * No text, no blur. Clean abstract UI shapes for premium SaaS hero.
 */
import type { CSSProperties } from 'react';

// ── Skeleton bar helper ──────────────────────────────────────
function Bar({ w = '100%', h = 8, color = 'rgba(124,58,237,0.12)', radius = 4, style = {} }: {
  w?: string | number; h?: number; color?: string; radius?: number; style?: CSSProperties;
}) {
  return <div style={{ width: w, height: h, borderRadius: radius, background: color, flexShrink: 0, ...style }} />;
}

// ── Skeleton task card ───────────────────────────────────────
function SkeletonTaskCard({ accentColor }: { accentColor: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      border: '1px solid rgba(124,58,237,0.07)',
      borderLeft: `3px solid ${accentColor}`,
      borderRadius: 10, padding: '11px 13px',
      marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {/* Checkbox circle */}
      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(124,58,237,0.18)', flexShrink: 0 }} />
      {/* Content skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Bar w="72%" h={8} color="rgba(31,41,55,0.12)" />
        <div style={{ display: 'flex', gap: 5 }}>
          <Bar w={38} h={6} color={`${accentColor}28`} radius={4} />
          <Bar w={60} h={6} color="rgba(124,58,237,0.1)" radius={4} />
        </div>
      </div>
    </div>
  );
}

// ── Skeleton stat card ───────────────────────────────────────
function SkeletonStatCard({ color }: { color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(124,58,237,0.08)', borderRadius: 10, padding: '10px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <Bar w={24} h={20} color={color} radius={5} />
      <Bar w="70%" h={6} color="rgba(156,163,175,0.4)" />
    </div>
  );
}

const PINK = '#EC4899';
const PUR  = '#7C3AED';

export function HeroDashboardMockup() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* ── Background gradients ─────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0,
        background: [
          'radial-gradient(ellipse 120% 90% at 20% 110%, rgba(236,72,153,0.08) 0%, transparent 65%)',
          'radial-gradient(ellipse 110% 80% at 10% 95%, rgba(124,58,237,0.12) 0%, transparent 60%)',
          'radial-gradient(ellipse 140% 100% at 62% 50%, rgba(245,240,255,0.55) 0%, transparent 80%)',
          'linear-gradient(160deg, #ffffff 0%, #f8f5ff 35%, #fdf0fd 65%, #fafbff 100%)',
        ].join(', '),
      }} />

      {/* ── Dotted grid — top-left ────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: '38%', height: '55%',
        backgroundImage: 'radial-gradient(circle, rgba(124,58,237,0.15) 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px',
        maskImage: 'radial-gradient(ellipse 70% 65% at 0% 0%, black 0%, transparent 75%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 0% 0%, black 0%, transparent 75%)',
      }} />

      {/* ── Bottom-left ambient glow ──────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-8%',
        width: '55%', height: '75%',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(167,139,250,0.2) 0%, rgba(236,72,153,0.09) 45%, transparent 70%)',
        filter: 'blur(48px)',
      }} />

      {/* ── Top-right soft fill ───────────────────────────────── */}
      <div style={{
        position: 'absolute', top: '-20%', right: '-5%',
        width: '40%', height: '65%',
        borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(221,214,254,0.28) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />

      {/* ── Right-edge white vignette ─────────────────────────── */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: '14%',
        background: 'linear-gradient(to left, rgba(250,249,255,0.95) 0%, transparent 100%)',
        zIndex: 8,
      }} />

      {/* ── Bottom-edge vignette ──────────────────────────────── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '22%',
        background: 'linear-gradient(to top, rgba(250,249,255,0.65) 0%, transparent 100%)',
        zIndex: 8,
      }} />

      {/* ── Dashboard scene ───────────────────────────────────── */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '44%',
        transform: 'translateY(-50%) perspective(2800px) rotateY(-10deg) rotateX(3deg)',
        transformOrigin: 'center center',
        filter: [
          'drop-shadow(0 60px 120px rgba(124,58,237,0.30))',
          'drop-shadow(0 30px 60px rgba(0,0,0,0.16))',
          'drop-shadow(0 0 100px rgba(167,139,250,0.20))',
        ].join(' '),
        zIndex: 4,
      }}>
        <div style={{ position: 'relative' }}>

          {/* ── Dashboard shell ─────────────────────────────── */}
          <div style={{
            width: 760,
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 20,
            border: '1px solid rgba(124,58,237,0.10)',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9)',
            display: 'flex', flexDirection: 'column',
          }}>

            {/* Window chrome */}
            <div style={{
              background: 'rgba(250,248,255,0.98)',
              borderBottom: '1px solid rgba(124,58,237,0.07)',
              padding: '10px 16px',
              display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
            }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#ff5f57','#ffbd2e','#28c840'].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />
                ))}
              </div>
              {/* URL bar — with text */}
              <div style={{
                flex: 1, maxWidth: 260, height: 24,
                background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.09)',
                borderRadius: 6, display: 'flex', alignItems: 'center',
                paddingLeft: 10, fontSize: 9, color: '#9ca3af', fontFamily: 'monospace',
                letterSpacing: 0,
              }}>
                https://optimaz.app/dashboard
              </div>
            </div>

            {/* App body */}
            <div style={{ display: 'flex', height: 400 }}>

              {/* Sidebar */}
              <div style={{
                width: 160, flexShrink: 0,
                background: 'rgba(248,246,255,0.95)',
                borderRight: '1px solid rgba(124,58,237,0.07)',
                padding: '16px 12px',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 14, borderBottom: '1px solid rgba(124,58,237,0.07)', marginBottom: 4 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${PUR}, ${PINK})`, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e' }}>Optimaz</span>
                  <span style={{ fontSize: 7, fontWeight: 700, background: `linear-gradient(135deg, ${PUR}, ${PINK})`, color: '#fff', padding: '1px 4px', borderRadius: 3 }}>BETA</span>
                </div>
                {/* Active nav item */}
                <div style={{ background: 'rgba(124,58,237,0.08)', borderRadius: 8, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: PUR, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: PUR }}>Today</span>
                </div>
                {/* Nav items with text */}
                {(['Tasks','Goals','Calendar','Projects','Routines','Settings'] as const).map(label => (
                  <div key={label} style={{ padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(209,213,219,0.8)', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#6b7280' }}>{label}</span>
                  </div>
                ))}
                {/* Section divider */}
                <div style={{ height: 1, background: 'rgba(124,58,237,0.07)', margin: '4px 0' }} />
                {/* Project items — skeleton (dots + bars, no text) */}
                {([PUR, PINK, '#10b981'] as const).map((color, i) => (
                  <div key={i} style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <Bar w={`${52 + i * 8}%`} h={6} color="rgba(107,114,128,0.14)" radius={3} />
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(252,250,255,0.9)', overflow: 'hidden' }}>

                {/* Header */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(124,58,237,0.06)', flexShrink: 0 }}>
                  <Bar w="30%" h={7} color="rgba(156,163,175,0.3)" style={{ marginBottom: 8 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Bar w="38%" h={14} color="rgba(124,58,237,0.2)" radius={5} />
                    {/* Streak pill skeleton */}
                    <div style={{ height: 20, width: 90, borderRadius: 20, background: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.15)' }} />
                  </div>
                </div>

                {/* Two-column body */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                  {/* Left stats panel */}
                  <div style={{ width: 210, flexShrink: 0, padding: '14px', borderRight: '1px solid rgba(124,58,237,0.06)', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
                    <Bar w="40%" h={7} color="rgba(156,163,175,0.3)" />
                    {/* Stats row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <SkeletonStatCard color="#10b98140" />
                      <SkeletonStatCard color="#ef444440" />
                      <SkeletonStatCard color="#f59e0b40" />
                    </div>
                    {/* Chart skeleton */}
                    <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(124,58,237,0.07)', borderRadius: 10, padding: 10 }}>
                      <Bar w="55%" h={6} color="rgba(156,163,175,0.3)" style={{ marginBottom: 10 }} />
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 44 }}>
                        {[14, 9, 22, 7, 15, 20, 40].map((h, i) => (
                          <div key={i} style={{ flex: 1, height: h, borderRadius: '3px 3px 0 0', background: i === 6 ? `linear-gradient(180deg, ${PUR}, rgba(124,58,237,0.6))` : 'rgba(124,58,237,0.14)' }} />
                        ))}
                      </div>
                    </div>
                    {/* Goal mini grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                      {[[PUR,'#ef4444'],['#f59e0b','#10b981']].flat().map((color, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${color}22`, borderRadius: 8, padding: 8 }}>
                          <Bar w="60%" h={6} color={`${color}40`} style={{ marginBottom: 5 }} />
                          <Bar w="35%" h={16} color={`${color}50`} radius={4} />
                        </div>
                      ))}
                    </div>
                    {/* Outcome rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[[PUR],[PINK],['#10b981']].map(([c], i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, paddingBottom: 7, borderBottom: '1px solid rgba(124,58,237,0.05)' }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: c, flexShrink: 0 }} />
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                            <Bar w="75%" h={6} color="rgba(55,65,81,0.15)" />
                            <Bar w="45%" h={5} color="rgba(156,163,175,0.25)" />
                          </div>
                          <Bar w={22} h={8} color={`${c}50`} radius={4} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right task feed */}
                  <div style={{ flex: 1, padding: '14px 16px', overflow: 'hidden' }}>
                    {/* Section header bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <div style={{ width: 2, height: 10, borderRadius: 2, background: `linear-gradient(180deg, ${PINK}, ${PUR})` }} />
                      <Bar w="20%" h={7} color="rgba(239,68,68,0.3)" />
                    </div>
                    <SkeletonTaskCard accentColor="#ef4444" />
                    <SkeletonTaskCard accentColor="#f97316" />
                    <SkeletonTaskCard accentColor="#f59e0b" />
                    {/* Today section */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '12px 0 10px' }}>
                      <div style={{ width: 2, height: 10, borderRadius: 2, background: `linear-gradient(180deg, ${PINK}, ${PUR})` }} />
                      <Bar w="14%" h={7} color="rgba(156,163,175,0.3)" />
                    </div>
                    <SkeletonTaskCard accentColor="#10b981" />
                    <SkeletonTaskCard accentColor="#f59e0b" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Floating analytics panel ──────────────────── */}
          <div style={{
            position: 'absolute',
            right: -110, top: 100,
            width: 200,
            background: 'rgba(255,255,255,0.94)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(124,58,237,0.12)',
            borderRadius: 16,
            boxShadow: '0 20px 50px rgba(124,58,237,0.16), 0 6px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)',
            padding: 14,
            zIndex: 10,
          }}>
            {/* Panel header skeleton */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(124,58,237,0.1)', flexShrink: 0 }} />
              <Bar w="60%" h={9} color="rgba(31,41,55,0.15)" radius={5} />
            </div>

            {/* Progress ring */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <svg width="52" height="52" style={{ flexShrink: 0 }}>
                <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(124,58,237,0.1)" strokeWidth="4" />
                <circle cx="26" cy="26" r="21" fill="none"
                  stroke={`url(#af-grd)`} strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="131.9" strokeDashoffset="48"
                  transform="rotate(-90 26 26)"
                />
                <defs>
                  <linearGradient id="af-grd" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={PUR} />
                    <stop offset="100%" stopColor={PINK} />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <Bar w={40} h={16} color="rgba(31,41,55,0.2)" radius={5} />
                <Bar w={60} h={7} color="rgba(156,163,175,0.3)" />
              </div>
            </div>

            {/* Stat rows */}
            {[
              { bg: 'rgba(16,185,129,0.07)',  color: '#10b981' },
              { bg: 'rgba(239,68,68,0.07)',   color: '#ef4444' },
              { bg: 'rgba(249,115,22,0.07)',  color: '#f97316' },
              { bg: 'rgba(124,58,237,0.06)',  color: PUR },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 9, marginBottom: 5, background: row.bg }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: `${row.color}20`, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Bar w="65%" h={7} color="rgba(107,114,128,0.2)" />
                  <Bar w="45%" h={5} color="rgba(156,163,175,0.2)" />
                </div>
                <Bar w={22} h={10} color={`${row.color}50`} radius={4} />
              </div>
            ))}

            {/* Up next pill */}
            <div style={{ marginTop: 8, background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)', borderRadius: 9, padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: `linear-gradient(135deg, ${PUR}, ${PINK})`, flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Bar w="75%" h={7} color="rgba(55,65,81,0.2)" />
                <Bar w="50%" h={5} color="rgba(156,163,175,0.2)" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
