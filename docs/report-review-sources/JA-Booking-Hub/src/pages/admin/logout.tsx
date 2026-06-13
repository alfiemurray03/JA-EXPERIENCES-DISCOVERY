/**
 * /admin/logout — Admin portal sign-out.
 * Clears admin HttpOnly cookies then redirects to the identity provider logout.
 */
import { useEffect, useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Loader2, Shield } from 'lucide-react';
import { clearAuthCache } from '@/lib/useAuth';

export default function AdminLogoutPage() {
  const [error, setError] = useState(false);

  useEffect(() => {
    async function doLogout() {
      try {
        clearAuthCache();
        const res = await fetch('/api/admin/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json() as { logoutUrl?: string };
        if (data.logoutUrl) {
          window.location.replace(data.logoutUrl);
        } else {
          window.location.replace('/admin/login');
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
        <title>Signing Out — Admin Portal</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-white" />
          </div>
          {error ? (
            <>
              <p className="text-sm text-red-400 mb-3">Something went wrong signing you out.</p>
              <a href="/admin/login" className="text-sm text-primary hover:underline">Return to sign in</a>
            </>
          ) : (
            <>
              <Loader2 size={28} className="animate-spin text-primary mx-auto mb-3" />
              <p className="text-sm text-slate-400">Signing you out…</p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
