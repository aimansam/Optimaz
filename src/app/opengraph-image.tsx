import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Optimaz — Reclaim your focus. Optimize your day.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#07071a',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Large centered top glow (violet) ── */}
        <div style={{
          position: 'absolute', top: -220, left: '50%',
          transform: 'translateX(-50%)',
          width: 900, height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.35) 0%, transparent 65%)',
        }} />

        {/* ── Bottom glow (pink) ── */}
        <div style={{
          position: 'absolute', bottom: -200, left: '50%',
          transform: 'translateX(-50%)',
          width: 800, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(236,72,153,0.2) 0%, transparent 65%)',
        }} />

        {/* ── Left-side soft light ── */}
        <div style={{
          position: 'absolute', top: '20%', left: -150,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        }} />

        {/* ── Right-side soft light ── */}
        <div style={{
          position: 'absolute', top: '20%', right: -150,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        }} />

        {/* ── Subtle horizontal line divider (top area) ── */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.4) 30%, rgba(236,72,153,0.4) 70%, transparent 100%)',
        }} />

        {/* ── Bottom line ── */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(124,58,237,0.3) 30%, rgba(236,72,153,0.3) 70%, transparent 100%)',
        }} />

        {/* ── Main content — fully centered ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
          gap: 0,
        }}>

          {/* Logo + wordmark */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 44 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://optimaz.app/icon-192x192.png"
              width={52}
              height={52}
              style={{
                borderRadius: 13,
                boxShadow: '0 0 20px rgba(124,58,237,0.5), 0 0 40px rgba(124,58,237,0.2)',
              }}
              alt="Optimaz"
            />
            <span style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.9)',
              letterSpacing: '-0.3px',
            }}>
              Optimaz
            </span>
            <div style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid rgba(124,58,237,0.4)',
              background: 'rgba(124,58,237,0.15)',
              fontSize: 11,
              fontWeight: 700,
              color: '#a78bfa',
              letterSpacing: '0.1em',
            }}>
              BETA
            </div>
          </div>

          {/* Main headline */}
          <div style={{
            fontSize: 80,
            fontWeight: 900,
            color: '#ffffff',
            lineHeight: 1,
            letterSpacing: '-3.5px',
            textTransform: 'uppercase',
          }}>
            RECLAIM YOUR FOCUS.
          </div>
          <div style={{
            fontSize: 80,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-3.5px',
            textTransform: 'uppercase',
            background: 'linear-gradient(135deg, #7C3AED 0%, #a78bfa 40%, #EC4899 80%, #f472b6 100%)',
            backgroundClip: 'text',
            color: 'transparent',
            marginTop: 6,
          }}>
            OPTIMIZE YOUR DAY.
          </div>

          {/* Divider line */}
          <div style={{
            width: 80,
            height: 2,
            borderRadius: 2,
            background: 'linear-gradient(90deg, #7C3AED, #EC4899)',
            marginTop: 32,
            marginBottom: 28,
          }} />

          {/* Tagline */}
          <div style={{
            fontSize: 22,
            color: 'rgba(255,255,255,0.5)',
            letterSpacing: '0.01em',
            lineHeight: 1.5,
            maxWidth: 680,
          }}>
            One workspace for tasks, goals, projects, kanban &amp; routines.
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: 10, marginTop: 36 }}>
            {[
              { label: 'Tasks', accent: '124,58,237' },
              { label: 'Goals', accent: '14,165,233' },
              { label: 'Projects', accent: '139,92,246' },
              { label: 'Kanban', accent: '16,185,129' },
              { label: 'Routines', accent: '245,158,11' },
              { label: 'Calendar', accent: '236,72,153' },
            ].map(({ label, accent }) => (
              <div key={label} style={{
                padding: '7px 16px',
                borderRadius: 100,
                border: `1px solid rgba(${accent},0.28)`,
                background: `rgba(${accent},0.08)`,
                color: `rgba(${accent},1)`,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}>
                {label}
              </div>
            ))}
          </div>

          {/* URL */}
          <div style={{
            marginTop: 36,
            fontSize: 16,
            color: 'rgba(255,255,255,0.25)',
            letterSpacing: '0.08em',
          }}>
            optimaz.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
