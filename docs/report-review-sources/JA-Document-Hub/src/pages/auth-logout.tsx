/**
 * /auth/logout — React shell page.
 *
 * The actual logout processing happens server-side at GET /auth/logout
 * (Express handler). That handler clears the session cookie and redirects
 * to the Entra end-session endpoint.
 *
 * This React page is a fallback in case the SPA catches the route first.
 */
import { useEffect } from 'react';
import { FileText } from 'lucide-react';

export default function AuthLogoutPage() {
  useEffect(() => {
    // Trigger the server-side logout handler via full-page navigation
    window.location.href = '/auth/logout';
  }, []);

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <FileText className="w-6 h-6 text-primary-foreground" />
      </div>
      <p className="text-muted-foreground text-sm animate-pulse">Signing out…</p>
    </div>
  );
}
