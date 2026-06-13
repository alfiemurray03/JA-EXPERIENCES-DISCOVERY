import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { Shield, RefreshCw } from 'lucide-react';
import { useSiteSettings } from '@/lib/site-settings-context';

const EFFECTIVE_DATE = '2 June 2026';
const CONTACT_EMAIL = 'privacy@jagroupservices.co.uk';

interface LegalContent {
  body: string;
  effectiveDate: string;
  version: number;
  updatedAt: string;
}

export default function PrivacyPage() {
  const { siteName, companyName: COMPANY } = useSiteSettings();
  const PLATFORM = siteName;

  const [liveContent, setLiveContent] = useState<LegalContent | null>(null);
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    fetch('/api/legal?slug=privacy-policy')
      .then(r => r.json())
      .then((d: { success: boolean } & Partial<LegalContent>) => {
        if (d.success && d.body) setLiveContent(d as LegalContent);
      })
      .catch(() => { /* use static fallback */ })
      .finally(() => setLoadingLive(false));
  }, []);

  const effectiveDate = liveContent?.effectiveDate
    ? new Date(liveContent.effectiveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : EFFECTIVE_DATE;

  return (
    <>
      <Helmet>
        <title>Privacy Policy — {siteName}</title>
        <meta
          name="description"
          content={`Privacy Policy for ${siteName}. Learn how we collect, use, and protect your personal data in accordance with UK GDPR.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground">Effective date: {effectiveDate}</p>
            </div>
          </div>

          {/* Live DB content */}
          {liveContent ? (
            <div
              className="legal-html-body text-sm text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: liveContent.body }}
            />
          ) : loadingLive ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : (
            /* Static fallback */
            <div className="space-y-8 text-foreground">

              <section>
                <p className="text-muted-foreground leading-relaxed">
                  {COMPANY} ("we", "us", "our") operates {PLATFORM}. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use our platform.
                  We are committed to handling your data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">1. Data Controller</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {COMPANY} is the data controller for personal data collected through {PLATFORM}.
                  If you have questions about how we handle your data, contact us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline hover:no-underline">{CONTACT_EMAIL}</a>.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">2. Data We Collect</h2>
                <div className="space-y-4 text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-1">Account data</p>
                    <p>When you register, we collect your name, email address, and a hashed password. We do not store your password in plain text.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Document data</p>
                    <p>Documents you create, including their content and metadata, are stored on our servers so you can access them across sessions.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Usage data</p>
                    <p>We collect information about how you use the platform for service improvement.</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">Technical data</p>
                    <p>We collect standard server logs including IP addresses, browser type, and access times for security and operational purposes.</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Data</h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>To provide and operate the {PLATFORM} service.</li>
                  <li>To manage your account and authenticate your sessions.</li>
                  <li>To store and retrieve your documents.</li>
                  <li>To send transactional emails (account confirmations, notifications).</li>
                  <li>To detect and prevent fraud, abuse, and security incidents.</li>
                  <li>To comply with legal obligations.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">4. Legal Basis for Processing</h2>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong className="text-foreground">Contract:</strong> Processing necessary to provide the service you have signed up for.</p>
                  <p><strong className="text-foreground">Legitimate interests:</strong> Security monitoring, fraud prevention, and service improvement.</p>
                  <p><strong className="text-foreground">Consent:</strong> Marketing emails — you may withdraw consent at any time from your account settings.</p>
                  <p><strong className="text-foreground">Legal obligation:</strong> Where we are required to process data to comply with applicable law.</p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">5. Cookies &amp; Sessions</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We use a single httpOnly session cookie (<code className="bg-muted px-1 py-0.5 rounded text-xs">ja_session</code>) to authenticate your account.
                  This cookie is strictly necessary for the service to function and does not track you across other websites.
                  We do not use advertising cookies or third-party tracking cookies.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">6. Data Retention</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We retain your account data and documents for as long as your account is active.
                  If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Rights</h2>
                <p className="text-muted-foreground mb-2">Under UK GDPR, you have the right to:</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li><strong className="text-foreground">Access</strong> — request a copy of the personal data we hold about you.</li>
                  <li><strong className="text-foreground">Rectification</strong> — request correction of inaccurate data.</li>
                  <li><strong className="text-foreground">Erasure</strong> — request deletion of your data ("right to be forgotten").</li>
                  <li><strong className="text-foreground">Portability</strong> — request your data in a structured, machine-readable format.</li>
                  <li><strong className="text-foreground">Objection</strong> — object to processing based on legitimate interests.</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  To exercise any of these rights, contact us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline hover:no-underline">{CONTACT_EMAIL}</a>.
                  You also have the right to lodge a complaint with the{' '}
                  <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:no-underline">Information Commissioner's Office (ICO)</a>.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">8. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  For any privacy-related queries, contact us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline hover:no-underline">{CONTACT_EMAIL}</a>.
                </p>
              </section>

            </div>
          )}

          {/* Footer nav */}
          <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>

        </div>
      </div>
    </>
  );
}
