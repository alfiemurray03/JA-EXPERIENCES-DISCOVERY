import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ArrowRight, Check, ChevronDown, ChevronUp, Clock, Compass, HeartHandshake, Route, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ServicePlan {
  id: string;
  plan_name: string;
  plan_type: string;
  price_label: string;
  price_pence: number;
  delivery_time: string;
  revisions: string;
  description: string;
  button_label: string;
  is_featured: number;
}

const JA_PLAN_STUDIO_PLANS: ServicePlan[] = [
  { id: 'free_discovery_enquiry', plan_name: 'Free Discovery Enquiry', plan_type: 'Free', price_label: '£0', price_pence: 0, delivery_time: '1 to 3 working days', revisions: 'Initial review and recommendation', description: 'A no-cost starting point for questions and support-route guidance.', button_label: 'Start a free enquiry', is_featured: 0 },
  { id: 'destination_discovery_standard', plan_name: 'Destination Discovery Plan', plan_type: 'Standard', price_label: '£49', price_pence: 4900, delivery_time: '3–5 working days', revisions: '1 minor revision', description: 'A focused destination discovery plan for early-stage trip ideas.', button_label: 'Buy now securely', is_featured: 1 },
  { id: 'itinerary_experience_standard', plan_name: 'Itinerary and Experience Planning Plan', plan_type: 'Standard', price_label: '£89', price_pence: 8900, delivery_time: '5–7 working days', revisions: '1 minor revision', description: 'A structured itinerary and experience planning service.', button_label: 'Buy now securely', is_featured: 1 },
  { id: 'complete_planning_standard', plan_name: 'Complete Discovery and Planning Guidance Plan', plan_type: 'Standard', price_label: '£149', price_pence: 14900, delivery_time: '7–10 working days', revisions: '2 minor revisions', description: 'A complete discovery and planning guidance package.', button_label: 'Buy now securely', is_featured: 1 },
  { id: 'destination_discovery_social', plan_name: 'Destination Discovery Social Tariff', plan_type: 'Social tariff', price_label: '£29', price_pence: 2900, delivery_time: '3–5 working days', revisions: '1 minor revision', description: 'Reduced-rate destination discovery planning.', button_label: 'Buy now securely', is_featured: 0 },
  { id: 'itinerary_experience_social', plan_name: 'Itinerary Planning Social Tariff', plan_type: 'Social tariff', price_label: '£55', price_pence: 5500, delivery_time: '5–7 working days', revisions: '1 minor revision', description: 'Reduced-rate itinerary and experience planning.', button_label: 'Buy now securely', is_featured: 0 },
  { id: 'complete_planning_social', plan_name: 'Complete Planning Social Tariff', plan_type: 'Social tariff', price_label: '£95', price_pence: 9500, delivery_time: '7–10 working days', revisions: '2 minor revisions', description: 'Reduced-rate complete planning guidance.', button_label: 'Buy now securely', is_featured: 0 },
];

const FAQS = [
  { q: 'Are these subscriptions?', a: 'No. These are JA Plan Studio planning-service packages with a one-off price. The previously displayed Personal, Standard, Professional and Organisation subscription tiers are not part of this public catalogue.' },
  { q: 'What does JA Plan Studio help me build?', a: 'Depending on the package, we help structure destination ideas, itinerary and experience planning, practical checks, priorities and next steps into a clear personalised plan.' },
  { q: 'What is the Free Discovery Enquiry?', a: 'It is a no-cost starting point for questions, an initial review and guidance towards the most suitable support route.' },
  { q: 'What is a social tariff?', a: 'Social-tariff packages provide reduced-rate versions of the core planning services. Contact JA Plan Studio if you need help understanding eligibility or choosing the right option.' },
  { q: 'Does JA Plan Studio make bookings?', a: 'No. JA Plan Studio provides discovery and planning guidance. Third-party bookings, prices, availability, refunds and provider terms remain between you and the relevant provider.' },
];

