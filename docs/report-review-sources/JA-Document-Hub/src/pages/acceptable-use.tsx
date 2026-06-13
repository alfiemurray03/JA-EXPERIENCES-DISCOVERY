import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { FileText, RefreshCw } from 'lucide-react';
import { useSiteSettings } from '@/lib/site-settings-context';

const EFFECTIVE_DATE = '2 June 2026';
const CONTACT_EMAIL = 'support@jagroupservices.co.uk';

interface LegalContent { body: string; effectiveDate: string; version: number; }

export default function AcceptableUsePage() {
  const { siteName, companyName: COMPANY } = useSiteSettings();

  const [liveContent, setLiveContent] = useState<LegalContent | null>(null);
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    fetch('/api/legal?slug=acceptable-use')
      .then(r => r.json())
      .then((d: { success: boolean } & Partial<LegalContent>) => {
        if (d.success && d.body) setLiveContent(d as LegalContent);
      })
      .catch(() => {})
      .finally(() => setLoadingLive(false));
  }, []);

  const effectiveDate = liveContent?.effectiveDate
    ? new Date(liveContent.effectiveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : EFFECTIVE_DATE;

  return (
    <>
      <Helmet>
        <title>Acceptable Use Policy — {siteName}</title>
        <meta name="description" content={`Acceptable Use Policy for ${siteName}. Rules governing platform use.`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-12">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Acceptable Use Policy</h1>
              <p className="text-sm text-muted-foreground">Effective date: {effectiveDate}</p>
            </div>
          </div>

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
            <div className="space-y-8 text-foreground">
              <section>
                <p className="text-muted-foreground leading-relaxed">
                  This Acceptable Use Policy governs what users may and may not do on {siteName}, operated by {COMPANY}.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">1. Permitted Use</h2>
                <p className="text-muted-foreground leading-relaxed">
                  You may use {siteName} to create legitimate business and personal documents for lawful purposes.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">2. Prohibited Use</h2>
                <p className="text-muted-foreground mb-2">You must not use {siteName} to:</p>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                  <li>Create fraudulent, misleading, or illegal documents.</li>
                  <li>Infringe any third-party intellectual property rights.</li>
                  <li>Attempt to gain unauthorised access to the platform or other users' accounts.</li>
                  <li>Transmit malware, spam, or harmful code.</li>
                  <li>Violate any applicable law or regulation.</li>
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">3. Enforcement</h2>
                <p className="text-muted-foreground leading-relaxed">
                  We reserve the right to suspend or terminate accounts that violate this policy without notice.
                </p>
              </section>
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-3">4. Contact</h2>
                <p className="text-muted-foreground leading-relaxed">
                  To report a violation, contact us at{' '}
                  <a href={`mailto:${CONTACT_EMAIL}`} className="text-primary underline hover:no-underline">{CONTACT_EMAIL}</a>.
                </p>
              </section>
            </div>
          )}

          <div className="mt-12 pt-6 border-t border-border flex flex-wrap gap-4 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-foreground transition-colors">Cookie Policy</Link>
          </div>

        </div>
      </div>
    </>
  );
}
