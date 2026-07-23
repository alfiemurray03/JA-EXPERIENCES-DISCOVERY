import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ArrowRight, ShieldCheck, Loader2, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const errorMessages: Record<string, string> = {
  oidc_init_failed: 'Could not start the sign-in process. Please try again.',
  oidc_callback_failed: 'Sign-in was not completed. Please try again.',
  oidc_state_missing: 'Your sign-in session expired. Please try again.',
  oidc_state_invalid: 'Your sign-in session could not be verified. Please try again.',
  oidc_no_email: 'Your account does not have an email address. Please contact support.',
  account_suspended: 'This account is currently suspended. Please contact support.',
  oidc_unavailable: 'Sign-in is temporarily unavailable. Please try again shortly.',
};

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);
  const error = searchParams.get('error');

  const handleSignIn = () => {
    setRedirecting(true);
    const requested = searchParams.get('redirect') || searchParams.get('next') || '/dashboard';
    const returnTo = requested.startsWith('/') && !requested.startsWith('//') ? requested : '/dashboard';
    window.location.href = `/account/login?return_to=${encodeURIComponent(returnTo)}`;
  };

  return (
    <>
      <Helmet>
        <title>Sign In — Planyx</title>
        <meta name="description" content="Sign in to your Planyx account." />
        <link rel="canonical" href="/sign-in" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-[calc(100vh-4.5rem)] bg-background flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Sign in to Planyx</h1>
            <p className="text-muted-foreground text-xs">Secured by JA Group Services ID</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 text-sm leading-relaxed flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessages[error] ?? 'An unexpected error occurred. Please try again.'}</span>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
            <Button
              onClick={handleSignIn}
              disabled={redirecting}
              className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20"
            >
              {redirecting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Redirecting…</> : <>Continue to sign in <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>

            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3.5 flex gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">Enterprise-grade authentication. No separate Planyx password to remember.</p>
            </div>

            <div className="border-t border-border pt-4">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide mb-2.5">Plan, explore and save</p>
              <ul className="space-y-2">
                {['Explore destinations and live activities', 'Use guided experience-planning builders', 'Save and continue your plans securely'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Need help? <Link to="/support" className="text-primary font-medium hover:underline">Contact support</Link>
          </p>
          <p className="text-center text-[11px] text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground">Terms of Service</Link>
            <span className="mx-2">·</span>
            <Link to="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </>
  );
}