function PlanCard({ plan }: { plan: ServicePlan }) {
  const isFree = plan.price_pence === 0;
  const featured = Boolean(plan.is_featured) && plan.plan_type === 'Standard';
  const href = isFree
    ? `/contact?plan=${encodeURIComponent(plan.id)}`
    : `/create-checkout-session?plan=${encodeURIComponent(plan.id)}`;

  return (
    <article className={`relative flex h-full flex-col rounded-2xl border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${featured ? 'border-primary ring-2 ring-primary/15 bg-primary/[0.03]' : 'border-border bg-card'}`}>
      {featured && <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground">JA Plan Studio package</Badge>}
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">{plan.plan_type}</p>
      <h3 className="text-xl font-bold leading-tight text-foreground">{plan.plan_name}</h3>
      <div className="my-5 text-4xl font-extrabold text-foreground">{plan.price_label}</div>
      <p className="mb-5 text-sm leading-relaxed text-muted-foreground">{plan.description}</p>
      <ul className="mb-6 space-y-3 text-sm text-foreground">
        <li className="flex items-start gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><strong>Delivery:</strong> {plan.delivery_time}</span></li>
        <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{plan.revisions}</span></li>
        <li className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>Personalised JA Plan Studio planning output</span></li>
      </ul>
      <a href={href} className="mt-auto block">
        <Button className="w-full gap-2">{plan.button_label || (isFree ? 'Start a free enquiry' : 'Choose this plan')} <ArrowRight className="h-4 w-4" /></Button>
      </a>
    </article>
  );
}

export default function PricingPage() {
  const [plans, setPlans] = useState<ServicePlan[]>(JA_PLAN_STUDIO_PLANS);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchParams] = useSearchParams();
  const cancelled = searchParams.get('payment') === 'cancelled' || searchParams.get('checkout') === 'cancelled';

  useEffect(() => {
    fetch('/plans-data', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Plan catalogue unavailable')))
      .then(data => {
        if (!Array.isArray(data.plans)) return;
        const recognised = new Set(JA_PLAN_STUDIO_PLANS.map(plan => plan.id));
        const current = data.plans.filter((plan: ServicePlan) => recognised.has(plan.id));
        if (current.length) setPlans(current);
      })
      .catch(() => {});
  }, []);

  const standardPlans = plans.filter(plan => plan.plan_type !== 'Social tariff');
  const socialPlans = plans.filter(plan => plan.plan_type === 'Social tariff');

  return (
    <>
      <Helmet>
        <title>Plans & Pricing | JA Plan Studio</title>
        <meta name="description" content="Choose a JA Plan Studio discovery, itinerary or complete planning package, including reduced-rate social-tariff options." />
        <link rel="canonical" href="https://japlanstudio.jagroupservices.co.uk/pricing" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <section className="border-b border-border bg-gradient-to-b from-primary/10 to-background px-4 py-20 text-center">
          <Badge variant="outline" className="mb-5">JA Plan Studio plans</Badge>
          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">Planning support built around the plan you need</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Choose free discovery support, a destination plan, an itinerary and experience plan, or complete discovery and planning guidance. These are one-off JA Plan Studio packages with clear delivery times.</p>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          {cancelled && <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">Checkout was cancelled. No payment was taken.</div>}

          <section aria-labelledby="standard-plans" className="mb-20">
            <div className="mb-9 text-center">
              <h2 id="standard-plans" className="text-3xl font-bold text-foreground">Discovery and planning packages</h2>
              <p className="mt-2 text-muted-foreground">The existing JA Plan Studio catalogue, with clear one-off prices and delivery times.</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{standardPlans.map(plan => <PlanCard key={plan.id} plan={plan} />)}</div>
          </section>

          <section aria-labelledby="social-plans" className="mb-20 rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 sm:p-10 dark:border-emerald-800 dark:bg-emerald-950/20">
            <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"><HeartHandshake className="h-6 w-6" /></div>
              <div><h2 id="social-plans" className="text-2xl font-bold text-foreground">Social-tariff planning packages</h2><p className="mt-1 text-sm text-muted-foreground">Reduced-rate versions of our destination, itinerary and complete planning services.</p></div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">{socialPlans.map(plan => <PlanCard key={plan.id} plan={plan} />)}</div>
          </section>

          <section className="mb-20">
            <div className="mb-9 text-center"><Badge variant="outline" className="mb-3">Building your plan</Badge><h2 className="text-3xl font-bold text-foreground">What JA Plan Studio helps you build</h2></div>
            <div className="grid gap-5 md:grid-cols-3">
              {[
                { icon: Compass, title: 'Destination discovery', text: 'Turn early ideas, preferences and priorities into a focused destination direction.' },
                { icon: Route, title: 'Itinerary and experiences', text: 'Structure timings, experience ideas, practical checks and the steps needed before booking.' },
                { icon: Sparkles, title: 'Complete planning guidance', text: 'Bring discovery, itinerary thinking and practical planning guidance together in one complete package.' },
              ].map(item => <article key={item.title} className="rounded-2xl border border-border bg-card p-6"><item.icon className="mb-4 h-6 w-6 text-primary" /><h3 className="font-bold text-foreground">{item.title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p></article>)}
            </div>
          </section>

          <section className="mx-auto max-w-3xl">
            <h2 className="mb-7 text-center text-2xl font-bold text-foreground">Frequently asked questions</h2>
            <div className="space-y-3">{FAQS.map((faq, index) => <div key={faq.q} className="overflow-hidden rounded-xl border border-border bg-card"><button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-foreground">{faq.q}{openFaq === index ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}</button>{openFaq === index && <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>}</div>)}</div>
            <div className="mt-10 text-center"><p className="mb-4 text-muted-foreground">Not sure which planning package fits?</p><Button asChild variant="outline"><Link to="/contact">Contact JA Plan Studio <ArrowRight className="ml-2 h-4 w-4" /></Link></Button></div>
          </section>
        </div>
      </main>
    </>
  );
}
