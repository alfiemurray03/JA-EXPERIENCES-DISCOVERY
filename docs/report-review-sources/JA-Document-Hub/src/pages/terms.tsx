import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { FileText, RefreshCw } from 'lucide-react';
import { useSiteSettings } from '@/lib/site-settings-context';

const EFFECTIVE_DATE = '2 June 2026';
const CONTACT_EMAIL = 'legal@jagroupservices.co.uk';

interface LegalContent {
  body: string;
  effectiveDate: string;
  version: number;
  updatedAt: string;
}

export default function TermsPage() {
  const { siteName, companyName: COMPANY } = useSiteSettings();
  const PLATFORM = siteName;

  const [liveContent, setLiveContent] = useState<LegalContent | null>(null);
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    fetch('/api/legal?slug=terms-of-service')
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
        <title>Terms of Service — {siteName}</title>
        <meta
          name="description"
          content={`Terms of Service for ${siteName}. Read our terms before using the platform.`}
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-12">

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
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
                  These Terms of Service ("Terms") govern your access to and use of {PLATFORM}, operated by {COMPANY} ("we", "us", "our").
                  By registering an account or using the platform, you agree to be bound by these Terms.
                  If you do not agree, do not use the platform.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">1. The Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {PLATFORM} is a document creation tool that provides templates, editing tools, and export functionality to help you create professional documents.
                  The platform does not provide legal, financial, tax, medical, or any other professional advice.
                  Documents generated are templates only — you are solely responsible for their accuracy, suitability, and legal compliance.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">2. Eligibility</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You must be at least 18 years old to use {PLATFORM}. By creating an account, you confirm that you meet this requirement.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">3. Accounts</h2>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                  <li>You are responsible for all activity that occurs under your account.</li>
                  <li>You must notify us immediately if you suspect unauthorised access to your account.</li>
                  <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">4. Subscriptions, Trials &amp; Billing</h2>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong className="text-foreground">Free Trial:</strong> Standard and Professional plans include a 14-day free trial. No payment is required to start your trial.</p>
                  <p><strong className="text-foreground">Subscriptions:</strong> Paid plans are billed monthly in advance. Prices are displayed in GBP and include VAT where applicable.</p>
                  <p><strong className="text-foreground">Cancellation:</strong> You may cancel your subscription at any time from your account settings. No refunds are issued for partial billing periods.</p>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">5. Acceptable Use</h2>
                <p className="text-muted-foreground mb-2">You agree not to use {PLATFORM} to:</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Create fraudulent, misleading, or illegal documents.</li>
                  <li>Infringe any third-party intellectual property rights.</li>
                  <li>Attempt to gain unauthorised access to the platform or other users' accounts.</li>
                  <li>Transmit malware, spam, or harmful code.</li>
                  <li>Violate any applicable law or regulation.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">6. Your Content</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You retain ownership of all content you create using {PLATFORM}. By using the platform, you grant us a limited licence to store and process your content solely to provide the service.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">7. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {PLATFORM} is provided "as is" and "as available" without warranties of any kind.
                  Template documents are provided as a starting point only and do not constitute professional advice of any kind.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">8. Limitation of Liability</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To the fullest extent permitted by law, {COMPANY} shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of {PLATFORM}.
                  Nothing in these Terms limits liability for death, personal injury, or fraud caused by our negligence.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">9. Data Protection</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We process your personal data in accordance with our{' '}
                  <Link to="/privacy" className="text-primary underline hover:no-underline">Privacy Policy</Link>{' '}
                  and applicable UK data protection law including UK GDPR.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">10. Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">11. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  If you have questions about these Terms, please contact us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline hover:no-underline">{CONTACT_EMAIL}</a>.
                </p>
              </section>

            </div>
          )}

          {/* Footer nav */}
          <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </div>

        </div>
      </div>
    </>
  );
}
