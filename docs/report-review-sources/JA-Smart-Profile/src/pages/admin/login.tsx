import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ArrowRight, ShieldCheck, Loader2, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/lib/admin-auth';
import { useBranding } from '@/lib/branding';

export default function AdminLoginPage() {
  const { adminUser, loading, loginAdmin } = useAdminAuth();
  const branding = useBranding();
  const [searchParams] = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);
  const error = searchParams.get('error');

  useEffect(() => {
    if (!loading && adminUser) {
      window.location.href = '/admin';
    }
  }, [adminUser, loading]);

  const handleSignIn = () => {
    setRedirecting(true);
    loginAdmin();
  };

  const errorMessages: Record<string, string> = {
    oidc_init_failed: 'Could not start the sign-in process. Please contact IT support.',
    oidc_callback_failed: 'Sign-in was not completed. Please try again.',
    no_email: 'Your account does not have an email address. Please contact IT support.',
    access_denied: 'Your account does not have the Administrator role required to access this portal. Please contact IT support.',
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Staff Sign In — {branding.platform_name} Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-background flex flex-col">
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
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
                <ShieldCheck className="w-8 h-8 text-red-400" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Staff Portal</h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Restricted to authorised {branding.legal_company_name} internal staff only. Unauthorised access is prohibited.
              </p>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
              {error && (
                <div className="mb-5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm leading-relaxed">
                  {errorMessages[error] ?? 'An unexpected error occurred. Please try again.'}
                </div>
              )}

              {redirecting ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-red-400" />
                  <p className="text-sm text-muted-foreground">Redirecting you to sign in securely…</p>
                </div>
              ) : (
                <>
                  <Button
                    onClick={handleSignIn}
                    className="w-full bg-red-600 hover:bg-red-700 h-11 text-base font-medium text-white"
                  >
                    Sign in
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>

                  <p className="mt-5 text-xs text-muted-foreground text-center leading-relaxed">
                    You will be redirected to sign in via the {branding.master_brand_name} staff directory. This access is logged and monitored.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 text-center text-xs text-muted-foreground">
              Not staff?{' '}
              <Link to="/login" className="text-primary hover:underline">Customer sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
