/**
 * /admin — Platform Administration Sign In
 *
 * Matches the customer login split-panel layout.
 * Auto-redirects to Microsoft OIDC immediately unless an error is present.
 * No "Sign in with Microsoft" text — just a clean "Access portal" button.
 */
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle, Shield, ArrowRight, RefreshCw,
  Lock, Eye, Activity, Users,
} from 'lucide-react';

// ── Error messages ─────────────────────────────────────────────────────────────

const OIDC_ERRORS: Record<string, { title: string; body: string }> = {
  oidc_unavailable: {
    title: 'Sign-in temporarily unavailable',
    body:  'We could not complete your sign-in. Please wait a moment and try again.',
  },
  oidc_state_missing: {
    title: 'Session expired',
    body:  'Your sign-in session timed out. Please start again.',
  },
  oidc_state_invalid: {
    title: 'Sign-in could not be verified',
    body:  'Something went wrong verifying your sign-in. Please try again.',
  },
  oidc_wrong_tenant: {
    title: 'Access denied',
    body:  'This portal is restricted to JA Group Services Ltd accounts only.',
  },
  oidc_no_email: {
    title: 'Email address not available',
    body:  'We could not retrieve your email address from your account. Please try again.',
  },
  oidc_not_authorised: {
    title: 'Not authorised',
    body:  'Your account is not authorised for this portal. Contact your administrator.',
  },
  oidc_account_suspended: {
    title: 'Account suspended',
    body:  'Your account has been suspended. Contact your administrator.',
  },
  oidc_callback_failed: {
    title: 'Sign-in did not complete',
    body:  'Authentication did not complete successfully. Please try again.',
  },
};

const PORTAL_FEATURES = [
  { icon: Users,    text: 'Manage customers, plans and accounts' },
  { icon: Activity, text: 'Monitor platform health and usage' },
  { icon: Eye,      text: 'Full audit trail and action logs' },
  { icon: Lock,     text: 'Secured by JA Group Services Ltd identity' },
];

// ── Component ──────────────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const [searchParams] = useSearchParams();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const errorCode = searchParams.get('error') ?? '';
  const errorInfo = OIDC_ERRORS[errorCode] ?? (
    errorCode
      ? { title: 'Sign-in failed', body: 'An unexpected error occurred. Please try again.' }
      : null
  );

  function handleSignIn() {
    setIsRedirecting(true);
    window.location.href = '/auth/admin/oidc/start';
  }

  return (
    <>
      <Helmet>
        <title>Platform Administration — JA Document Hub</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen flex bg-[#0a1628]">

        {/* ── Left: brand panel (desktop only) ──────────────────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 relative overflow-hidden">

          {/* Background gradient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#1B4F8A]/25 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#1e1b8a]/20 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#1B4F8A]/10 blur-3xl" />
          </div>

          {/* Logo */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1B4F8A] rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">Platform Administration</p>
                <p className="text-white/50 text-xs">JA Document Hub · JA Group Services Ltd</p>
              </div>
            </div>
          </div>

          {/* Hero copy */}
          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Secure admin access,<br />
              <span className="text-[#4A90D9]">always in control.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-md leading-relaxed">
              Manage customers, monitor platform health, and oversee
              all document activity from one secure portal.
            </p>

            <ul className="space-y-3">
              {PORTAL_FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-white/70 text-sm">
                  <div className="w-7 h-7 rounded-full bg-[#1B4F8A]/40 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#4A90D9]" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            {/* Warning badge */}
            <div className="flex items-start gap-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 max-w-md">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300/80 leading-relaxed">
                Authorised platform staff only. All access attempts are logged and monitored.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} JA Group Services Ltd. All rights reserved.
            </p>
          </div>
        </div>

        {/* ── Right: sign-in panel ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-white">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#1B4F8A] rounded-2xl flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-[#0a1628] text-lg">Platform Administration</p>
              <p className="text-gray-400 text-xs">JA Document Hub · JA Group Services Ltd</p>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-6">

            {/* Heading */}
            <div>
              <h2 className="text-2xl font-bold text-[#0a1628]">Admin sign in</h2>
              <p className="text-gray-500 text-sm mt-1">
                Sign in with your JA Group Services account.
              </p>
            </div>

            {/* Error banner */}
            {errorInfo && (
              <Alert variant="destructive" className="border-red-200 bg-red-50">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <span className="font-semibold block">{errorInfo.title}</span>
                  <span className="text-sm">{errorInfo.body}</span>
                </AlertDescription>
              </Alert>
            )}

            {/* Primary sign-in button */}
            <Button
              type="button"
              size="lg"
              className="w-full h-12 gap-2 font-semibold text-sm"
              onClick={handleSignIn}
              disabled={isRedirecting}
            >
              {isRedirecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Connecting…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>

            {/* Trust note */}
            <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <Lock className="w-4 h-4 text-[#1B4F8A] mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Access is secured by JA Group Services Ltd identity.
                Restricted to authorised platform staff only.
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">Not an admin?</span>
              </div>
            </div>

            {/* Customer sign-in link */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-11 text-sm font-medium"
              onClick={() => { window.location.href = '/login'; }}
            >
              Go to customer sign-in
            </Button>

          </div>

          {/* Bottom note */}
          <div className="mt-10 text-center">
            <p className="text-xs text-gray-300">
              Unauthorised access attempts are logged and may be reported.
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
