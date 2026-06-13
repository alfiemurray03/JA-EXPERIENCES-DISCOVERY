/**
 * /logout — Business portal sign-out.
 * Calls the backend to clear HttpOnly cookies, then redirects to the
 * identity provider logout endpoint which clears the SSO session too.
 */
import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Loader2 } from 'lucide-react';
import { clearAuthCache } from '@/lib/useAuth';

export default function LogoutPage() {
  const [error, setError] = useState(false);

  useEffect(() => {
    async function doLogout() {
      try {
        clearAuthCache();
        const res = await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json() as { logoutUrl?: string };
        if (data.logoutUrl) {
          window.location.replace(data.logoutUrl);
        } else {
          window.location.replace('/');
        }
      } catch {
        setError(true);
      }
    }
    doLogout();
  }, []);

  return (
    <>
      <Helmet>
        <title>Signing Out — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="text-center">
          <img
            src="/airo-assets/images/logo/horizontal"
            alt="JABooking"
            className="h-10 w-auto object-contain mx-auto mb-8"
          />
          {error ? (
            <>
              <p className="text-sm text-red-500 mb-3">Something went wrong signing you out.</p>
              <a href="/" className="text-sm text-primary hover:underline">Return to home</a>
            </>
          ) : (
            <>
              <Loader2 size={28} className="animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Signing you out…</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
