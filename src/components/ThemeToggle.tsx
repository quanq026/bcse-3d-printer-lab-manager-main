import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';
import { getUiText } from '../lib/uiText';

interface ThemeToggleProps {
  expanded?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ expanded = false }) => {
  const { lang } = useLang();
  const copy = getUiText(lang);
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('lab_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('lab_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('lab_theme', 'light');
    }
  }, [isDark]);

  if (expanded) {
    return (
      <button
        onClick={() => setIsDark(!isDark)}
        className="app-panel-soft flex h-full w-full min-w-0 items-center gap-3 px-4 py-3 text-left"
        aria-label={copy.shared.themeToggle}
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[rgba(30,23,19,0.08)] bg-white/60 text-slate-900 dark:border-white/8 dark:bg-white/6 dark:text-[var(--landing-text)]">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </div>
        <div className="min-w-0">
          <p className="app-overline">{copy.shared.themeLabel}</p>
          <p className="truncate text-sm font-semibold text-slate-900 dark:text-[var(--landing-text)]">
            {isDark ? copy.shared.themeDark : copy.shared.themeLight}
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="app-icon-button inline-flex h-11 w-11 items-center justify-center"
      aria-label={copy.shared.themeToggle}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
