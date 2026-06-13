/**
 * Cookie Preference Banner — UK GDPR / PECR compliant.
 * Appears as a floating bubble bottom-left.
 * Essential cookies: always on (session, PKCE auth state).
 * Analytics, Marketing, Preferences: opt-in only.
 * Preferences persisted in localStorage under 'ja_cookie_prefs'.
 */
import { useState, useEffect } from 'react';
import { Cookie, Shield, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Link } from 'react-router-dom';

interface CookiePrefs {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  decided: boolean;
  decidedAt: string;
}

const STORAGE_KEY = 'ja_cookie_prefs';

export function getCookiePrefs(): CookiePrefs | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CookiePrefs;
  } catch {
    return null;
  }
}

function savePrefs(prefs: Omit<CookiePrefs, 'decided' | 'decidedAt'>): CookiePrefs {
  const full: CookiePrefs = { ...prefs, decided: true, decidedAt: new Date().toISOString() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(full)); } catch { /* ignore */ }
  // Log consent to audit trail (non-fatal)
  fetch('/api/audit/consent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs),
  }).catch(() => {});
  return full;
}

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(() => {
    const existing = getCookiePrefs();
    if (!existing?.decided) {
      // Slight delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const acceptAll = () => {
    savePrefs({ essential: true, analytics: true, marketing: true, preferences: true });
    setVisible(false);
  };

  const rejectAll = () => {
    savePrefs({ essential: true, analytics: false, marketing: false, preferences: false });
    setVisible(false);
  };

  const saveCustom = () => {
    savePrefs({ essential: true, analytics, marketing, preferences });
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm w-[calc(100vw-2rem)] sm:w-96">
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 p-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie className="w-4.5 h-4.5 text-primary" style={{ width: '18px', height: '18px' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">We use cookies</p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              We use essential cookies to keep the site working. With your consent, we also use optional cookies to improve your experience.{' '}
              <Link to="/legal/cookies" className="text-primary hover:underline">Cookie policy</Link>
            </p>
          </div>
        </div>

        {/* Manage / details toggle */}
        {!showManage ? (
          <div className="px-4 pb-4 space-y-2">
            <div className="flex gap-2">
              <Button onClick={acceptAll} className="flex-1 bg-primary text-white text-xs h-9">
                Accept all
              </Button>
              <Button onClick={rejectAll} variant="outline" className="flex-1 border-border text-xs h-9">
                Essential only
              </Button>
            </div>
            <button
              onClick={() => setShowManage(true)}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <Settings2 className="w-3.5 h-3.5" /> Manage preferences
            </button>
          </div>
        ) : (
          <div className="px-4 pb-4 space-y-3">
            {/* Essential — always on */}
            <div className="flex items-center justify-between py-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-green-400" />
                <div>
                  <p className="text-xs font-medium text-foreground">Essential</p>
                  <p className="text-xs text-muted-foreground">Required for the site to function</p>
                </div>
              </div>
              <span className="text-xs text-green-400 font-medium">Always on</span>
            </div>

            {[
              { key: 'analytics' as const, label: 'Analytics', desc: 'Help us understand how visitors use the site', value: analytics, set: setAnalytics },
              { key: 'marketing' as const, label: 'Marketing', desc: 'Used to show relevant content and offers', value: marketing, set: setMarketing },
              { key: 'preferences' as const, label: 'Preferences', desc: 'Remember your settings and customisations', value: preferences, set: setPreferences },
            ].map(({ key, label, desc, value, set }) => (
              <div key={key} className="flex items-center justify-between py-2 border-t border-border/50">
                <div>
                  <p className="text-xs font-medium text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch checked={value} onCheckedChange={set} className="flex-shrink-0 ml-3" />
              </div>
            ))}

            <div className="flex gap-2 pt-1">
              <Button onClick={saveCustom} className="flex-1 bg-primary text-white text-xs h-9">
                Save preferences
              </Button>
              <Button onClick={acceptAll} variant="outline" className="flex-1 border-border text-xs h-9">
                Accept all
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
