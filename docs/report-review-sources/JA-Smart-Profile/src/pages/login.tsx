import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ArrowRight, UserPlus, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { useBranding } from '@/lib/branding';

export default function LoginPage() {
  const { loginCustomer, user, loading } = useAuth();
  const branding = useBranding();
  const [searchParams] = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);
  const error = searchParams.get('error');

  useEffect(() => {
    if (!loading && user) {
      window.location.href = '/dashboard/overview';
    }
  }, [user, loading]);

  const handleSignIn = () => {
    setRedirecting(true);
    loginCustomer();
  };

  const errorMessages: Record<string, string> = {
    oidc_init_failed: 'Could not start the sign-in process. Please try again.',
    oidc_callback_failed: 'Sign-in was not completed. Please try again.',
    no_email: 'Your account does not have an email address associated. Please contact support.',
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Sign In — {branding.platform_name}</title>
        <meta name="description" content={`Sign in to your ${branding.platform_name} account to manage your digital profile.`} />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5 w-fit">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-foreground">{branding.platform_name}</span>
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            {/* Icon + heading */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Log in or create an account</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                New or returning — one click gets you in. Your digital profile is waiting.
              </p>
            </div>

            {/* Card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-relaxed">
                  {errorMessages[error] ?? 'An unexpected error occurred. Please try again.'}
                </div>
              )}

              {redirecting ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Redirecting you to sign in securely…</p>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleSignIn}
                    className="w-full bg-primary hover:bg-primary/90 h-11 text-base font-medium"
                  >
                    Log In / Create Account
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>

                  <p className="mt-5 text-xs text-muted-foreground text-center leading-relaxed">
                    Secure sign-in via JA Group Services Secure Access. No password required — existing accounts log straight in, new accounts are created automatically.
                  </p>
                </>
              )}
            </div>

            {/* Footer links */}
            <div className="mt-6 flex items-center justify-center text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Back to home</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
