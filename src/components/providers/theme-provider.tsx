'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export const THEMES = [
  { id: 'cloud',    label: 'Cloud',    accent: '#6366f1', bg: '#ffffff', dark: false, description: 'Clean & minimal' },
  { id: 'sand',     label: 'Sand',     accent: '#d97706', bg: '#fdf8f0', dark: false, description: 'Warm & cozy' },
  { id: 'mint',     label: 'Mint',     accent: '#10b981', bg: '#f0fdf4', dark: false, description: 'Fresh & calm' },
  { id: 'blossom',  label: 'Blossom',  accent: '#ec4899', bg: '#fdf2f8', dark: false, description: 'Soft & playful' },
  { id: 'midnight', label: 'Midnight', accent: '#6366f1', bg: '#0a0a0f', dark: true,  description: 'Sleek & modern' },
  { id: 'obsidian', label: 'Obsidian', accent: '#8b5cf6', bg: '#0d0d0d', dark: true,  description: 'Deep & dramatic' },
  { id: 'forest',   label: 'Forest',   accent: '#10b981', bg: '#0a0f0a', dark: true,  description: 'Nature-inspired' },
] as const;

export type ThemeId = typeof THEMES[number]['id'];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="cloud"
      themes={THEMES.map(t => t.id)}
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
