/**
 * /auth/callback — React shell page.
 *
 * The actual OIDC callback processing happens entirely server-side at
 * GET /auth/callback (Express handler). The server validates the code,
 * creates the session, and issues a redirect to /dashboard or /login?error=…
 *
 * This React page is only rendered if the server-side handler somehow
 * falls through to the SPA (e.g. during local dev with Vite proxy). In
 * production the Express handler intercepts the request before React Router.
 */
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // If we have a code param the server handler should have caught this.
    // Redirect to login with a generic error so the user isn't stuck.
    const code  = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      navigate(`/login?error=oidc_callback_failed`, { replace: true });
    } else if (code) {
      // Server should have handled this — reload to trigger server-side processing
      window.location.reload();
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-primary-foreground" />
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">Completing sign-in…</p>
    </div>
  );
}
