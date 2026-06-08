import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

import ProvidersClient from './providers-client';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata: Metadata = {
  title: { default: 'TaskFlow', template: '%s · TaskFlow' },
  description: 'Plan tasks, projects, and goals in one quiet workspace. Stay focused and ship faster.',
  manifest: '/manifest.json',
  metadataBase: new URL('https://taskflow.vercel.app'),
  openGraph: {
    type: 'website',
    siteName: 'TaskFlow',
    title: 'TaskFlow — Personal Productivity Workspace',
    description: 'Plan tasks, projects, and goals in one quiet workspace. Stay focused and ship faster.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'TaskFlow',
    description: 'Plan tasks, projects, and goals in one quiet workspace.',
  },
  robots: {
    index: false,
    follow: false,
  },
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
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TaskFlow" />
      </head>
      <body className="font-sans antialiased">
        <ProvidersClient>
          {children}
        </ProvidersClient>
      </body>
    </html>
  );
}
