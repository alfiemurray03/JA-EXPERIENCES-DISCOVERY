/**
 * /login — Business portal sign-in.
 * Immediately redirects to the identity provider on load.
 * If Entra returns an error, shows it clearly.
 */
import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Loader2, AlertTriangle } from 'lucide-react';
import { BUSINESS_AUTH } from '@/lib/auth-config';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const desc = searchParams.get('desc');

  useEffect(() => {
    // Don't auto-redirect if we're showing an error
    if (error) return;

    const returnTo = searchParams.get('returnTo') ?? '/dashboard';
    const state = encodeURIComponent(returnTo);

    const params = new URLSearchParams({
      client_id: BUSINESS_AUTH.clientId,
      response_type: 'code',
      redirect_uri: BUSINESS_AUTH.redirectUri,
      scope: BUSINESS_AUTH.scopes.join(' '),
      response_mode: 'query',
      state,
    });

    window.location.replace(`${BUSINESS_AUTH.authorizeUrl}?${params.toString()}`);
  }, [error, searchParams]);

  // Error state — shown when Entra or the token exchange fails
  if (error) {
    return (
      <>
        <Helmet>
          <title>Sign In Failed — JABooking</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 px-4">
          <div className="w-full max-w-md text-center">
            <Link to="/" className="inline-block mb-8">
              <img
                src="/airo-assets/images/logo/horizontal"
                alt="JABooking"
                className="h-10 w-auto object-contain mx-auto"
              />
            </Link>
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={22} className="text-red-600" />
              </div>
              <h1 className="text-lg font-semibold text-[#0F172A] mb-2">Sign in failed</h1>
              <p className="text-sm text-muted-foreground mb-1">
                {desc ? decodeURIComponent(desc) : 'Something went wrong during sign in.'}
              </p>
              <p className="text-xs text-muted-foreground mb-6 font-mono bg-slate-50 rounded px-3 py-2">
                {error}
              </p>
              <Button
                className="w-full"
                onClick={() => {
                  const params = new URLSearchParams({
                    client_id: BUSINESS_AUTH.clientId,
                    response_type: 'code',
                    redirect_uri: BUSINESS_AUTH.redirectUri,
                    scope: BUSINESS_AUTH.scopes.join(' '),
                    response_mode: 'query',
                    state: encodeURIComponent('/dashboard'),
                    prompt: 'login',
                  });
                  window.location.replace(`${BUSINESS_AUTH.authorizeUrl}?${params.toString()}`);
                }}
              >
                Try again
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                Redirect URI in use:{' '}
                <span className="font-mono break-all">{BUSINESS_AUTH.redirectUri}</span>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Loading state while redirect fires
  return (
    <>
      <Helmet>
        <title>Sign In — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="text-center">
          <img
            src="/airo-assets/images/logo/horizontal"
            alt="JABooking"
            className="h-10 w-auto object-contain mx-auto mb-8"
          />
          <Loader2 size={28} className="animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Redirecting to sign in…</p>
        </div>
      </div>
    </>
  );
}
