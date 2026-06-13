import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';
import { useSiteSettings } from '@/lib/site-settings-context';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { siteName, brandName } = useSiteSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json() as { success: boolean; message?: string; error?: string };
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error ?? 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Forgot Password — {siteName}</title>
        <meta name="description" content={`Request a password reset for your ${siteName} account.`} />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{siteName}</h1>
            <p className="text-slate-400 text-sm mt-1">{brandName}</p>
          </div>

          <Card className="bg-slate-800/60 border-slate-700 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-xl">
                {submitted ? 'Request Submitted' : 'Forgot Password'}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {submitted
                  ? 'Your request has been received and is awaiting administrator review.'
                  : 'Enter your email address and an administrator will review your reset request.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {submitted ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center py-4 gap-3">
                    <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Request Received</p>
                      <p className="text-slate-400 text-sm mt-1">
                        If an account exists for <strong className="text-slate-300">{email}</strong>, a reset request has been submitted.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-300 space-y-2">
                    <p className="font-medium">What happens next:</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-300/80">
                      <li>An administrator will review your request</li>
                      <li>You will receive an email with either a reset link or PIN</li>
                      <li>Follow the instructions in the email to set a new password</li>
                    </ol>
                  </div>

                  <p className="text-xs text-slate-500 text-center">
                    Reset credentials expire after 24 hours and can only be used once.
                  </p>

                  <Link to="/login">
                    <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
                    <strong>Note:</strong> Password resets require administrator approval. You will receive an email once your request has been reviewed.
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {loading ? 'Submitting...' : 'Submit Reset Request'}
                  </Button>

                  <Link to="/login">
                    <Button variant="ghost" className="w-full text-slate-400 hover:text-slate-300 hover:bg-slate-700/50">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Login
                    </Button>
                  </Link>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
