import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { Cookie, Shield, Settings, BarChart2, ExternalLink, RefreshCw } from 'lucide-react';
import { useSiteSettings } from '@/lib/site-settings-context';

interface LegalContent { body: string; effectiveDate: string; version: number; }

export default function CookiePolicyPage() {
  const lastUpdated = '3 June 2026';
  const { siteName, companyName, brandName } = useSiteSettings();

  const [liveContent, setLiveContent] = useState<LegalContent | null>(null);
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    fetch('/api/legal?slug=cookie-policy')
      .then(r => r.json())
      .then((d: { success: boolean } & Partial<LegalContent>) => {
        if (d.success && d.body) setLiveContent(d as LegalContent);
      })
      .catch(() => {})
      .finally(() => setLoadingLive(false));
  }, []);

  const displayDate = liveContent?.effectiveDate
    ? new Date(liveContent.effectiveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : lastUpdated;

  return (
    <>
      <Helmet>
        <title>Cookie Policy — {siteName}</title>
        <meta name="description" content={`How ${siteName} uses cookies and similar technologies on our platform.`} />
        <link rel="canonical" href="https://jadocumenthub.co.uk/cookies" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Cookie className="w-5 h-5 text-primary" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Cookie Policy</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            Last updated: <time dateTime="2026-06-03">{displayDate}</time>
          </p>
          <p className="text-muted-foreground mt-3 leading-relaxed">
            This Cookie Policy explains how {siteName}, operated by {brandName}, uses cookies
            and similar technologies when you visit our website or use our platform. It should be read
            alongside our{' '}
            <Link to="/privacy" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Privacy Policy
            </Link>{' '}
            and{' '}
            <Link to="/terms" className="text-primary underline underline-offset-2 hover:text-primary/80">
              Terms of Service
            </Link>.
          </p>
        </div>

        {/* Live DB content overrides static */}
        {liveContent ? (
          <div
            className="legal-html-body text-sm text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: liveContent.body }}
          />
        ) : loadingLive ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
          </div>
        ) : (
        <div className="space-y-8 text-foreground">

          {/* What are cookies */}
          <section aria-labelledby="what-are-cookies">
            <h2 id="what-are-cookies" className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" aria-hidden="true" />
              What Are Cookies?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Cookies are small text files that are placed on your device (computer, tablet, or mobile phone)
              when you visit a website. They are widely used to make websites work more efficiently, to
              remember your preferences, and to provide information to website owners.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Similar technologies include local storage, session storage, and pixel tags. This policy
              covers all of these technologies collectively referred to as "cookies".
            </p>
          </section>

          {/* Types of cookies */}
          <section aria-labelledby="types-of-cookies">
            <h2 id="types-of-cookies" className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" aria-hidden="true" />
              Types of Cookies We Use
            </h2>

            <div className="space-y-5">
              {/* Essential */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 shrink-0 mt-0.5">
                    Always Active
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Strictly Necessary Cookies</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      These cookies are essential for the platform to function and cannot be switched off.
                      They are set in response to actions you take, such as logging in, setting your privacy
                      preferences, or filling in forms. Without these cookies, services you have requested
                      cannot be provided.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span><strong className="text-foreground">ja_session</strong> — Keeps you signed in during your visit. HttpOnly, Secure. Expires after 30 days or when you sign out.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span><strong className="text-foreground">ja_cookie_consent</strong> — Stores your cookie consent preferences. Expires after 12 months.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span><strong className="text-foreground">ja-theme</strong> (localStorage) — Stores your display theme preference (light/dark/system). No expiry.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Functional */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 shrink-0 mt-0.5">
                    Optional
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Functional Cookies</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      These cookies allow the platform to remember choices you make and provide enhanced,
                      more personal features. They may be set by us or by third-party providers whose
                      services we have added to our pages.
                    </p>
                    <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span><strong className="text-foreground">ja-saved-letters</strong> (localStorage) — Temporarily stores unsaved letter drafts in your browser. No expiry.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 shrink-0 mt-0.5">
                    Optional
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <BarChart2 className="w-4 h-4" aria-hidden="true" />
                      Analytics Cookies
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      These cookies help us understand how visitors interact with our platform by collecting
                      and reporting information anonymously. This helps us improve the platform and your
                      experience. We only set these cookies with your consent.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Currently, we do not use any third-party analytics services. If this changes, we will
                      update this policy and request your consent before setting any analytics cookies.
                    </p>
                  </div>
                </div>
              </div>

              {/* Marketing */}
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shrink-0 mt-0.5">
                    Not Used
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Marketing &amp; Advertising Cookies</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      We do not use marketing or advertising cookies. We do not share your data with
                      advertising networks or use your browsing behaviour for targeted advertising.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Third-party cookies */}
          <section aria-labelledby="third-party">
            <h2 id="third-party" className="text-xl font-semibold text-foreground mb-3">
              Third-Party Services
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the following third-party services which may set their own cookies:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse" aria-label="Third-party services and their cookie usage">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="text-left py-2 pr-4 font-semibold text-foreground">Service</th>
                    <th scope="col" className="text-left py-2 pr-4 font-semibold text-foreground">Purpose</th>
                    <th scope="col" className="text-left py-2 font-semibold text-foreground">Privacy Policy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2.5 pr-4 text-foreground font-medium">Stripe</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">Payment processing (only on checkout pages)</td>
                    <td className="py-2.5">
                      <a
                        href="https://stripe.com/gb/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        stripe.com/gb/privacy
                        <ExternalLink className="w-3 h-3" aria-label="(opens in new tab)" />
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2.5 pr-4 text-foreground font-medium">Google Fonts</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">Font delivery (Inter, DM Sans)</td>
                    <td className="py-2.5">
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        policies.google.com/privacy
                        <ExternalLink className="w-3 h-3" aria-label="(opens in new tab)" />
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Managing cookies */}
          <section aria-labelledby="managing-cookies">
            <h2 id="managing-cookies" className="text-xl font-semibold text-foreground mb-3">
              Managing Your Cookie Preferences
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              You can manage your cookie preferences in several ways:
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span><strong className="text-foreground">Cookie banner:</strong> When you first visit the platform, you can accept or decline optional cookies using the banner at the bottom of the screen.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span><strong className="text-foreground">Browser settings:</strong> Most browsers allow you to block or delete cookies through their settings. Note that blocking strictly necessary cookies will prevent you from signing in.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span><strong className="text-foreground">Account settings:</strong> Signed-in users can manage notification and marketing preferences in{' '}
                  <Link to="/settings" className="text-primary underline underline-offset-2 hover:text-primary/80">Account Settings</Link>.
                </span>
              </li>
            </ul>
            <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-4">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                <strong>Please note:</strong> Disabling strictly necessary cookies (such as the session cookie)
                will prevent you from signing in to your account and using the platform's core features.
              </p>
            </div>
          </section>

          {/* UK GDPR */}
          <section aria-labelledby="legal-basis">
            <h2 id="legal-basis" className="text-xl font-semibold text-foreground mb-3">
              Legal Basis (UK GDPR)
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Under the UK General Data Protection Regulation (UK GDPR) and the Privacy and Electronic
              Communications Regulations (PECR):
            </p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span><strong className="text-foreground">Strictly necessary cookies</strong> do not require your consent as they are essential to provide the service you have requested.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5 shrink-0">•</span>
                <span><strong className="text-foreground">Optional cookies</strong> (functional, analytics) are only set with your explicit consent, which you can withdraw at any time.</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section aria-labelledby="contact">
            <h2 id="contact" className="text-xl font-semibold text-foreground mb-3">
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="mt-3 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground space-y-1">
              <p><strong className="text-foreground">{brandName}</strong></p>
              <p>Operating {siteName}</p>
              <p>
                Email:{' '}
                <a href="mailto:privacy@jagroupservices.co.uk" className="text-primary hover:underline">
                  privacy@jagroupservices.co.uk
                </a>
              </p>
              <p>
                Or use our{' '}
                <Link to="/contact" className="text-primary hover:underline">
                  contact form
                </Link>
              </p>
            </div>
          </section>

          {/* Updates */}
          <section aria-labelledby="updates">
            <h2 id="updates" className="text-xl font-semibold text-foreground mb-3">
              Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in our practices or
              for other operational, legal, or regulatory reasons. We will notify you of any significant
              changes by updating the "Last updated" date at the top of this page. We encourage you to
              review this policy periodically.
            </p>
          </section>

          {/* Navigation */}
          <div className="pt-6 border-t border-border flex flex-wrap gap-4 text-sm">
            <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
            <Link to="/contact" className="text-primary hover:underline">Contact Us</Link>
          </div>
        </div>
        )} {/* end static fallback */}
      </div>
    </>
  );
}
