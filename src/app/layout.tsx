import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

import ProvidersClient from './providers-client';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'Your personal productivity task manager',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TaskFlow',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ProvidersClient>
          {children}
        </ProvidersClient>
      </body>
    </html>
  );
}
