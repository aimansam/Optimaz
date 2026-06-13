/**
 * HeroDashboardMockup
 * Pure JSX/CSS hero background — no image file needed.
 * Renders as an absolute full-bleed layer behind the hero copy.
 */

const PINK  = '#EC4899';
const PUR   = '#7C3AED';

// ── Tiny helpers ───────────────────────────────────────────────
function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '9px 10px', borderRadius: 8,
      fontSize: 12, fontWeight: active ? 600 : 500,
      color: active ? PUR : '#6b7280',
      background: active ? 'rgba(124,58,237,0.08)' : 'transparent',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: active ? PUR : '#d1d5db' }} />
      {label}
    </div>
  );
}

function TaskCard({ title, priority, badge, done }: { title: string; priority: 'urgent' | 'high' | 'medium' | 'done'; badge: string; done?: boolean }) {
  const leftColor = { urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', done: '#10b981' }[priority];
  return (
    <div style={{
      background: 'rgba(255,255,255,0.95)',
      border: '1px solid rgba(124,58,237,0.08)',
      borderLeft: `3px solid ${leftColor}`,
      borderRadius: 10, padding: '10px 12px',
      marginBottom: 7, display: 'flex', alignItems: 'center', gap: 10,
      opacity: done ? 0.65 : 1,
    }}>
      <div style={{
        width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
        background: done ? '#10b981' : 'transparent',
        border: `2px solid ${done ? '#10b981' : 'rgba(124,58,237,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {done && <span style={{ color: '#fff', fontSize: 8, fontWeight: 900, lineHeight: 1 }}>✓</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: done ? '#9ca3af' : '#1f2937', textDecoration: done ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 8, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: `${leftColor}18`, color: leftColor }}>{priority === 'done' ? 'done' : priority}</span>
          <span style={{ fontSize: 8, fontWeight: 500, padding: '1px 6px', borderRadius: 4, background: 'rgba(124,58,237,0.07)', color: PUR, border: '1px solid rgba(124,58,237,0.12)' }}>{badge}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ num, label, color }: { num: string; label: string; color: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(124,58,237,0.08)', borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1 }}>{num}</div>
      <div style={{ fontSize: 8, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>{label}</div>
    </div>
  );
}

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
        backgroundImage: 'radial-gradient(circle, rgba(124,58,237,0.16) 1.2px, transparent 1.2px)',
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
          'drop-shadow(0 60px 120px rgba(124,58,237,0.32))',
          'drop-shadow(0 30px 60px rgba(0,0,0,0.18))',
          'drop-shadow(0 0 100px rgba(167,139,250,0.22))',
        ].join(' '),
        zIndex: 4,
      }}>
        <div style={{ position: 'relative' }}>

          {/* ── Dashboard shell ─────────────────────────────── */}
          <div style={{
            width: 760,
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 20,
            border: '1px solid rgba(124,58,237,0.11)',
            overflow: 'hidden',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), 0 0 0 1px rgba(124,58,237,0.05)',
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
              <div style={{
                flex: 1, maxWidth: 240,
                background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.09)',
                borderRadius: 6, padding: '5px 10px', fontSize: 10, color: '#9ca3af',
              }}>
                app.optimaz.co/dashboard
              </div>
            </div>

            {/* App body — blurred for depth-of-field */}
            <div style={{ display: 'flex', height: 400, filter: 'blur(1.2px)', position: 'relative' }}>

              {/* Depth fade overlay */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
                background: 'linear-gradient(to top, rgba(255,255,255,0.5) 0%, transparent 100%)',
                pointerEvents: 'none', zIndex: 5,
              }} />

              {/* Sidebar */}
              <div style={{
                width: 160, flexShrink: 0,
                background: 'rgba(248,246,255,0.95)',
                borderRight: '1px solid rgba(124,58,237,0.07)',
                padding: '16px 10px',
                display: 'flex', flexDirection: 'column', gap: 3,
              }}>
                {/* Brand */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 8px 14px', borderBottom: '1px solid rgba(124,58,237,0.07)', marginBottom: 10 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `linear-gradient(135deg, ${PUR}, ${PINK})`, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1a1a2e' }}>Optimaz</span>
                  <span style={{ fontSize: 7, fontWeight: 700, background: `linear-gradient(135deg, ${PUR}, ${PINK})`, color: '#fff', padding: '1px 5px', borderRadius: 3 }}>BETA</span>
                </div>
                <NavItem label="Today" active />
                <NavItem label="Tasks" />
                <NavItem label="Goals" />
                <NavItem label="Calendar" />
                <NavItem label="Projects" />
                <NavItem label="Routines" />
                <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', padding: '10px 10px 4px', textTransform: 'uppercase' }}>Projects</div>
                {[['#3b82f6','Web App Redesign'],['#EC4899','Marketing Q3'],['#10b981','Personal Finance']].map(([color, name]) => (
                  <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', fontSize: 10, color: '#6b7280' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    {name}
                  </div>
                ))}
              </div>

              {/* Main area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(252,250,255,0.9)', overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(124,58,237,0.06)', flexShrink: 0 }}>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>Sunday · June 14, 2026</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, background: `linear-gradient(135deg, #1a1a2e 0%, ${PUR} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      Good morning, Aiman
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.18)', borderRadius: 20, padding: '2px 8px', fontSize: 8, fontWeight: 600, color: PINK }}>
                      🔥 5 Day Streak
                    </div>
                  </div>
                </div>

                {/* Two-column body */}
                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                  {/* Left stats */}
                  <div style={{ width: 210, flexShrink: 0, padding: '12px 14px', borderRight: '1px solid rgba(124,58,237,0.06)', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>This Week</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                      <StatCard num="6" label="Done" color="#10b981" />
                      <StatCard num="5" label="Overdue" color="#ef4444" />
                      <StatCard num="8" label="Soon" color="#f59e0b" />
                    </div>
                    {/* Mini chart */}
                    <div style={{ background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(124,58,237,0.07)', borderRadius: 10, padding: 10 }}>
                      <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>Completions · 7 Days</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
                        {[12, 8, 20, 6, 14, 18, 38].map((h, i) => (
                          <div key={i} style={{ flex: 1, height: h, borderRadius: '3px 3px 0 0', background: i === 6 ? `linear-gradient(180deg, ${PUR}, rgba(124,58,237,0.7))` : 'rgba(124,58,237,0.15)' }} />
                        ))}
                      </div>
                    </div>
                    {/* Goal mini cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                      {[['Active','6',PUR],['At Risk','0','#ef4444'],['Urgent','4','#f59e0b'],['Done','2','#10b981']].map(([lbl, num, color]) => (
                        <div key={lbl} style={{ background: 'rgba(255,255,255,0.9)', border: `1px solid ${color}20`, borderRadius: 8, padding: '8px 8px' }}>
                          <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color }}>{lbl}</div>
                          <div style={{ fontSize: 16, fontWeight: 900, color, lineHeight: 1, marginTop: 2 }}>{num}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right task list */}
                  <div style={{ flex: 1, padding: '12px 16px', overflow: 'hidden' }}>
                    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', color: '#ef4444', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 2, height: 10, borderRadius: 2, background: `linear-gradient(180deg, ${PINK}, ${PUR})`, display: 'inline-block' }} />
                      Overdue (5)
                    </div>
                    <TaskCard title="Set up Google Analytics 4" priority="high" badge="Marketing Q3" />
                    <TaskCard title="Fix auth redirect bug on mobile" priority="urgent" badge="Web App Redesign" />
                    <TaskCard title="Write LinkedIn post — product update" priority="medium" badge="Marketing Q3" />
                    <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.08em', color: '#9ca3af', textTransform: 'uppercase', margin: '10px 0 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 2, height: 10, borderRadius: 2, background: `linear-gradient(180deg, ${PINK}, ${PUR})`, display: 'inline-block' }} />
                      Today
                    </div>
                    <TaskCard title="Design onboarding email sequence" priority="done" badge="Marketing Q3" done />
                    <TaskCard title="Update app store screenshots" priority="medium" badge="Web App Redesign" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Floating analytics panel ──────────────────── */}
          <div style={{
            position: 'absolute',
            right: -110, top: 110,
            width: 200,
            background: 'rgba(255,255,255,0.93)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(124,58,237,0.13)',
            borderRadius: 16,
            boxShadow: '0 20px 50px rgba(124,58,237,0.18), 0 6px 20px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,0.9)',
            padding: 14,
            zIndex: 10,
            filter: 'blur(0.5px)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: `rgba(124,58,237,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>📊</div>
              <span style={{ fontSize: 10, fontWeight: 700, color: '#1f2937' }}>Today&apos;s Progress</span>
            </div>
            {/* Ring area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <svg width="52" height="52" style={{ flexShrink: 0 }}>
                <circle cx="26" cy="26" r="21" fill="none" stroke="rgba(124,58,237,0.1)" strokeWidth="4" />
                <circle cx="26" cy="26" r="21" fill="none"
                  stroke={`url(#grd)`} strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="131.9" strokeDashoffset="48"
                  transform="rotate(-90 26 26)"
                />
                <defs>
                  <linearGradient id="grd" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={PUR} />
                    <stop offset="100%" stopColor={PINK} />
                  </linearGradient>
                </defs>
                <text x="26" y="27" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fontWeight: 800, fill: '#1f2937' }}>63%</text>
              </svg>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#1f2937' }}>63%</div>
                <div style={{ fontSize: 8, color: '#9ca3af', marginTop: 1 }}>5 tasks overdue</div>
              </div>
            </div>
            {/* Stat rows */}
            {[
              { label: 'Done today', val: '5/8', sub: '3 remaining', bg: 'rgba(16,185,129,0.07)', color: '#10b981' },
              { label: 'Overdue',    val: '5',   sub: 'Need attention', bg: 'rgba(239,68,68,0.07)',  color: '#ef4444' },
              { label: 'Streak',     val: '5d',  sub: 'Keep it going!', bg: 'rgba(249,115,22,0.07)', color: '#f97316' },
              { label: 'Active goals', val: '6', sub: 'In progress',    bg: 'rgba(124,58,237,0.06)', color: PUR },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 8px', borderRadius: 9, marginBottom: 4, background: row.bg }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, color: '#6b7280' }}>{row.label}</div>
                  <div style={{ fontSize: 7, color: '#9ca3af' }}>{row.sub}</div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: row.color }}>{row.val}</div>
              </div>
            ))}
            {/* Up next */}
            <div style={{ marginTop: 6, background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.1)', borderRadius: 9, padding: '7px 8px', display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 18, height: 18, borderRadius: 5, background: `linear-gradient(135deg, ${PUR}, ${PINK})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 8, color: '#fff' }}>→</div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 600, color: '#374151' }}>Fix auth redirect bug</div>
                <div style={{ fontSize: 7, color: '#9ca3af' }}>Urgent · Jun 10</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
