import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/theme/ThemeProvider';

/** Sun/moon button. Announces the action ("Switch to light theme") and the current state. */
export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const next = theme === 'dark' ? 'light' : 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={`inline-flex items-center justify-center w-11 h-11 rounded-full border border-line text-muted hover:text-ink hover:border-control transition-colors duration-fast ${className}`}
    >
      {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
