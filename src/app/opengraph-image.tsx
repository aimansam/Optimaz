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
          background: '#07071a',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* ── Background glow blobs ── */}
        <div style={{
          position: 'absolute', top: -160, left: -120,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: -200, right: -120,
          width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.18) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', top: 100, right: 200,
          width: 380, height: 380, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
        }} />

        {/* ── Dotted grid pattern — top right ── */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: '45%', height: '55%',
          backgroundImage: 'radial-gradient(circle, rgba(124,58,237,0.2) 1.5px, transparent 1.5px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 70% 65% at 100% 0%, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 65% at 100% 0%, black 0%, transparent 75%)',
        }} />

        {/* ── Content wrapper ── */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 80px',
          height: '100%',
          position: 'relative',
          zIndex: 10,
        }}>

          {/* ── Logo + wordmark ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://optimaz.app/icon-192x192.png"
              width={56}
              height={56}
              style={{ borderRadius: 14, boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
              alt="Optimaz"
            />
            <span style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
              Optimaz
            </span>
            <div style={{
              marginLeft: 4,
              padding: '3px 10px',
              borderRadius: 6,
              background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
              fontSize: 12,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '0.08em',
            }}>
              BETA
            </div>
          </div>

          {/* ── Main headline ── */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 52,
            gap: 0,
          }}>
            <div style={{
              fontSize: 86,
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 0.9,
              letterSpacing: '-4px',
              textTransform: 'uppercase',
            }}>
              RECLAIM YOUR
            </div>
            <div style={{
              fontSize: 86,
              fontWeight: 900,
              lineHeight: 0.9,
              letterSpacing: '-4px',
              textTransform: 'uppercase',
              background: 'linear-gradient(135deg, #7C3AED 0%, #a78bfa 50%, #EC4899 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginTop: 6,
            }}>
              FOCUS.
            </div>
            <div style={{
              fontSize: 86,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.18)',
              lineHeight: 0.9,
              letterSpacing: '-4px',
              textTransform: 'uppercase',
              marginTop: 6,
            }}>
              OPTIMIZE.
            </div>
          </div>

          {/* ── Tagline ── */}
          <div style={{
            marginTop: 36,
            fontSize: 22,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 580,
            lineHeight: 1.5,
          }}>
            One workspace for tasks, goals, projects &amp; routines. Built for people who ship.
          </div>

          {/* ── Feature pills + URL — bottom row ── */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 'auto',
          }}>
            {/* Feature pills */}
            <div style={{ display: 'flex', gap: 10 }}>
              {['Tasks', 'Goals', 'Projects', 'Kanban', 'Routines'].map((label, i) => (
                <div key={label} style={{
                  padding: '8px 18px',
                  borderRadius: 100,
                  border: `1px solid rgba(${i % 2 === 0 ? '124,58,237' : '236,72,153'},0.3)`,
                  background: `rgba(${i % 2 === 0 ? '124,58,237' : '236,72,153'},0.08)`,
                  color: 'rgba(255,255,255,0.65)',
                  fontSize: 15,
                  fontWeight: 500,
                }}>
                  {label}
                </div>
              ))}
            </div>

            {/* URL */}
            <div style={{
              padding: '10px 22px',
              borderRadius: 100,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 18,
              letterSpacing: '0.04em',
            }}>
              optimaz.app
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
