import { Helmet } from '@dr.pogodin/react-helmet';
import LegalLayout from '@/components/legal/LegalLayout';
import { useBranding } from '@/lib/branding';

const APP_URL = 'https://jasmartprofile.jagroupservices.co.uk';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-foreground mb-4">{title}</h2>
      <div className="space-y-3 text-muted-foreground text-sm leading-relaxed">{children}</div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-primary mt-0.5 flex-shrink-0">•</span>
      <span>{children}</span>
    </li>
  );
}

export default function PrivacyPage() {
  const branding = useBranding();

  return (
    <>
      <Helmet>
        <title>Privacy Policy — {branding.platform_name}</title>
        <meta name="description" content={`Privacy Policy for ${branding.platform_name}. Learn how JA Group Services collects, uses, and protects your personal data.`} />
        <link rel="canonical" href={`${APP_URL}/legal/privacy`} />
      </Helmet>
      <LegalLayout title="Privacy Policy" lastUpdated="June 2025">
        <Section title="1. Who we are">
          <p>
            {branding.platform_name} is a service operated by JA Group Services Ltd ("we", "us", "our").
            Our platform allows users to create and share digital business card profiles.
          </p>
          <p>
            If you have any questions about this Privacy Policy, please contact us at{' '}
            <a href={`mailto:${branding.contact_email}`} className="text-primary hover:underline">
              {branding.contact_email}
            </a>.
          </p>
        </Section>

        <Section title="2. What data we collect">
          <p>We collect the following categories of personal data:</p>
          <ul className="space-y-2 mt-2">
            <Li><strong className="text-foreground">Account data:</strong> Your name and email address, provided via JA Group Services Secure Access when you sign in.</Li>
            <Li><strong className="text-foreground">Profile data:</strong> Information you voluntarily add to your digital profile — job title, company, bio, phone number, website, and social links.</Li>
            <Li><strong className="text-foreground">Usage data:</strong> Pages visited, features used, and interaction data collected for analytics and service improvement.</Li>
            <Li><strong className="text-foreground">Technical data:</strong> IP address, browser type, device type, and session data required to operate the service securely.</Li>
            <Li><strong className="text-foreground">Enquiry data:</strong> Messages sent to you via your public profile contact form.</Li>
          </ul>
        </Section>

        <Section title="3. How we use your data">
          <p>We use your personal data to:</p>
          <ul className="space-y-2 mt-2">
            <Li>Provide, operate, and maintain the {branding.platform_name} service</Li>
            <Li>Authenticate your identity and manage your account securely</Li>
            <Li>Display your public digital profile to visitors you share your link with</Li>
            <Li>Send you service-related communications (account updates, security notices)</Li>
            <Li>Analyse usage patterns to improve the platform</Li>
            <Li>Comply with legal obligations</Li>
          </ul>
        </Section>

        <Section title="4. Legal basis for processing">
          <p>We process your personal data under the following legal bases (UK GDPR):</p>
          <ul className="space-y-2 mt-2">
            <Li><strong className="text-foreground">Contract:</strong> Processing necessary to provide the service you have signed up for.</Li>
            <Li><strong className="text-foreground">Legitimate interests:</strong> Analytics, security monitoring, and service improvement.</Li>
            <Li><strong className="text-foreground">Legal obligation:</strong> Where we are required to retain or disclose data by law.</Li>
            <Li><strong className="text-foreground">Consent:</strong> Where you have explicitly opted in (e.g. marketing communications).</Li>
          </ul>
        </Section>

        <Section title="5. Data sharing">
          <p>We do not sell your personal data. We may share data with:</p>
          <ul className="space-y-2 mt-2">
            <Li><strong className="text-foreground">JA Group Services Secure Access:</strong> Our identity provider for secure authentication across JA Group Services platforms.</Li>
            <Li><strong className="text-foreground">Hosting providers:</strong> Infrastructure partners who host the platform under data processing agreements.</Li>
            <Li><strong className="text-foreground">Analytics providers:</strong> Aggregated, anonymised usage data only.</Li>
            <Li><strong className="text-foreground">Legal authorities:</strong> Where required by law or to protect our rights.</Li>
          </ul>
        </Section>

        <Section title="6. Data retention">
          <p>
            We retain your account data for as long as your account is active. If you request account deletion,
            we will remove your personal data within 30 days, except where retention is required by law.
            Public profile data is removed immediately upon deletion.
          </p>
        </Section>

        <Section title="7. Your rights">
          <p>Under UK GDPR, you have the right to:</p>
          <ul className="space-y-2 mt-2">
            <Li>Access the personal data we hold about you</Li>
            <Li>Correct inaccurate or incomplete data</Li>
            <Li>Request deletion of your data ("right to be forgotten")</Li>
            <Li>Restrict or object to processing</Li>
            <Li>Data portability — receive your data in a machine-readable format</Li>
            <Li>Withdraw consent at any time (where processing is based on consent)</Li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, contact us at{' '}
            <a href={`mailto:${branding.contact_email}`} className="text-primary hover:underline">
              {branding.contact_email}
            </a>.
          </p>
        </Section>

        <Section title="8. Cookies">
          <p>
            We use cookies and similar technologies to operate the service. For full details, please read our{' '}
            <a href="/legal/cookies" className="text-primary hover:underline">Cookie Policy</a>.
          </p>
        </Section>

        <Section title="9. Security">
          <p>
            We implement appropriate technical and organisational measures to protect your personal data,
            including encrypted connections (HTTPS), secure session management, and access controls.
            No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="10. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes
            by posting a notice on the platform or by email. Continued use of the service after changes
            constitutes acceptance of the updated policy.
          </p>
        </Section>

        <Section title="11. Contact us">
          <p>
            For any privacy-related queries or to exercise your rights, contact JA Group Services at:
          </p>
          <div className="mt-3 p-4 rounded-xl bg-muted/40 border border-border text-sm space-y-1">
            <p className="text-foreground font-medium">JA Group Services Ltd</p>
            <p>
              Email:{' '}
              <a href={`mailto:${branding.contact_email}`} className="text-primary hover:underline">
                {branding.contact_email}
              </a>
            </p>
            <p>
              Website:{' '}
              <a href="https://jasmartprofile.jagroupservices.co.uk" className="text-primary hover:underline">
                jasmartprofile.jagroupservices.co.uk
              </a>
            </p>
          </div>
        </Section>
      </LegalLayout>
    </>
  );
}
