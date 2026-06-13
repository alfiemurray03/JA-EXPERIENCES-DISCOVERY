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

function CookieRow({ name, purpose, duration, type }: { name: string; purpose: string; duration: string; type: string }) {
  return (
    <tr className="border-b border-border/50">
      <td className="py-3 pr-4 text-foreground font-mono text-xs align-top">{name}</td>
      <td className="py-3 pr-4 text-muted-foreground text-xs align-top">{purpose}</td>
      <td className="py-3 pr-4 text-muted-foreground text-xs align-top whitespace-nowrap">{duration}</td>
      <td className="py-3 text-muted-foreground text-xs align-top">{type}</td>
    </tr>
  );
}

export default function CookiesPage() {
  const branding = useBranding();

  return (
    <>
      <Helmet>
        <title>Cookie Policy — {branding.platform_name}</title>
        <meta name="description" content={`Cookie Policy for ${branding.platform_name}. Learn how we use cookies and similar technologies.`} />
        <link rel="canonical" href={`${APP_URL}/legal/cookies`} />
      </Helmet>
      <LegalLayout title="Cookie Policy" lastUpdated="June 2025">
        <Section title="1. What are cookies?">
          <p>
            Cookies are small text files placed on your device when you visit a website. They help the site
            remember your preferences, keep you logged in, and understand how you use the service.
            Similar technologies include local storage and session storage.
          </p>
        </Section>

        <Section title="2. How we use cookies">
          <p>
            {branding.platform_name} uses cookies to operate the service securely and to understand how
            users interact with the platform. We do not use cookies for advertising or to track you across
            third-party websites.
          </p>
        </Section>

        <Section title="3. Cookies we use">
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 pr-4 text-xs font-semibold text-foreground">Name</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-foreground">Purpose</th>
                  <th className="pb-3 pr-4 text-xs font-semibold text-foreground">Duration</th>
                  <th className="pb-3 text-xs font-semibold text-foreground">Type</th>
                </tr>
              </thead>
              <tbody>
                <CookieRow
                  name="ja_smart_profile_session"
                  purpose="Maintains your login session and PKCE authentication state. Required for the service to function."
                  duration="Session / 7 days"
                  type="Essential"
                />
                <CookieRow
                  name="__Host-pkce_*"
                  purpose="Temporary cookie used during the JA Group Services Secure Access sign-in flow to prevent CSRF attacks."
                  duration="5 minutes"
                  type="Essential"
                />
              </tbody>
            </table>
          </div>
          <p className="mt-4">
            We do not currently use analytics cookies, advertising cookies, or third-party tracking cookies.
            If this changes, this policy will be updated and you will be notified.
          </p>
        </Section>

        <Section title="4. Essential cookies">
          <p>
            The cookies listed above are strictly necessary for the Service to function. They cannot be
            disabled without breaking core functionality such as authentication and session management.
            Under UK GDPR and PECR, strictly necessary cookies do not require your consent.
          </p>
        </Section>

        <Section title="5. Managing cookies">
          <p>
            You can control cookies through your browser settings. Most browsers allow you to:
          </p>
          <ul className="space-y-2 mt-2">
            {[
              'View and delete existing cookies',
              'Block cookies from specific websites',
              'Block all third-party cookies',
              'Clear all cookies when you close the browser',
            ].map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Please note that disabling essential cookies will prevent you from signing in to the Service.
            For guidance on managing cookies, visit{' '}
            <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              allaboutcookies.org
            </a>.
          </p>
        </Section>

        <Section title="6. Third-party services">
          <p>
            We use JA Group Services Secure Access for authentication. When you sign in, our identity
            provider may set its own cookies as part of the authentication flow. These are governed by
            JA Group Services' privacy policy.
          </p>
        </Section>

        <Section title="7. Changes to this policy">
          <p>
            We may update this Cookie Policy as the Service evolves. Any significant changes will be
            communicated via the platform or by email. The "last updated" date at the top of this page
            reflects the most recent revision.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>For questions about our use of cookies, contact us at:</p>
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
