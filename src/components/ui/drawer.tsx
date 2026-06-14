'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  width?: string;
}

export function Drawer({ open, onClose, title, children, className, width = 'max-w-md' }: DrawerProps) {
  // Escape key to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="dialog-overlay fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(3px)' }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'drawer-panel fixed right-0 top-0 z-[60] flex h-full w-full flex-col',
          width,
          className
        )}
        style={{
          background: 'var(--card-bg)',
          borderLeft: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.15), 0 0 60px var(--glow)',
        }}
      >
        {/* Header */}
        {title && (
          <div
            className="flex shrink-0 items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid var(--card-border)' }}
          >
            <h2
              className="text-base font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-150"
              style={{ color: 'var(--muted-fg)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgb(var(--accent) / 0.1)';
                (e.currentTarget as HTMLButtonElement).style.color = 'rgb(var(--accent))';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted-fg)';
              }}
              aria-label="Close drawer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </>
  );
}
