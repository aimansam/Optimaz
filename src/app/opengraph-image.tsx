import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Optimaz — Personal Productivity Workspace';
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
          background: '#0a0a0f',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient blobs */}
        <div
          style={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
          }}
        />

        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            ✦
          </div>
          <span style={{ fontSize: 40, fontWeight: 700, color: '#ffffff', letterSpacing: '-1px' }}>
            Optimaz
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.15,
            maxWidth: 900,
            letterSpacing: '-2px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          Your quiet workspace for
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.15,
            letterSpacing: '-2px',
            background: 'linear-gradient(90deg, #818cf8, #a78bfa)',
            backgroundClip: 'text',
            color: 'transparent',
            marginTop: 4,
          }}
        >
          tasks, projects &amp; goals
        </div>

        {/* Subheading */}
        <div
          style={{
            fontSize: 22,
            color: '#94a3b8',
            marginTop: 24,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          Less noise, more done. Free during beta.
        </div>

        {/* URL pill */}
        <div
          style={{
            marginTop: 40,
            padding: '10px 24px',
            borderRadius: 100,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            color: '#64748b',
            fontSize: 18,
            letterSpacing: 1,
          }}
        >
          optimaz.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
