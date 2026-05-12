'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from './button';
import { Dialog } from './dialog';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  pending?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}


export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  pending = false,
  onConfirm,
  onClose,
}: ConfirmationDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title} className="max-w-md min-h-0">
      <div className="space-y-5">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500 dark:bg-red-950/30 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={pending}>
            {pending ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}