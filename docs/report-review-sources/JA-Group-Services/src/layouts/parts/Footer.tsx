import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { X, Cookie, Shield, Settings as SettingsIcon, Info } from 'lucide-react';
import { motion } from 'motion/react';
import LogoJumpGame from '@/components/LogoJumpGame';
import { TrustpilotWidget } from '@/components/TrustpilotWidget';
import { LanguageSwitcher, useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';

// Extend Window interface for Trustpilot
declare global {
  interface Window {
    Trustpilot?: {
      loadFromElement: (element: HTMLElement | null, force: boolean) => void;
    };
    gtag?: (...args: any[]) => void;
  }
}
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function Footer() {
  const trustpilotRef = useRef<HTMLDivElement>(null);
  const { language } = useLanguage();
  
  useEffect(() => {
    // Load Trustpilot widget after component mounts
    const loadTrustpilot = () => {
      if (window.Trustpilot && trustpilotRef.current) {
        window.Trustpilot.loadFromElement(trustpilotRef.current, true);
      } else if (!window.Trustpilot) {
        // Retry if script hasn't loaded yet
        setTimeout(loadTrustpilot, 500);
      }
    };
    
    loadTrustpilot();
  }, []);

  const [showCookieSettings, setShowCookieSettings] = useState(false);
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedGame, setSelectedGame] = useState<'land' | 'flying' | null>(null);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, cannot be disabled
    functional: true,
    analytics: true,
  });

  useEffect(() => {
    // Helper to get cookie
    const getCookie = (name: string): string | null => {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    };

    // Load saved preferences from CookieBanner's storage (check both cookie and localStorage)
    const COOKIE_CONSENT_KEY = 'c2_analytics_consent';
    const cookieData = getCookie(COOKIE_CONSENT_KEY);
    const localStorageData = localStorage.getItem(COOKIE_CONSENT_KEY);
    const saved = cookieData || localStorageData;
    
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences({
          necessary: true,
          functional: parsed.analytics !== false,
          analytics: parsed.analytics !== false,
        });
      } catch (e) {
        // Invalid JSON, use defaults
      }
    }

    // Listen for custom event from CookieBanner
    const handleOpenSettings = () => {
      setShowCookieSettings(true);
    };
    window.addEventListener('openCookieSettings', handleOpenSettings);

    return () => {
      window.removeEventListener('openCookieSettings', handleOpenSettings);
    };
  }, []);

  const handleCookieSettings = () => {
    // Always show the full preferences dialog
    setShowCookieSettings(true);
  };

  const handleSavePreferences = () => {
    // Helper to set cookie
    const setCookie = (name: string, value: string, days: number) => {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      const expires = `expires=${date.toUTCString()}`;
      document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;Secure`;
    };

    // Save to both cookie and localStorage
    const COOKIE_CONSENT_KEY = 'c2_analytics_consent';
    const consentData = JSON.stringify({
      analytics: preferences.analytics,
      timestamp: Date.now()
    });
    setCookie(COOKIE_CONSENT_KEY, consentData, 365);
    localStorage.setItem(COOKIE_CONSENT_KEY, consentData);
    setShowCookieSettings(false);
    
    // Reload page to apply changes
    window.location.reload();
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
    };
    setPreferences(allAccepted);
    const COOKIE_CONSENT_KEY = 'c2_analytics_consent';
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      analytics: true,
      timestamp: Date.now()
    }));
    setShowCookieSettings(false);
    window.location.reload();
  };

  const handleDeclineAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
    };
    setPreferences(onlyNecessary);
    const COOKIE_CONSENT_KEY = 'c2_analytics_consent';
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      analytics: false,
      timestamp: Date.now()
    }));
    setShowCookieSettings(false);
    window.location.reload();
  };


  return (
    <footer className="bg-white/40 backdrop-blur-md text-[#0A1F44] border-t border-white/20">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Column 1: Logo and Tagline */}
          <div className="space-y-6">
            <div className="relative inline-block group">
              <motion.img
                src="/images/367f316379e78929865b1677b6370686.jpg"
                alt="JA Group Services Ltd"
                className="h-36 w-auto cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMenuPosition({
                    x: rect.left + rect.width / 2,
                    y: rect.top
                  });
                  setShowGameMenu(true);
                }}
                whileHover={{
                  scale: 1.05,
                  rotate: [0, -5, 5, 0],
                  transition: { duration: 0.3 }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.1 }
                }}
              />
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-[#2563EB] font-semibold whitespace-nowrap">🎮 Click to play!</span>
              </div>
            </div>
            <p className="text-[#0A1F44]/70 text-sm leading-relaxed">
              Providing structured, accountable and professionally governed operating frameworks for our business divisions and strategic partnerships.
            </p>
          </div>

          {/* Column 2: Our Divisions */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Our Divisions</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://jadomainhub.co.uk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                >
                  JA Domain Hub
                </a>
                <p className="text-[#0A1F44]/50 text-xs mt-1">Domain Services Division</p>
              </li>
            </ul>
            <div className="mt-8">
              <h4 className="text-sm font-semibold mb-3 text-[#0A1F44]">{t('footer.company', language)}</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/about-us"
                    className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                  >
                    {t('footer.company.about', language)}
                  </Link>
                </li>
                <li>
                  <Link
                    to="/our-group-structure"
                    className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                  >
                    Group Structure
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contactus"
                    className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4 cursor-pointer"
                  >
                    {t('footer.company.contact', language)}
                  </Link>
                </li>
                <li>
                  <a
                    href="https://profiles.jagroupservices.co.uk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                  >
                    {t('footer.company.team', language)}
                  </a>
                </li>
                <li>
                  <span className="text-[#0A1F44]/40 text-sm inline-block">
                    Announcements
                  </span>
                  <p className="text-[#0A1F44]/50 text-xs mt-1">Coming Soon</p>
                </li>
                <li>
                  <Link
                    to="/jsds-group"
                    className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                  >
                    JSDS Group Ltd
                  </Link>
                  <p className="text-[#0A1F44]/50 text-xs mt-1">{t('footer.company.parent', language)}</p>
                </li>

              </ul>
            </div>
            <div className="mt-8">
              <h4 className="text-sm font-semibold mb-3 text-[#0A1F44]">Partner Recommendations</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/recommended-services"
                    className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                  >
                    Recommended Services
                  </Link>
                </li>
                <li>
                  <Link
                    to="/find-activities-tours"
                    className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                  >
                    Find Activities &amp; Tours
                  </Link>
                </li>
                <li>
                  <Link
                    to="/partners/tide"
                    className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                  >
                    Tide Business Banking
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Column 3: Legal & Resources */}
          <div>
            {/* Trustpilot Widget - Review Collector */}
            <div className="mb-6">
              <div 
                ref={trustpilotRef}
                className="trustpilot-widget" 
                data-locale="en-GB" 
                data-template-id="56278e9abfbbba0bdcd568bc" 
                data-businessunit-id="69716dd02eea6a1317956e56" 
                data-style-height="52px" 
                data-style-width="100%" 
                data-token="e6a61baf-e09a-4c11-92bd-68a124a65e71"
              >
                <a 
                  href="https://uk.trustpilot.com/review/jagroupservices.co.uk" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Trustpilot
                </a>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold mb-6 text-[#0A1F44]">{t('footer.legal', language)}</h3>
            
            <ul className="space-y-3">
              <li>
                <Link
                  to="/terms-of-service"
                  className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                >
                  {t('footer.legal.terms', language)}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                >
                  {t('footer.legal.privacy', language)}
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies-policy"
                  className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                >
                  {t('footer.legal.cookies', language)}
                </Link>
              </li>
              <li>
                <Link
                  to="/complaints-policy"
                  className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                >
                  Complaints Policy
                </Link>
              </li>

              <li>
                <Link
                  to="/sitemap"
                  className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4"
                >
                  Sitemap
                </Link>
              </li>
              <li>
                <button
                  onClick={handleCookieSettings}
                  className="text-[#0A1F44]/70 hover:text-[#0A1F44] transition-colors text-sm inline-block hover:underline underline-offset-4 text-left"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Game Selection Menu */}
      {showGameMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setShowGameMenu(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="absolute bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20"
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
              transform: 'translate(-50%, -100%)',
              marginTop: '-1rem',
              width: 'min(600px, 90vw)',
              padding: '2rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-[#0A1F44] mb-3">🎮 Choose Your Game!</h2>
              <p className="text-[#0A1F44]/60">Select a game mode to start playing</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Land Game */}
              <motion.button
                onClick={() => {
                  setSelectedGame('land');
                  setShowGameMenu(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-green-500 to-green-700 text-gray-900 rounded-xl p-8 text-center shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold mb-2">Land Jump</h3>
                <p className="text-gray-800 text-sm mb-4">Classic jumping game - tap to jump over obstacles!</p>
                <div className="bg-white/20 rounded-lg px-4 py-2 text-sm">
                  👉 Click to Jump
                </div>
              </motion.button>

              {/* Flying Game */}
              <motion.button
                onClick={() => {
                  setSelectedGame('flying');
                  setShowGameMenu(false);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-br from-blue-500 to-blue-700 text-gray-900 rounded-xl p-8 text-center shadow-lg hover:shadow-2xl transition-shadow"
              >
                <div className="text-6xl mb-4">✈️</div>
                <h3 className="text-2xl font-bold mb-2">Flying Mode</h3>
                <p className="text-gray-800 text-sm mb-4">Hold to fly up, release to fall - navigate through obstacles!</p>
                <div className="bg-white/20 rounded-lg px-4 py-2 text-sm">
                  👉 Hold to Fly
                </div>
              </motion.button>
            </div>

            <button
              onClick={() => setShowGameMenu(false)}
              className="mt-6 w-full text-[#0A1F44]/60 hover:text-[#0A1F44] transition-colors text-sm"
            >
              Cancel
            </button>
          </motion.div>
        </div>
      )}

      {/* Logo Jump Game */}
      {selectedGame && (
        <LogoJumpGame 
          isOpen={selectedGame !== null} 
          onClose={() => setSelectedGame(null)} 
          gameMode={selectedGame}
        />
      )}

      {/* Cookie Settings Modal */}
      {showCookieSettings && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 bg-white border-b border-[#0A1F44]/10 px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2563EB]/10 rounded-lg flex items-center justify-center">
                          <Cookie className="h-5 w-5 text-[#2563EB]" />
                        </div>
                        <div>
                          <h2 className="text-xl font-serif font-bold text-[#0A1F44]">Cookie Settings</h2>
                          <p className="text-sm text-[#0A1F44]/60">Manage your cookie preferences</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowCookieSettings(false)}
                        className="text-[#0A1F44]/60 hover:text-[#0A1F44] transition-colors"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-6 space-y-6">
                      <p className="text-sm text-[#0A1F44]/70 leading-relaxed">
                        We use cookies to enhance your browsing experience and analyze our traffic. You can choose which types of cookies to allow below.
                      </p>

                      {/* Strictly Necessary */}
                      <div className="border border-[#0A1F44]/10 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 bg-[#2563EB]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                              <Shield className="h-5 w-5 text-[#2563EB]" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-[#0A1F44]">Strictly Necessary Cookies</h3>
                                <span className="inline-flex items-center bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded-full text-xs font-medium">
                                  Always Active
                                </span>
                              </div>
                              <p className="text-sm text-[#0A1F44]/70 leading-relaxed">
                                Essential for the website to function properly. These cookies enable core functionality such as security, network management, and accessibility. They cannot be disabled.
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Switch checked={true} disabled className="opacity-50" />
                          </div>
                        </div>
                      </div>

                      {/* Functional Cookies */}
                      <div className="border border-[#0A1F44]/10 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 bg-[#87CEEB]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                              <SettingsIcon className="h-5 w-5 text-[#0A1F44]" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-[#0A1F44]">Functional Cookies</h3>
                                <span className="inline-flex items-center bg-[#87CEEB]/20 text-[#0A1F44] px-2 py-0.5 rounded-full text-xs font-medium">
                                  Optional
                                </span>
                              </div>
                              <p className="text-sm text-[#0A1F44]/70 leading-relaxed">
                                Enable enhanced functionality and personalization, such as remembering your preferences and settings.
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Switch
                              checked={preferences.functional}
                              onCheckedChange={(checked) =>
                                setPreferences({ ...preferences, functional: checked })
                              }
                            />
                          </div>
                        </div>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="border border-[#0A1F44]/10 rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 bg-[#87CEEB]/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                              <Info className="h-5 w-5 text-[#0A1F44]" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-[#0A1F44]">Analytics Cookies</h3>
                                <span className="inline-flex items-center bg-[#87CEEB]/20 text-[#0A1F44] px-2 py-0.5 rounded-full text-xs font-medium">
                                  Optional
                                </span>
                              </div>
                              <p className="text-sm text-[#0A1F44]/70 leading-relaxed">
                                Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                              </p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <Switch
                              checked={preferences.analytics}
                              onCheckedChange={(checked) =>
                                setPreferences({ ...preferences, analytics: checked })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="sticky bottom-0 bg-[#FAFAF9] border-t border-[#0A1F44]/10 px-6 py-4 flex flex-col sm:flex-row gap-3">
                      <Button
                        onClick={handleDeclineAll}
                        variant="outline"
                        className="flex-1 border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#0A1F44]/5"
                      >
                        Decline All
                      </Button>
                      <Button
                        onClick={handleSavePreferences}
                        variant="outline"
                        className="flex-1 border-[#2563EB] text-[#2563EB] hover:bg-[#2563EB]/5"
                      >
                        Save Preferences
                      </Button>
                      <Button
                        onClick={handleAcceptAll}
                        className="flex-1 bg-[#2563EB] text-white hover:bg-[#2563EB]/90"
                      >
                        Accept All
                      </Button>
                    </div>
                  </div>
        </div>
      )}

      {/* Legal Section */}
      <div className="border-t border-[#0A1F44]/10 bg-[#FAFAF9]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#0A1F44]/70">
            <div className="text-center md:text-left">
              <p>
                © {new Date().getFullYear()} JA Group Services Ltd. All rights reserved.
              </p>
              <p className="mt-1">
                Company No.{' '}
                <a
                  href="https://find-and-update.company-information.service.gov.uk/company/16314179"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-[#2563EB] transition-colors"
                >
                  16314179
                </a>
                {' '}| ICO Registration{' '}
                <a
                  href="https://ico.org.uk/ESDWebPages/Entry/ZB877370"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline hover:text-[#2563EB] transition-colors"
                >
                  ZB877370
                </a>
              </p>
              <p className="mt-1">Registered Address: 167-169 Great Portland Street, 5th Floor, London, W1W 5PF</p>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


