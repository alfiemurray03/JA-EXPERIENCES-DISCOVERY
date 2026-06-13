/**
 * /auth/callback
 * The browser lands here after Microsoft Entra redirects back.
 * We immediately forward the full query string to the backend token-exchange handler.
 * The backend sets HttpOnly cookies and redirects to /dashboard.
 */
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Forward the authorization code + state to the backend handler.
    // Use window.location.replace so this page is not in browser history.
    const qs = searchParams.toString();
    window.location.replace(`/api/auth/callback${qs ? `?${qs}` : ''}`);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
        <p className="text-sm text-muted-foreground">Signing you in…</p>
      </div>
    </div>
  );
}
