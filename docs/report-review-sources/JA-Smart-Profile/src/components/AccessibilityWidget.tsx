/**
 * AccessibilityWidget — floating bubble on all public-facing pages.
 * Controls: font size, high contrast, reduced motion, dyslexia-friendly font.
 * Preferences stored in localStorage and applied as CSS classes on <html>.
 */
import { useState, useEffect } from 'react';
import { Accessibility, X, Type, Eye, Zap, BookOpen, RotateCcw } from 'lucide-react';

interface A11yPrefs {
  fontSize: 'normal' | 'large' | 'xl';
  highContrast: boolean;
  reducedMotion: boolean;
  dyslexiaFont: boolean;
}

const DEFAULTS: A11yPrefs = {
  fontSize: 'normal',
  highContrast: false,
  reducedMotion: false,
  dyslexiaFont: false,
};

const STORAGE_KEY = 'ja_a11y_prefs';

function applyPrefs(prefs: A11yPrefs) {
  const html = document.documentElement;
  // Font size
  html.classList.remove('a11y-text-large', 'a11y-text-xl');
  if (prefs.fontSize === 'large') html.classList.add('a11y-text-large');
  if (prefs.fontSize === 'xl') html.classList.add('a11y-text-xl');
  // High contrast
  html.classList.toggle('a11y-high-contrast', prefs.highContrast);
  // Reduced motion
  html.classList.toggle('a11y-reduced-motion', prefs.reducedMotion);
  // Dyslexia font
  html.classList.toggle('a11y-dyslexia', prefs.dyslexiaFont);
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<A11yPrefs>(DEFAULTS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as A11yPrefs;
        setPrefs(parsed);
        applyPrefs(parsed);
      }
    } catch { /* ignore */ }
  }, []);

  const update = (patch: Partial<A11yPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    applyPrefs(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const reset = () => {
    setPrefs(DEFAULTS);
    applyPrefs(DEFAULTS);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  };

  return (
    <>
      {/* Inject CSS for a11y classes */}
      <style>{`
        .a11y-text-large { font-size: 110% !important; }
        .a11y-text-xl { font-size: 125% !important; }
        .a11y-high-contrast { filter: contrast(1.4); }
        .a11y-reduced-motion *, .a11y-reduced-motion *::before, .a11y-reduced-motion *::after {
          animation-duration: 0.001ms !important;
          transition-duration: 0.001ms !important;
        }
        .a11y-dyslexia, .a11y-dyslexia * {
          font-family: 'Arial', 'Helvetica', sans-serif !important;
          letter-spacing: 0.05em !important;
          word-spacing: 0.1em !important;
          line-height: 1.7 !important;
        }
      `}</style>

      {/* Floating button */}
      <div className="fixed bottom-20 right-4 z-40 flex flex-col items-end gap-2">
        {open && (
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-72 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Accessibility</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Font size */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Type className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Text size</span>
                </div>
                <div className="flex gap-2">
                  {(['normal', 'large', 'xl'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => update({ fontSize: size })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        prefs.fontSize === size
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      {size === 'normal' ? 'A' : size === 'large' ? 'A+' : 'A++'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              {[
                { key: 'highContrast' as const, icon: Eye, label: 'High contrast' },
                { key: 'reducedMotion' as const, icon: Zap, label: 'Reduce motion' },
                { key: 'dyslexiaFont' as const, icon: BookOpen, label: 'Dyslexia-friendly font' },
              ].map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => update({ [key]: !prefs[key] })}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                    prefs[key]
                      ? 'bg-primary/10 border-primary/40 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                  <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${prefs[key] ? 'bg-primary' : 'bg-muted'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[key] ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                </button>
              ))}

              {/* Reset */}
              <button
                onClick={reset}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset to defaults
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen(v => !v)}
          className="w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center text-white hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          aria-label="Accessibility options"
          title="Accessibility options"
        >
          <Accessibility className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
