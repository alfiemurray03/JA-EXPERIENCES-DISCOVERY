/**
 * /register — Create a free account.
 *
 * Clicking "Create free account" sends the user to /auth/oidc/start which
 * handles both sign-in (returning users) and sign-up (new users) in one flow.
 * New accounts are provisioned automatically on first sign-in.
 *
 * No Microsoft branding is shown here — this is presented purely as
 * "create your account" from the user's perspective.
 */
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, FileText, Shield, Zap } from 'lucide-react';
import { useSiteSettings } from '@/lib/site-settings-context';

const PERKS = [
  { icon: FileText, text: 'Access 100+ professional document templates' },
  { icon: Zap,      text: 'Create and download documents in minutes' },
  { icon: Shield,   text: 'Secure, UK-focused, always available' },
  { icon: CheckCircle2, text: 'Free plan — no credit card required' },
];

export default function RegisterPage() {
  const { siteName } = useSiteSettings();
  return (
    <>
      <Helmet>
        <title>Create a Free Account — {siteName}</title>
        <meta
          name="description"
          content={`Sign up for ${siteName} and start creating professional documents in minutes. Free plan available, no credit card required.`}
        />
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16 bg-background">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center">

          {/* Left: value prop */}
          <div className="space-y-6">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3">
                Free to get started
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Create professional documents in minutes
              </h1>
              <p className="text-muted-foreground mt-3 text-base leading-relaxed">
                Join {siteName} and get instant access to over 100 UK-focused
                document templates — letters, contracts, invoices, policies and more.
              </p>
            </div>

            <ul className="space-y-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-foreground">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            <p className="text-xs text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in here
              </Link>
            </p>
          </div>

          {/* Right: sign-up card */}
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Create your free account</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Quick, secure sign-up — no forms to fill in.
              </p>
            </div>

            {/* Primary CTA */}
            <Button
              size="lg"
              className="w-full h-12 gap-2 font-semibold text-sm"
              onClick={() => { window.location.href = '/auth/oidc/start'; }}
            >
              Create free account
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">or</span>
              </div>
            </div>

            {/* Sign in link */}
            <Button
              variant="outline"
              size="lg"
              className="w-full h-11 text-sm"
              onClick={() => { window.location.href = '/auth/oidc/start'; }}
            >
              Sign in to existing account
            </Button>

            {/* Trust note */}
            <div className="rounded-xl bg-muted/40 border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground leading-relaxed text-center">
                Your account is secured with enterprise-grade authentication.
                No passwords to remember.
              </p>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              By creating an account you agree to our{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
