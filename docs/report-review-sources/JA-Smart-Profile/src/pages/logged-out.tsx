/**
 * /logged-out — shown after a successful logout.
 * This page must NOT use AuthProvider or useAuth — doing so would trigger
 * a /api/auth/me call and potentially redirect back to login.
 */
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { CheckCircle2, Zap, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBranding } from '@/lib/branding';

export default function LoggedOutPage() {
  const branding = useBranding();
  const platformName = branding.platform_name ?? 'JA Smart Profile';

  return (
    <>
      <Helmet>
        <title>Signed Out — {platformName}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">{platformName}</span>
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-sm text-center">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-2">You've been signed out</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Your session has ended and you've been signed out of {platformName} securely.
            </p>

            <div className="flex flex-col gap-3">
              <Link to="/login">
                <Button className="w-full bg-primary hover:bg-primary/90 gap-2">
                  <LogIn className="w-4 h-4" />
                  Sign back in
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full border-border">
                  Back to home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
