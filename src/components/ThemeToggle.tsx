/**
 * ThemeToggle
 * Cycles through light → dark → system modes.
 * When the user is logged in, the preference is saved to the server so it
 * persists across sessions and devices.
 * No localStorage — privacy-safe.
 */
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeMode } from '@/lib/theme-context';
import { useAdminTheme } from '@/lib/admin-theme-context';

type Pref = ThemeMode;

interface ThemeToggleProps {
  className?: string;
  /** If true, shows a full labelled button row (for settings pages) */
  expanded?: boolean;
}

export default function ThemeToggle({ className = '', expanded = false }: ThemeToggleProps) {
  const publicTheme = useTheme();
  const adminTheme = useAdminTheme();
  const isAdminRoute = typeof window !== 'undefined' &&
    (window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/'));
  const { theme: pref, resolvedTheme, setTheme } = isAdminRoute ? adminTheme : publicTheme;

  const cycle = () => {
    const order: Pref[] = ['light', 'dark', 'system'];
    const next = order[(order.indexOf(pref) + 1) % order.length];
    setTheme(next);
  };

  const icons: Record<Pref, React.ReactNode> = {
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
    system: <Monitor className="w-4 h-4" />,
  };

  const labels: Record<Pref, string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  };

  const isDark = resolvedTheme === 'dark';

  if (expanded) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {(['light', 'dark', 'system'] as Pref[]).map(p => (
          <button
            key={p}
            type="button"
            onClick={() => setTheme(p)}
            aria-label={`Switch to ${labels[p]} mode`}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${pref === p
                ? 'bg-primary text-primary-foreground shadow-sm'
                : isDark
                  ? 'bg-white/10 hover:bg-white/15 text-muted-foreground border border-white/10'
                  : 'bg-slate-100 hover:bg-slate-200 text-muted-foreground border border-slate-200'
              }
            `}
          >
            {icons[p]}
            <span>{labels[p]}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Appearance: ${labels[pref]} — click to change`}
      title={`Appearance: ${labels[pref]} — click to change`}
      className={`
        relative flex items-center justify-center w-9 h-9 rounded-xl
        transition-all duration-200
        ${isDark
          ? 'bg-white/10 hover:bg-white/20 text-orange-400 border border-white/15'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200'
        }
        ${className}
      `}
    >
      {icons[pref]}
    </button>
  );
}
