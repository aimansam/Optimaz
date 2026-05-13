'use client';

import { useEffect, useRef } from 'react';
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

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-9999 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        className={cn(
          'relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-2xl border border-slate-200/80 bg-white shadow-2xl shadow-black/20 dark:border-slate-700/60 dark:bg-slate-900 dark:shadow-black/60 sm:min-h-100 sm:max-h-[95vh] sm:rounded-2xl',
          className
        )}
      >
        <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-100 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/40 sm:px-6 sm:py-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7 rounded-lg">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:py-5">{children}</div>
      </div>
    </div>
  );
}

