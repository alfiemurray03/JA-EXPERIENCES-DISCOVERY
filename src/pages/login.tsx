/**
 * /sign-in — JA Plan Studio branded sign-in page.
 *
 * Always shows the branded sign-in UI. The "Sign in" button navigates to
 * /auth/oidc/start which handles the full authentication flow.
 *
 * If ?error= is present (returned from the OIDC callback), an error banner
 * is shown above the sign-in button.
 *
 * No Microsoft branding is shown on this page — authentication is presented
 * as a seamless account sign-in experience.
 */
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle, ShieldCheck, Compass, ArrowRight,
  CheckCircle2, MapPinned, CalendarDays, Accessibility,
} from 'lucide-react';
import { useSiteSettings } from '@/lib/site-settings-context';

// ── Error messages keyed by the ?error= query param ───────────────────────────

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
  oidc_no_email: {
    title: 'Email address not available',
    body:  'We could not retrieve your email address. Please ensure your account has a verified email address, then try again. If the problem persists, contact support.',
  },
  oidc_callback_failed: {
    title: 'Sign-in did not complete',
    body:  'Authentication did not complete successfully. Please try again.',
  },
  account_suspended: {
    title: 'Account suspended',
    body:  'Your account has been suspended. Please contact support@jagroupservices.co.uk.',
  },
};

const FEATURES = [
  { icon: CalendarDays, text: 'Guided builders for days out, holidays and occasions' },
  { icon: MapPinned,    text: 'Keep itineraries, budgets and booking details organised' },
  { icon: Accessibility,text: 'Plan around accessibility, family and support needs' },
  { icon: ShieldCheck,  text: 'Save and manage supported plans in one secure account' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error') ?? '';
  const { siteName, brandName, companyName } = useSiteSettings();
  const errorInfo = OIDC_ERRORS[errorCode] ?? (
    errorCode
      ? { title: 'Sign-in failed', body: 'An unexpected error occurred. Please try again.' }
      : null
  );

  return (
    <>
      <Helmet>
        <title>Sign In — {siteName}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Full-screen split layout */}
      <div className="min-h-screen flex bg-[#0d1b2e]">

        {/* ── Left: brand panel (desktop only) ──────────────────────────────── */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] flex-col justify-between p-12 relative overflow-hidden">

          {/* Background gradient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#1B4F8A]/30 blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#1e1b8a]/20 blur-3xl" />
          </div>

          {/* Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 bg-[#1B4F8A] rounded-xl flex items-center justify-center shadow-lg group-hover:bg-[#1B4F8A]/80 transition-colors">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg leading-tight">{siteName}</p>
                <p className="text-white/50 text-xs">by {brandName}</p>
              </div>
            </Link>
          </div>

          {/* Hero copy */}
          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight">
              Personalised plans,<br />
              <span className="text-[#4A90D9]">built around you.</span>
            </h1>
            <p className="text-white/60 text-lg max-w-md leading-relaxed">
              Build practical plans for everyday experiences, travel,
              accessibility and special occasions in one secure place.
            </p>

            <ul className="space-y-3">
              {FEATURES.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-white/70 text-sm">
                  <div className="w-7 h-7 rounded-full bg-[#1B4F8A]/40 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[#4A90D9]" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-white/60">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Everyday</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Travel</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Accessibility</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">Family</span>
            </div>
          </div>

          {/* Footer */}
          <div className="relative z-10">
            <p className="text-white/30 text-xs">
              © {new Date().getFullYear()} {companyName}. All rights reserved.
            </p>
          </div>
        </div>

        {/* ── Right: sign-in panel ──────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 bg-white">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#1B4F8A] rounded-2xl flex items-center justify-center shadow-md">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <p className="font-bold text-[#0d1b2e] text-lg">{siteName}</p>
              <p className="text-gray-400 text-xs">by {brandName}</p>
            </Link>
          </div>

          <div className="w-full max-w-sm space-y-6">

            {/* Heading */}
            <div>
              <h2 className="text-2xl font-bold text-[#0d1b2e]">Welcome to {siteName}</h2>
              <p className="text-gray-500 text-sm mt-1">
                Sign in with JA Group Services ID to open your planning account.
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
              onClick={() => { window.location.href = '/account/login?return_to=%2Fdashboard'; }}
            >
              Continue to secure sign-in
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-gray-400">New to {siteName}?</span>
              </div>
            </div>

            {/* Sign-up CTA */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full h-11 text-sm font-medium gap-2"
              onClick={() => { window.location.href = '/account/login?return_to=%2Fdashboard'; }}
            >
              Create a free account
            </Button>

            {/* Trust note */}
            <div className="flex items-start gap-2.5 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
              <ShieldCheck className="w-4 h-4 text-[#1B4F8A] mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Secure single sign-on is provided through JA Group Services ID.
                This customer account does not provide access to internal company systems.
              </p>
            </div>

            {/* What you get on sign-up */}
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 space-y-2">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Start planning for free</p>
              {[
                '30 one-time builder credits',
                'Preview builders without using credits',
                'Browse destinations, activities and planning ideas',
              ].map(item => (
                <div key={item} className="flex items-center gap-2 text-xs text-gray-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                  {item}
                </div>
              ))}
              <div className="pt-1 border-t border-gray-200 mt-1">
                <p className="text-[11px] text-gray-400">
                  Paid plans include unlimited use of their eligible builders.{' '}
                  <a href="/pricing" className="text-[#1B4F8A] hover:underline">See plans →</a>
                </p>
              </div>
            </div>

            {/* Support link */}
            <p className="text-center text-xs text-gray-400">
              Need help?{' '}
              <a
                href="mailto:support@jagroupservices.co.uk"
                className="text-[#1B4F8A] hover:underline font-medium"
              >
                Contact support
              </a>
            </p>

          </div>

          {/* Bottom links */}
          <div className="mt-10 text-center">
            <p className="text-xs text-gray-300">
              <Link to="/terms" className="hover:text-gray-500 transition-colors">Terms of Service</Link>
              {' · '}
              <Link to="/privacy" className="hover:text-gray-500 transition-colors">Privacy Policy</Link>
            </p>
          </div>
        </div>

      </div>
    </>
  );
}
