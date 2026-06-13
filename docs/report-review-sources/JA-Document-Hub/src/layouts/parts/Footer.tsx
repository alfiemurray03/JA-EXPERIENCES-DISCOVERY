import { Link } from 'react-router-dom';
import { FileText, Sun, Moon, Monitor } from 'lucide-react';
import { useSiteSettings } from '@/lib/site-settings-context';
import { useTheme } from '@/lib/theme-context';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const options: Array<{ value: typeof theme; icon: React.ComponentType<{ className?: string }>; label: string }> = [
    { value: 'light',  icon: Sun,     label: 'Light' },
    { value: 'dark',   icon: Moon,    label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ];
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
      {options.map(opt => {
        const Icon = opt.icon;
        const isActive = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            title={opt.label}
            aria-label={`Switch to ${opt.label} theme`}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors ${
              isActive
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function Footer() {
  const { siteName, brandName } = useSiteSettings();
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">{siteName}</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Professional document builder for businesses and individuals. Operated by {brandName}.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              <strong>Disclaimer:</strong> Documents are templates only and do not constitute legal advice.
            </p>
            {/* Theme toggle */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Theme:</span>
              <ThemeToggle />
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Product</h4>
            <ul className="space-y-2">
              {[
                { label: 'Builders', href: '/builders', external: false },
                { label: 'Pricing', href: '/pricing', external: false },
                { label: 'Partners', href: '/partners', external: false },
                { label: 'Sign In', href: '/auth/oidc/start', external: true },
                { label: 'Create Account', href: '/auth/oidc/start', external: true },
              ].map((link) => (
                <li key={link.label}>
                  {link.external ? (
                    <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </a>
                  ) : (
                    <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold text-foreground text-sm mb-3">Support & Legal</h4>
            <ul className="space-y-2">
              {[
                { label: 'Contact Us', href: '/contact' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Cookie Policy', href: '/cookies' },
                { label: 'Acceptable Use', href: '/acceptable-use' },
              ].map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteName}. Operated by {brandName}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Templates are provided for informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
