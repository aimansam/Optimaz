"use client";
import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';

// Define the correct type for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; }>;
}

export default function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    void trackEvent(outcome === 'accepted' ? 'pwa_install_accepted' : 'pwa_install_dismissed');
    if (outcome === 'accepted') setShow(false);
  };

  if (!show) return null;

  return (
    <button
      onClick={handleInstall}
      style={{
        position: 'fixed',
        bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))',
        left: '1.5rem',
        zIndex: 1000,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.625rem 1rem',
        background: 'var(--card-bg)',
        color: 'var(--foreground)',
        border: '1px solid var(--card-border)',
        borderRadius: '0.875rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        fontWeight: 600,
        fontSize: 13,
        cursor: 'pointer',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 24px rgba(0,0,0,0.16)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.transform = '';
        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 24,
          height: 24,
          borderRadius: 8,
          background: 'linear-gradient(135deg, rgb(var(--accent)), rgb(var(--accent) / 0.8))',
          color: '#fff',
          flexShrink: 0,
        }}
      >
        <Download style={{ width: 12, height: 12 }} />
      </span>
      Install App
    </button>
  );
}
