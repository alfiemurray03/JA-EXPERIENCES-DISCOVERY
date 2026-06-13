import { useState } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { useSiteSettings } from '@/lib/site-settings-context';
import { useResellerAuth } from '@/lib/reseller-auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Loader2 } from 'lucide-react';

const STATUS_MESSAGES: Record<string, string> = {
  PENDING: 'Your application is still under review. We\'ll email you once it\'s approved.',
  REJECTED: 'Your application was not approved. Please contact us if you have questions.',
  SUSPENDED: 'Your account has been suspended. Please contact support.',
};

export default function ResellerLoginPage() {
  const { siteName } = useSiteSettings();
  const { refresh } = useResellerAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusCode, setStatusCode] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setStatusCode('');
    setLoading(true);
    try {
      const r = await fetch('/api/reseller/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const d = await r.json();
      if (d.success) {
        await refresh();
        navigate('/reseller');
      } else {
        if (d.code) setStatusCode(d.code);
        setError(d.error ?? 'Login failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Reseller Login — {siteName}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{siteName}</h1>
            <p className="text-muted-foreground text-sm mt-1">Reseller Portal</p>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-lg text-center">Sign In</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={submit} className="space-y-4">
                {error && (
                  <Alert variant={statusCode ? 'default' : 'destructive'}>
                    <AlertDescription>{STATUS_MESSAGES[statusCode] ?? error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in…</> : 'Sign In'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Not a reseller yet?{' '}
            <Link to="/partners" className="text-primary hover:underline">Learn about our partner programme</Link>
          </p>
        </div>
      </div>
    </>
  );
}
