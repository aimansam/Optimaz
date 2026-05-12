"use client";
import { useEffect, useState } from 'react';
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
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
        padding: '12px 20px',
        background: '#6366f1',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontWeight: 600,
        fontSize: 16,
        cursor: 'pointer',
      }}
      onClick={handleInstall}
    >
      Install App
    </button>
  );
}
