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

export default function TermsPage() {
  const branding = useBranding();

  return (
    <>
      <Helmet>
        <title>Terms of Service — {branding.platform_name}</title>
        <meta name="description" content={`Terms of Service for ${branding.platform_name}. Read the terms governing your use of the platform.`} />
        <link rel="canonical" href={`${APP_URL}/legal/terms`} />
      </Helmet>
      <LegalLayout title="Terms of Service" lastUpdated="June 2025">
        <Section title="1. Acceptance of terms">
          <p>
            By accessing or using {branding.platform_name} ("the Service"), operated by JA Group Services Ltd,
            you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.
          </p>
        </Section>

        <Section title="2. Description of service">
          <p>
            {branding.platform_name} provides a digital business card platform that allows users to create,
            customise, and share professional digital profiles via a unique link or QR code. The Service is
            provided by JA Group Services Ltd and is accessible at{' '}
            <a href="https://jasmartprofile.jagroupservices.co.uk" className="text-primary hover:underline">
              jasmartprofile.jagroupservices.co.uk
            </a>.
          </p>
        </Section>

        <Section title="3. Account registration">
          <p>
            To use the Service, you must sign in via JA Group Services Secure Access (our identity provider).
            By creating an account, you confirm that:
          </p>
          <ul className="space-y-2 mt-2">
            <Li>You are at least 18 years of age</Li>
            <Li>The information you provide is accurate and up to date</Li>
            <Li>You are responsible for maintaining the security of your account</Li>
            <Li>You will notify us immediately of any unauthorised use of your account</Li>
          </ul>
        </Section>

        <Section title="4. Acceptable use">
          <p>You agree not to use the Service to:</p>
          <ul className="space-y-2 mt-2">
            <Li>Post content that is unlawful, harmful, defamatory, or fraudulent</Li>
            <Li>Impersonate any person or entity</Li>
            <Li>Distribute spam, malware, or unsolicited communications</Li>
            <Li>Attempt to gain unauthorised access to any part of the Service</Li>
            <Li>Scrape, crawl, or harvest data from the platform without permission</Li>
            <Li>Violate any applicable laws or regulations</Li>
          </ul>
        </Section>

        <Section title="5. Your content">
          <p>
            You retain ownership of all content you upload or create on the Service ("Your Content").
            By publishing a profile, you grant JA Group Services Ltd a non-exclusive, royalty-free licence
            to display Your Content as part of operating the Service.
          </p>
          <p>
            You are solely responsible for Your Content and warrant that it does not infringe any third-party
            rights or violate any applicable laws.
          </p>
        </Section>

        <Section title="6. Plans and billing">
          <p>
            The Service offers a free plan and paid plans (currently marked as Coming Soon). When paid plans
            launch, the following terms will apply:
          </p>
          <ul className="space-y-2 mt-2">
            <Li>Subscription fees are billed monthly in advance</Li>
            <Li>All prices are in GBP and inclusive of applicable taxes</Li>
            <Li>You may cancel your subscription at any time; access continues until the end of the billing period</Li>
            <Li>Refunds are not provided for partial billing periods unless required by law</Li>
          </ul>
        </Section>

        <Section title="7. Intellectual property">
          <p>
            The {branding.platform_name} platform, including its design, code, branding, and features,
            is the intellectual property of JA Group Services Ltd. You may not copy, modify, distribute,
            or create derivative works without our prior written consent.
          </p>
        </Section>

        <Section title="8. Availability and modifications">
          <p>
            We aim to provide a reliable service but do not guarantee uninterrupted availability.
            We reserve the right to modify, suspend, or discontinue any part of the Service at any time,
            with reasonable notice where possible.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the fullest extent permitted by law, JA Group Services Ltd shall not be liable for any
            indirect, incidental, special, or consequential damages arising from your use of the Service.
            Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>
        </Section>

        <Section title="10. Termination">
          <p>
            We may suspend or terminate your account if you breach these Terms. You may delete your account
            at any time via your account settings or by contacting us. Upon termination, your public profile
            will be removed and your data handled in accordance with our Privacy Policy.
          </p>
        </Section>

        <Section title="11. Governing law">
          <p>
            These Terms are governed by the laws of England and Wales. Any disputes shall be subject to
            the exclusive jurisdiction of the courts of England and Wales.
          </p>
        </Section>

        <Section title="12. Changes to these terms">
          <p>
            We may update these Terms from time to time. We will notify you of material changes by posting
            a notice on the platform or by email. Continued use of the Service after changes constitutes
            acceptance of the updated Terms.
          </p>
        </Section>

        <Section title="13. Contact">
          <p>For questions about these Terms, contact us at:</p>
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
