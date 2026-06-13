import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSiteSettings } from '@/lib/site-settings-context';
import { cn } from '@/lib/utils';

const publicNavLinks = [
{ label: 'Builders', href: '/builders' },
{ label: 'Pricing', href: '/pricing' }];


const authNavLinks = [
{ label: 'Builders', href: '/builders' },
{ label: 'Documents', href: '/documents' },
{ label: 'Pricing', href: '/pricing' }];


export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const { siteName, brandName } = useSiteSettings();
  const location = useLocation();
  const navLinks = user ? authNavLinks : publicNavLinks;

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring rounded-sm"
            aria-label={`${siteName} — home`}>
            
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center" aria-hidden="true">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <div className="font-bold text-sm text-foreground leading-tight">{siteName}</div>
              <div className="text-xs text-muted-foreground leading-tight">by {brandName}</div>
            </div>
            <div className="sm:hidden font-bold text-sm text-foreground">{siteName}</div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive ?
                    'text-primary bg-primary/5' :
                    'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}>
                  
                  {link.label}
                </Link>);

            })}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            {user ?
            <Button asChild size="sm">
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button> :

            <>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/auth/oidc/start">Sign in</a>
                </Button>
                <Button size="sm" asChild>
                  <a href="/auth/oidc/start">Get Started Free</a>
                </Button>
              </>
            }
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav">
            
            {mobileOpen ?
            <X className="w-5 h-5" aria-hidden="true" /> :
            <Menu className="w-5 h-5" aria-hidden="true" />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <nav
        id="mobile-nav"
        className={cn('md:hidden border-t border-border bg-card px-4 py-3 space-y-1', mobileOpen ? 'block' : 'hidden')}
        aria-label="Mobile navigation"
        aria-hidden={!mobileOpen}>
        
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive ? 'page' : undefined}
              className="block px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
              
              {link.label}
            </Link>);

        })}
        <div className="pt-2 flex flex-col gap-2">
          {user ?
          <Button asChild size="sm">
              <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Go to Dashboard</Link>
            </Button> :

          <>
              <Button variant="outline" size="sm" asChild>
                <a href="/auth/oidc/start" onClick={() => setMobileOpen(false)}>Sign in</a>
              </Button>
              <Button size="sm" asChild>
                <a href="/auth/oidc/start" onClick={() => setMobileOpen(false)}>Get Started Free</a>
              </Button>
            </>
          }
        </div>
      </nav>
    </header>);

}