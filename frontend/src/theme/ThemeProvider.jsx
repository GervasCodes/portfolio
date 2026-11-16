import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { watchRuntimeFlags } from './runtimeFlags';

/**
 * Theme: dark by default, follows the system until the visitor chooses, and
 * remembers the choice in localStorage ("light" | "dark"; absent = system).
 * The first paint is handled by the inline script in index.html, so there is
 * no flash; this provider only keeps React state, the <html> attribute, the
 * theme-color meta and storage in sync afterwards.
 */
const STORAGE_KEY = 'theme';
const META_COLOR = { dark: '#0B0B0F', light: '#F6F3EC' }; // mirrors --bg in tokens.css

const ThemeContext = createContext(null);

const systemTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

function readPreference() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(resolved) {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[resolved]);
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(readPreference);
  const [systemValue, setSystemValue] = useState(systemTheme);
  const theme = preference === 'system' ? systemValue : preference;

  useEffect(watchRuntimeFlags, []);

  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: light)');
    if (!mq) return undefined;
    const onChange = () => setSystemValue(mq.matches ? 'light' : 'dark');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => { applyTheme(theme); }, [theme]);

  const setTheme = useCallback((next) => {
    const root = document.documentElement;
    // Brief colour cross-fade; removed again so normal hovers stay snappy.
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 350);
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch { /* private mode: the choice just won't be remembered */ }
    setPreference(next);
  }, []);

  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

  const value = useMemo(
    () => ({ theme, preference, setTheme, toggle }),
    [theme, preference, setTheme, toggle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
