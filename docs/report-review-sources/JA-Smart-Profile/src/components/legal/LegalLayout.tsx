/**
 * Shared layout wrapper for all legal pages (Privacy, Terms, Cookies).
 * Provides consistent header, nav breadcrumb, and footer.
 */
import { Link } from 'react-router-dom';
import { Zap, ChevronRight } from 'lucide-react';
import { useBranding } from '@/lib/branding';

interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  const branding = useBranding();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">{branding.platform_name}</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <a href="/#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <Link to="/partners" className="hover:text-foreground transition-colors">Affiliate Programme</Link>
              <Link to="/login" className="text-primary font-medium hover:text-primary/80 transition-colors">Log In</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground">{title}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-12 pb-8 border-b border-border">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">{title}</h1>
            <p className="text-muted-foreground text-sm">
              Last updated: {lastUpdated} · {branding.legal_company_name || branding.platform_name}
            </p>
          </div>

          {/* Legal content */}
          <div className="prose-legal">
            {children}
          </div>

          {/* Legal nav */}
          <div className="mt-16 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground mb-4">Other legal documents:</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/legal/privacy" className="text-sm text-primary hover:underline">Privacy Policy</Link>
              <span className="text-muted-foreground">·</span>
              <Link to="/legal/terms" className="text-sm text-primary hover:underline">Terms of Service</Link>
              <span className="text-muted-foreground">·</span>
              <Link to="/legal/cookies" className="text-sm text-primary hover:underline">Cookie Policy</Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {branding.platform_name}. Part of JA Group Services.
          </p>
          <a
            href={`mailto:${branding.contact_email}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {branding.contact_email}
          </a>
        </div>
      </footer>
    </div>
  );
}
