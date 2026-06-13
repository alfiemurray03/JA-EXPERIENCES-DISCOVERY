/**
 * /admin/login — Admin portal sign-in.
 * Immediately redirects to the identity provider on load.
 * Shows error details if Entra or token exchange fails.
 */
import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Loader2, Shield, AlertTriangle } from 'lucide-react';
import { ADMIN_AUTH } from '@/lib/auth-config';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error');
  const desc = searchParams.get('desc');

  useEffect(() => {
    if (error) return;

    const params = new URLSearchParams({
      client_id: ADMIN_AUTH.clientId,
      response_type: 'code',
      redirect_uri: ADMIN_AUTH.redirectUri,
      scope: ADMIN_AUTH.scopes.join(' '),
      response_mode: 'query',
    });

    window.location.replace(`${ADMIN_AUTH.authorizeUrl}?${params.toString()}`);
  }, [error]);

  if (error) {
    return (
      <>
        <Helmet>
          <title>Admin Sign In Failed — JABooking</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
          <div className="w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-white mb-1">Sign in failed</h1>
              <p className="text-slate-400 text-sm">Admin Portal · JABooking</p>
            </div>
            <div className="bg-white rounded-2xl p-6">
              <p className="text-sm text-slate-700 mb-2">
                {desc ? decodeURIComponent(desc) : 'Authentication could not be completed.'}
              </p>
              <p className="text-xs font-mono bg-slate-50 rounded px-3 py-2 text-slate-500 mb-4 break-all">
                {error}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Redirect URI:{' '}
                <span className="font-mono break-all">{ADMIN_AUTH.redirectUri}</span>
              </p>
              <Button
                className="w-full bg-[#0F172A] hover:bg-slate-800 text-white"
                onClick={() => {
                  const params = new URLSearchParams({
                    client_id: ADMIN_AUTH.clientId,
                    response_type: 'code',
                    redirect_uri: ADMIN_AUTH.redirectUri,
                    scope: ADMIN_AUTH.scopes.join(' '),
                    response_mode: 'query',
                    prompt: 'login',
                  });
                  window.location.replace(`${ADMIN_AUTH.authorizeUrl}?${params.toString()}`);
                }}
              >
                <Shield size={16} className="mr-2" />
                Try again
              </Button>
            </div>
            <div className="text-center mt-4">
              <Link to="/" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                ← Back to JABooking
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Sign In — JABooking</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-white" />
          </div>
          <Loader2 size={28} className="animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-slate-400">Redirecting to sign in…</p>
        </div>
      </div>
    </>
  );
}
