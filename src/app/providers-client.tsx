"use client";


import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { ServiceWorkerRegistrar } from '@/components/service-worker-registrar';
import ToastProvider from './toast-provider';

export default function ProvidersClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <ToastProvider>
          <ServiceWorkerRegistrar />
          {children}
        </ToastProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
