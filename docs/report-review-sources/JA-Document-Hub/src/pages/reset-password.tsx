import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle2, AlertTriangle, KeyRound, Hash } from 'lucide-react';
import { useSiteSettings } from '@/lib/site-settings-context';

type Mode = 'link' | 'pin' | 'invalid';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { siteName, brandName } = useSiteSettings();

  const tokenFromUrl = searchParams.get('token');
  const mode: Mode = tokenFromUrl ? 'link' : 'pin';

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = (() => {
    if (newPassword.length === 0) return null;
    if (newPassword.length < 8) return { label: 'Too short', color: 'text-red-400', width: '25%' };
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    if (score <= 2) return { label: 'Weak', color: 'text-orange-400', width: '50%' };
    if (score === 3) return { label: 'Good', color: 'text-yellow-400', width: '75%' };
    return { label: 'Strong', color: 'text-green-400', width: '100%' };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (mode === 'pin' && (!pin.trim() || !email.trim())) {
      setError('Email and PIN are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body: Record<string, string> = { newPassword };
      if (mode === 'link' && tokenFromUrl) {
        body.token = tokenFromUrl;
      } else {
        body.pin = pin.trim();
        body.email = email.trim().toLowerCase();
      }

      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json() as { success: boolean; message?: string; error?: string };

      if (data.success) {
        setSuccess(true);
        setTimeout(() => void navigate('/login'), 3000);
      } else {
        setError(data.error ?? 'Failed to reset password. Please try again.');
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
        <title>Reset Password — {siteName}</title>
        <meta name="description" content={`Set a new password for your ${siteName} account.`} />
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
                {success ? 'Password Updated' : 'Reset Your Password'}
              </CardTitle>
              <CardDescription className="text-slate-400">
                {success
                  ? 'Your password has been changed successfully.'
                  : mode === 'link'
                    ? 'Enter your new password below.'
                    : 'Enter your email, the PIN you received, and your new password.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {success ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center text-center py-4 gap-3">
                    <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Password Changed</p>
                      <p className="text-slate-400 text-sm mt-1">
                        You can now log in with your new password. Redirecting to login...
                      </p>
                    </div>
                  </div>
                  <Link to="/login">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      Go to Login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
                  {/* PIN mode: email + PIN fields */}
                  {mode === 'pin' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-300">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          autoComplete="email"
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pin" className="text-slate-300 flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5" />
                          Reset PIN
                        </Label>
                        <Input
                          id="pin"
                          type="text"
                          value={pin}
                          onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="6-digit PIN"
                          maxLength={6}
                          required
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 text-center text-xl tracking-widest font-mono"
                        />
                      </div>
                    </>
                  )}

                  {/* Link mode: show token info */}
                  {mode === 'link' && (
                    <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      Reset link verified. Enter your new password below.
                    </div>
                  )}

                  {/* New password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="pr-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordStrength && (
                      <div className="space-y-1">
                        <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-current rounded-full transition-all"
                            style={{ width: passwordStrength.width, color: 'currentColor' }}
                          />
                        </div>
                        <p className={`text-xs ${passwordStrength.color}`}>{passwordStrength.label}</p>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your new password"
                      required
                      autoComplete="new-password"
                      className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 ${
                        confirmPassword && confirmPassword !== newPassword ? 'border-red-500' : ''
                      }`}
                    />
                    {confirmPassword && confirmPassword !== newPassword && (
                      <p className="text-xs text-red-400">Passwords do not match</p>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={loading || !newPassword || newPassword !== confirmPassword}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {loading ? 'Updating Password...' : 'Set New Password'}
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
