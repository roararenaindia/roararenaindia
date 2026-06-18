'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from '@/components/ui/icon-set';
import { motion } from 'framer-motion';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg bg-surface-elevated hover:bg-surface border border-border transition-colors"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? (
        <Sun size={18} className="text-primary" />
      ) : (
        <Moon size={18} className="text-primary" />
      )}
    </motion.button>
  );
}
