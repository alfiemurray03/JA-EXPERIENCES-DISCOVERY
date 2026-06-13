/**
 * /admin/auth/callback
 * Browser landing page after Microsoft Entra redirects the admin back.
 * Forwards query string to the backend admin token-exchange handler.
 */
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';

export default function AdminAuthCallbackPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const qs = searchParams.toString();
    window.location.replace(`/api/admin/auth/callback${qs ? `?${qs}` : ''}`);
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A]">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4">
          <Shield size={24} className="text-white" />
        </div>
        <Loader2 size={28} className="animate-spin text-primary mx-auto mb-3" />
        <p className="text-sm text-slate-400">Verifying admin credentials…</p>
      </div>
    </div>
  );
}
