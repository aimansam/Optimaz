'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Keyboard accessibility: ESC closes dialog
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll while dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="dialog-overlay fixed inset-0 z-[9999] flex items-end justify-center sm:items-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={cn(
          'dialog-panel relative flex w-full flex-col',
          // Mobile: bottom-sheet — full width, rounded top corners, slides from bottom
          'rounded-t-2xl sm:rounded-2xl',
          // Mobile: up to 92dvh; desktop: centered with max-w
          'max-h-[92dvh] sm:max-w-3xl',
          className
        )}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2), 0 0 0 1px var(--glass-border), 0 0 40px var(--glow)',
        }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex shrink-0 justify-center pt-3 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--muted-fg)', opacity: 0.3 }} />
        </div>

        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between rounded-t-2xl px-4 py-3 sm:px-6 sm:py-4"
          style={{
            background: 'var(--muted-bg)',
            borderBottom: '1px solid var(--card-border)',
          }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            {title}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 sm:h-7 sm:w-7 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
