/**
 * AccessibilityBubble
 *
 * A floating accessibility widget for the public-facing site.
 * Settings are loaded from /api/system-config/public (no auth required).
 * Stacks above the support chat bubble when both are visible.
 *
 * Features:
 *  - Font size increase/decrease
 *  - High contrast mode
 *  - Reduce motion
 *  - Dyslexia-friendly font (OpenDyslexic via Google Fonts)
 *  - Underline all links
 *  - Grayscale mode
 *  - Reset all
 *
 * Settings persist to localStorage so they survive page navigation.
 */
import { useState, useEffect, useCallback } from 'react';
import {
  Accessibility, X, Type, Contrast, Minus, Plus,
  Link2, Palette, RotateCcw, ZapOff,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface A11ySettings {
  enabled: boolean;
  position: 'bottom-right' | 'bottom-left';
  features: {
    fontSize: boolean;
    highContrast: boolean;
    reduceMotion: boolean;
    dyslexiaFont: boolean;
    underlineLinks: boolean;
    grayscale: boolean;
  };
}

export const A11Y_DEFAULTS: A11ySettings = {
  enabled: true,
  position: 'bottom-right',
  features: {
    fontSize: true,
    highContrast: true,
    reduceMotion: true,
    dyslexiaFont: true,
    underlineLinks: true,
    grayscale: true,
  },
};

// ── User state (persisted to localStorage) ────────────────────────────────────

interface UserA11yState {
  fontSizeLevel: number;   // -2 to +4 (steps of 10%)
  highContrast: boolean;
  reduceMotion: boolean;
  dyslexiaFont: boolean;
  underlineLinks: boolean;
  grayscale: boolean;
}

const USER_STATE_KEY = 'ja_a11y_state';

const DEFAULT_USER_STATE: UserA11yState = {
  fontSizeLevel: 0,
  highContrast: false,
  reduceMotion: false,
  dyslexiaFont: false,
  underlineLinks: false,
  grayscale: false,
};

function loadUserState(): UserA11yState {
  try {
    const raw = localStorage.getItem(USER_STATE_KEY);
    if (raw) return { ...DEFAULT_USER_STATE, ...JSON.parse(raw) as Partial<UserA11yState> };
  } catch { /* ignore */ }
  return { ...DEFAULT_USER_STATE };
}

function saveUserState(s: UserA11yState) {
  try { localStorage.setItem(USER_STATE_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}

// ── CSS application ───────────────────────────────────────────────────────────

function applyA11yState(s: UserA11yState) {
  const root = document.documentElement;

  // Font size
  const pct = 100 + s.fontSizeLevel * 10;
  root.style.fontSize = s.fontSizeLevel !== 0 ? `${pct}%` : '';

  // High contrast
  if (s.highContrast) {
    root.setAttribute('data-a11y-contrast', 'high');
  } else {
    root.removeAttribute('data-a11y-contrast');
  }

  // Reduce motion
  if (s.reduceMotion) {
    root.setAttribute('data-a11y-motion', 'reduce');
  } else {
    root.removeAttribute('data-a11y-motion');
  }

  // Dyslexia font
  if (s.dyslexiaFont) {
    root.setAttribute('data-a11y-font', 'dyslexia');
  } else {
    root.removeAttribute('data-a11y-font');
  }

  // Underline links
  if (s.underlineLinks) {
    root.setAttribute('data-a11y-links', 'underline');
  } else {
    root.removeAttribute('data-a11y-links');
  }

  // Grayscale
  if (s.grayscale) {
    root.setAttribute('data-a11y-grayscale', 'true');
  } else {
    root.removeAttribute('data-a11y-grayscale');
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

interface AccessibilityBubbleProps {
  /** Override settings (from admin config). Falls back to A11Y_DEFAULTS. */
  settings?: Partial<A11ySettings>;
  /** Whether the support chat bubble is also visible (affects stacking offset) */
  hasSupportBubble?: boolean;
}

export default function AccessibilityBubble({ settings, hasSupportBubble = false }: AccessibilityBubbleProps) {
  const merged: A11ySettings = { ...A11Y_DEFAULTS, ...settings, features: { ...A11Y_DEFAULTS.features, ...settings?.features } };

  const [open, setOpen] = useState(false);
  const [state, setState] = useState<UserA11yState>(() => loadUserState());

  // Apply on mount and whenever state changes
  useEffect(() => {
    applyA11yState(state);
    saveUserState(state);
  }, [state]);

  const update = useCallback((patch: Partial<UserA11yState>) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...DEFAULT_USER_STATE });
  }, []);

  if (!merged.enabled) return null;

  const isRight = merged.position === 'bottom-right';

  // Stacking: if support chat is also visible, offset upward
  const bottomOffset = hasSupportBubble ? 'bottom-24' : 'bottom-6';

  const posClass = isRight
    ? `right-6 ${bottomOffset}`
    : `left-6 ${bottomOffset}`;

  const panelPos = isRight
    ? 'right-0 bottom-16'
    : 'left-0 bottom-16';

  const hasAnyActive = state.fontSizeLevel !== 0 || state.highContrast || state.reduceMotion
    || state.dyslexiaFont || state.underlineLinks || state.grayscale;

  return (
    <div className={`fixed z-40 ${posClass}`} style={{ isolation: 'isolate' }}>
      {/* Panel */}
      {open && (
        <div className={`absolute ${panelPos} w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden`}
          role="dialog" aria-label="Accessibility options">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-primary text-white">
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4" />
              <span className="text-sm font-semibold">Accessibility</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/20 transition-colors" aria-label="Close">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">

            {/* Font size */}
            {merged.features.fontSize && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">Text Size</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => update({ fontSizeLevel: Math.max(-2, state.fontSizeLevel - 1) })}
                    disabled={state.fontSizeLevel <= -2}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    aria-label="Decrease text size"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs w-10 text-center font-medium text-gray-700">
                    {state.fontSizeLevel === 0 ? 'Default' : `${state.fontSizeLevel > 0 ? '+' : ''}${state.fontSizeLevel * 10}%`}
                  </span>
                  <button
                    onClick={() => update({ fontSizeLevel: Math.min(4, state.fontSizeLevel + 1) })}
                    disabled={state.fontSizeLevel >= 4}
                    className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    aria-label="Increase text size"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Toggles */}
            {[
              merged.features.highContrast && {
                key: 'highContrast' as const,
                icon: Contrast,
                label: 'High Contrast',
              },
              merged.features.reduceMotion && {
                key: 'reduceMotion' as const,
                icon: ZapOff,
                label: 'Reduce Motion',
              },
              merged.features.dyslexiaFont && {
                key: 'dyslexiaFont' as const,
                icon: Type,
                label: 'Dyslexia-Friendly Font',
              },
              merged.features.underlineLinks && {
                key: 'underlineLinks' as const,
                icon: Link2,
                label: 'Underline All Links',
              },
              merged.features.grayscale && {
                key: 'grayscale' as const,
                icon: Palette,
                label: 'Grayscale Mode',
              },
            ].filter(Boolean).map((item) => {
              if (!item) return null;
              const Icon = item.icon;
              const active = state[item.key];
              return (
                <button
                  key={item.key}
                  onClick={() => update({ [item.key]: !active })}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border transition-colors text-left
                    ${active
                      ? 'bg-primary/10 border-primary/30 text-primary'
                      : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  aria-pressed={active}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </div>
                  <div className={`w-8 h-4 rounded-full transition-colors relative ${active ? 'bg-primary' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                </button>
              );
            })}

            {/* Reset */}
            {hasAnyActive && (
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-gray-500 hover:text-gray-700 border border-dashed border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset all to default
              </button>
            )}
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all
          ${open ? 'bg-primary text-white scale-95' : 'bg-white text-primary border-2 border-primary hover:scale-105'}
          ${hasAnyActive ? 'ring-2 ring-primary ring-offset-2' : ''}
        `}
        aria-label="Open accessibility options"
        aria-expanded={open}
      >
        <Accessibility className="w-5 h-5" />
        {hasAnyActive && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white" />
        )}
      </button>
    </div>
  );
}
