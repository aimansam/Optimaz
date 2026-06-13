'use client';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ListTodo, Target, FolderOpen, Repeat2,
  Kanban, CalendarDays, TrendingUp, Palette,
} from 'lucide-react';

const PUR  = '#7C3AED';
const PINK = '#EC4899';

// ── Skeleton helpers ────────────────────────────────────────
function Bar({ w = '100%', h = 8, color = 'rgba(124,58,237,0.12)', r = 4, style }: { w?: string | number; h?: number; color?: string; r?: number; style?: CSSProperties }) {
  return <div style={{ width: w, height: h, borderRadius: r, background: color, flexShrink: 0, ...style }} />;
}
function TaskRow({ accent }: { accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid rgba(124,58,237,0.07)', borderLeft: `3px solid ${accent}`, borderRadius: 10, padding: '10px 14px', marginBottom: 8 }}>
      <div style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${accent}40`, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Bar w="65%" h={8} color="rgba(31,41,55,0.12)" />
        <div style={{ display: 'flex', gap: 5 }}>
          <Bar w={36} h={6} color={`${accent}30`} r={4} />
          <Bar w={54} h={6} color="rgba(124,58,237,0.1)" r={4} />
        </div>
      </div>
    </div>
  );
}

// ── Per-feature mockup panels ────────────────────────────────
const MOCKUPS: Record<string, React.ReactNode> = {
  'Smart Task List': (
    <div style={{ width: '100%', height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <Bar w="35%" h={9} color="rgba(124,58,237,0.15)" r={5} />
      <div style={{ height: 8 }} />
      <TaskRow accent="#ef4444" />
      <TaskRow accent="#f97316" />
      <TaskRow accent="#f59e0b" />
      <div style={{ opacity: 0.65 }}><TaskRow accent="#10b981" /></div>
      <div style={{ opacity: 0.45 }}><TaskRow accent="#10b981" /></div>
    </div>
  ),
  'Goals': (
    <div style={{ width: '100%', height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Bar w="30%" h={9} color="rgba(14,165,233,0.2)" r={5} />
      {[['Build in public',72,'#0ea5e9'],['Launch MVP',17,'#7C3AED'],['Run 5K',33,'#10b981']].map(([label, pct, color]) => (
        <div key={label as string} style={{ background: '#fff', border: `1px solid ${color as string}20`, borderRadius: 12, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color as string, flexShrink: 0 }} />
            <Bar w="55%" h={8} color="rgba(31,41,55,0.14)" r={4} />
            <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: color as string }}>{pct}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: `${color as string}18`, overflow: 'hidden' }}>
            <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${color as string}, ${color as string}cc)` }} />
          </div>
        </div>
      ))}
    </div>
  ),
  'Projects': (
    <div style={{ width: '100%', height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Bar w="28%" h={9} color="rgba(139,92,246,0.2)" r={5} />
      <div style={{ height: 4 }} />
      {[['#3b82f6','12 tasks','In progress'],['#EC4899','8 tasks','In progress'],['#10b981','5 tasks','Done']].map(([color, tasks, status]) => (
        <div key={color as string} style={{ background: '#fff', border: `1px solid ${color as string}20`, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color as string}14`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 16, height: 16, borderRadius: 4, background: color as string, opacity: 0.5 }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <Bar w="55%" h={8} color="rgba(31,41,55,0.14)" r={4} />
            <div style={{ display: 'flex', gap: 6 }}>
              <Bar w={48} h={6} color={`${color as string}30`} r={4} />
              <span style={{ fontSize: 10, color: '#9ca3af' }}>{tasks}</span>
            </div>
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: status === 'Done' ? '#10b981' : PUR }}>{status}</span>
        </div>
      ))}
    </div>
  ),
  'Routines': (
    <div style={{ width: '100%', height: '100%', padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Bar w="32%" h={9} color="rgba(245,158,11,0.2)" r={5} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginTop: 4 }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#9ca3af', marginBottom: 5, fontWeight: 600 }}>{d}</div>
            <div style={{ height: 28, borderRadius: 8, background: i < 5 ? `rgba(245,158,11,${0.2 + i * 0.06})` : 'rgba(0,0,0,0.04)' }} />
          </div>
        ))}
      </div>
      {[4,3,3,2,1].map((streak, i) => (
        <div key={i} style={{ background: '#fff', border: '1px solid rgba(245,158,11,0.12)', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Repeat2 className="h-3.5 w-3.5" style={{ color: '#f59e0b' }} />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Bar w={`${45 + i * 10}%`} h={7} color="rgba(31,41,55,0.12)" r={4} />
            <Bar w="30%" h={5} color="rgba(245,158,11,0.2)" r={3} />
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>🔥 {streak}d</span>
        </div>
      ))}
    </div>
  ),
  'Kanban Board': (
    <div style={{ width: '100%', height: '100%', padding: 20, display: 'flex', gap: 10 }}>
      {[['To Do', '#6b7280', ['#ef4444','#f97316','#f59e0b']], ['In Progress', PUR, [PUR,'#0ea5e9']], ['Done', '#10b981', ['#10b981']]].map(([title, color, accents]) => (
        <div key={title as string} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color as string, flexShrink: 0 }} />
            <Bar w="60%" h={8} color={`${color as string}25`} r={4} />
            <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: 6, background: `${color as string}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 9, fontWeight: 700, color: color as string }}>{(accents as string[]).length}</span>
            </div>
          </div>
          {(accents as string[]).map((ac, i) => (
            <div key={i} style={{ background: '#fff', border: `1px solid ${ac}20`, borderLeft: `3px solid ${ac}`, borderRadius: 8, padding: '10px 10px' }}>
              <Bar w={`${60 + i * 12}%`} h={7} color="rgba(31,41,55,0.12)" r={3} />
              <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                <Bar w={32} h={5} color={`${ac}28`} r={3} />
                <Bar w={48} h={5} color="rgba(124,58,237,0.08)" r={3} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  'Calendar View': (
    <div style={{ width: '100%', height: '100%', padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Bar w="28%" h={9} color="rgba(239,68,68,0.2)" r={5} />
        <div style={{ display: 'flex', gap: 6 }}>
          {['Week','Month'].map(v => (
            <div key={v} style={{ fontSize: 9, fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: v === 'Month' ? `rgba(239,68,68,0.12)` : 'rgba(0,0,0,0.04)', color: v === 'Month' ? '#ef4444' : '#9ca3af' }}>{v}</div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 1 }}>
        {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 8, fontWeight: 600, color: '#9ca3af', paddingBottom: 8 }}>{d}</div>
        ))}
        {Array.from({ length: 35 }).map((_, i) => {
          const day = i - 3;
          const hasEvent = [2, 5, 8, 11, 14, 17].includes(day);
          const isToday = day === 13;
          return (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, background: isToday ? `rgba(124,58,237,0.1)` : 'transparent', border: isToday ? `1px solid rgba(124,58,237,0.2)` : '1px solid transparent' }}>
              <span style={{ fontSize: 9, fontWeight: isToday ? 700 : 400, color: isToday ? PUR : day < 1 || day > 30 ? '#d1d5db' : '#374151' }}>
                {day < 1 ? 30 + day : day > 30 ? day - 30 : day}
              </span>
              {hasEvent && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#ef4444' }} />}
            </div>
          );
        })}
      </div>
    </div>
  ),
  'Streaks & Analytics': (
    <div style={{ width: '100%', height: '100%', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Bar w="38%" h={9} color="rgba(249,115,22,0.2)" r={5} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[['🔥 12d', 'Streak', '#f97316'], ['47', 'Done this month', '#10b981'], ['92%', 'Completion rate', PUR]].map(([val, lbl, color]) => (
          <div key={lbl} style={{ background: '#fff', border: `1px solid ${color}18`, borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color: color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 8, color: '#9ca3af', marginTop: 5, fontWeight: 600 }}>{lbl}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#fff', border: '1px solid rgba(249,115,22,0.1)', borderRadius: 12, padding: '14px 16px' }}>
        <Bar w="42%" h={7} color="rgba(249,115,22,0.18)" r={4} style={{ marginBottom: 14 }} />
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 60 }}>
          {[18, 12, 28, 8, 22, 16, 32, 24, 14, 30, 20, 38, 26, 42].map((h, i) => (
            <div key={i} style={{ flex: 1, height: h, borderRadius: '3px 3px 0 0', background: i === 13 ? `linear-gradient(180deg, #f97316, rgba(249,115,22,0.6))` : 'rgba(249,115,22,0.15)' }} />
          ))}
        </div>
      </div>
    </div>
  ),
  'Beautiful Themes': (
    <div style={{ width: '100%', height: '100%', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Bar w="35%" h={9} color="rgba(236,72,153,0.2)" r={5} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {[
          { name: 'Cloud', bg: '#f8f5ff', accent: PUR, border: `2px solid ${PUR}` },
          { name: 'Midnight', bg: '#0f0b1a', accent: PUR, border: '2px solid transparent' },
          { name: 'Blossom', bg: '#fff5f9', accent: PINK, border: '2px solid transparent' },
          { name: 'Mint', bg: '#f0fdf4', accent: '#10b981', border: '2px solid transparent' },
          { name: 'Sand', bg: '#fffbeb', accent: '#f59e0b', border: '2px solid transparent' },
          { name: 'Forest', bg: '#f0fdf4', accent: '#166534', border: '2px solid transparent' },
          { name: 'Obsidian', bg: '#18181b', accent: '#a78bfa', border: '2px solid transparent' },
          { name: 'Ocean', bg: '#eff6ff', accent: '#3b82f6', border: '2px solid transparent' },
        ].map(({ name, bg, accent, border }) => (
          <div key={name} style={{ background: bg, border, borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ width: 18, height: 18, borderRadius: 6, background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }} />
            <Bar w="80%" h={5} color={`${accent}30`} r={3} />
            <Bar w="55%" h={4} color={`${accent}18`} r={3} />
          </div>
        ))}
      </div>
    </div>
  ),
};

const FEATURES = [
  { icon: ListTodo,    title: 'Smart Task List',    desc: 'Capture, prioritize, and complete work without clutter.',    color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
  { icon: Target,      title: 'Goals',              desc: 'Turn long-term ambitions into measurable progress.',          color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
  { icon: FolderOpen,  title: 'Projects',           desc: 'Organize work into focused projects so everything has a place.',color:'#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  { icon: Repeat2,     title: 'Routines',           desc: 'Build habits that stick with recurring tasks.',               color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { icon: Kanban,      title: 'Kanban Board',       desc: 'Visualize work from To Do to Done with drag-and-drop.',       color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  { icon: CalendarDays,title: 'Calendar View',      desc: 'See upcoming deadlines at a glance and plan your week.',      color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  { icon: TrendingUp,  title: 'Streaks & Analytics',desc: 'Track consistency and understand how you work over time.',    color: '#f97316', bg: 'rgba(249,115,22,0.08)' },
  { icon: Palette,     title: 'Beautiful Themes',   desc: 'Choose from seven carefully designed themes for day or night.',color:'#ec4899', bg: 'rgba(236,72,153,0.08)' },
];

const C = {
  fg: '#0f0b1a',
  muted: '#6b7280',
  cardBg: '#ffffff',
  cardBorder: '#e5e7eb',
};

export function FeaturesSection() {
  const [active, setActive] = useState(0);
  const feat = FEATURES[active];

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
      {/* ── Left: feature list ── */}
      <div className="flex flex-col gap-1 lg:w-[42%] lg:shrink-0">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          const isActive = i === active;
          return (
            <button
              key={f.title}
              type="button"
              onClick={() => setActive(i)}
              className="flex items-start gap-4 rounded-2xl px-4 py-4 text-left transition-all duration-200"
              style={{
                background: isActive ? f.bg : 'transparent',
                border: `1px solid ${isActive ? f.color + '30' : 'transparent'}`,
                boxShadow: isActive ? `0 2px 12px ${f.color}14` : 'none',
              }}
            >
              <div
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: isActive ? f.bg : 'rgba(0,0,0,0.04)' }}
              >
                <Icon className="h-5 w-5" style={{ color: isActive ? f.color : '#9ca3af' }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold" style={{ color: isActive ? f.color : C.fg }}>{f.title}</h3>
                <p className="mt-0.5 text-xs leading-5" style={{ color: C.muted }}>{f.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Right: mockup card ── */}
      <div className="flex-1 lg:sticky lg:top-24">
        <div
          className="overflow-hidden rounded-2xl"
          style={{
            background: C.cardBg,
            border: `1px solid ${feat.color}20`,
            boxShadow: `0 4px 32px ${feat.color}18, 0 1px 3px rgba(0,0,0,0.06)`,
            minHeight: 380,
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Card chrome */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: `1px solid ${feat.color}12`, background: `${feat.bg}` }}
          >
            <div className="flex gap-1.5">
              {['#ff5f57','#ffbd2e','#28c840'].map(c => (
                <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div
              className="flex items-center gap-2 rounded-md px-3 py-1"
              style={{ background: `${feat.color}08`, border: `1px solid ${feat.color}15` }}
            >
              <feat.icon className="h-3 w-3" style={{ color: feat.color }} />
              <span className="text-[10px] font-semibold" style={{ color: feat.color }}>{feat.title}</span>
            </div>
          </div>
          {/* Content */}
          <div style={{ minHeight: 340 }}>
            {MOCKUPS[feat.title]}
          </div>
        </div>
      </div>
    </div>
  );
}
