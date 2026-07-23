import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { MessageSquareWarning } from 'lucide-react';
import { GROUP_CONTACT_EMAIL, GROUP_PHONE_DISPLAY, GROUP_PHONE_HREF, PLAN_STUDIO_EMAIL } from '@/lib/contact-details';

export default function ComplaintsPolicyPage() {
  return <>
    <Helmet>
      <title>Complaints Policy — Planyx</title>
      <meta name="description" content="How to make, escalate and resolve a complaint about Planyx." />
      <link rel="canonical" href="https://japlanstudio.jagroupservices.co.uk/complaints" />
    </Helmet>
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-6 py-12 text-foreground">
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><MessageSquareWarning className="h-5 w-5 text-primary" /></div>
          <div><h1 className="text-2xl font-bold">Complaints Policy</h1><p className="text-sm text-muted-foreground">Effective 18 July 2026 · Version 1.0</p></div>
        </header>
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <section><p>Planyx is operated by JA Group Services Ltd (company number 16314179), registered at 167–169 Great Portland Street, 5th Floor, London, W1W 5PF. We aim to handle complaints fairly, accessibly and without unreasonable delay.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">1. What this policy covers</h2><p>You may complain about our platform, subscription administration, customer support, accessibility, privacy handling, builder outputs or our own conduct. Complaints about an activity purchased from Headout, GetYourGuide or another provider must normally be raised with that provider because it supplies and fulfils the booking.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">2. How to complain</h2><p>Email <a className="text-primary underline" href={`mailto:${PLAN_STUDIO_EMAIL}`}>{PLAN_STUDIO_EMAIL}</a>, use the Support Centre while signed in, or telephone <a className="text-primary underline" href={GROUP_PHONE_HREF}>{GROUP_PHONE_DISPLAY}</a>. Include your account email, what happened, relevant dates or references, the outcome you seek and any supporting evidence. Do not send passwords or full payment-card details.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">3. Our response stages</h2><ol className="list-decimal space-y-2 pl-5"><li><strong className="text-foreground">Acknowledgement:</strong> normally within two working days.</li><li><strong className="text-foreground">Stage 1 review:</strong> we aim to provide a substantive response within ten working days. If more time is needed, we will explain why and provide an updated date.</li><li><strong className="text-foreground">Stage 2 escalation:</strong> ask for a senior review within 14 days of our Stage 1 response. We aim to issue our final response within a further ten working days.</li></ol></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">4. Outcomes</h2><p>Depending on the circumstances, we may explain our decision, correct an account or service error, restore an entitlement, apologise, improve our process, or provide a refund or other remedy where required by law or appropriate under our terms.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">5. Privacy and external options</h2><p>We use complaint information to investigate, respond, keep an audit record and improve the service. Privacy complaints may also be raised with the Information Commissioner’s Office. Nothing in this policy removes statutory consumer rights or prevents you from seeking independent advice or using an available court or dispute-resolution process.</p></section>
          <section><h2 className="mb-2 text-lg font-semibold text-foreground">6. Contact</h2><p>Escalations may be sent to <a className="text-primary underline" href={`mailto:${GROUP_CONTACT_EMAIL}`}>{GROUP_CONTACT_EMAIL}</a> with “Planyx complaint escalation” in the subject line.</p></section>
        </div>
        <nav className="mt-12 flex flex-wrap gap-4 border-t border-border pt-6 text-sm text-muted-foreground"><Link to="/terms">Terms &amp; Conditions</Link><Link to="/privacy">Privacy Policy</Link><Link to="/cookies">Cookie Policy</Link><Link to="/contact">Contact</Link></nav>
      </article>
    </main>
  </>;
}
