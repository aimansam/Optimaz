'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(isDark ? 'light' : 'dark')} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </Button>
  );
}
