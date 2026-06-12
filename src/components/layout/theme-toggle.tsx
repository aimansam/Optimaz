'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useTheme } from 'next-themes';
import { Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { THEMES } from '@/components/providers/theme-provider';

function subscribeToHydration() {
  return () => {};
}
function getClientSnapshot() { return true; }
function getServerSnapshot() { return false; }

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const hydrated = useSyncExternalStore(subscribeToHydration, getClientSnapshot, getServerSnapshot);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  if (!hydrated) {
    return (
      <Button variant="ghost" size="icon" disabled aria-label="Theme" title="Theme">
        <Palette className="h-4 w-4" />
      </Button>
    );
  }

  const lightThemes = THEMES.filter(t => !t.dark);
  const darkThemes = THEMES.filter(t => t.dark);

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(v => !v)}
        aria-label="Choose theme"
        title="Choose theme"
        aria-expanded={open}
      >
        <Palette className="h-4 w-4" />
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 w-52 rounded-xl border p-3 shadow-lg"
          style={{
            background: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
            color: 'var(--foreground)',
          }}
        >
          {/* Light themes */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>
            Light
          </p>
          <div className="mb-3 grid grid-cols-4 gap-1.5">
            {lightThemes.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                title={t.label}
                className="group relative flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all hover:scale-105 focus:outline-none"
                style={theme === t.id ? {
                  background: 'rgb(var(--accent) / 0.12)',
                  outline: `2px solid rgb(var(--accent))`,
                  outlineOffset: '0px',
                } : {}}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm"
                  style={{
                    backgroundColor: t.bg,
                    borderColor: t.accent,
                  }}
                >
                  {theme === t.id && (
                    <Check className="h-3 w-3" style={{ color: t.accent }} strokeWidth={3} />
                  )}
                  {theme !== t.id && (
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: t.accent }}
                    />
                  )}
                </span>
                <span className="text-[9px] font-medium leading-none" style={{ color: 'var(--muted-fg)' }}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          {/* Dark themes */}
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-fg)' }}>
            Dark
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {darkThemes.map(t => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setOpen(false); }}
                title={t.label}
                className="group relative flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all hover:scale-105 focus:outline-none"
                style={theme === t.id ? {
                  background: 'rgb(var(--accent) / 0.12)',
                  outline: `2px solid rgb(var(--accent))`,
                  outlineOffset: '0px',
                } : {}}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm"
                  style={{
                    backgroundColor: t.bg,
                    borderColor: t.accent,
                  }}
                >
                  {theme === t.id && (
                    <Check className="h-3 w-3" style={{ color: t.accent }} strokeWidth={3} />
                  )}
                  {theme !== t.id && (
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: t.accent }}
                    />
                  )}
                </span>
                <span className="text-[9px] font-medium leading-none" style={{ color: 'var(--muted-fg)' }}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
