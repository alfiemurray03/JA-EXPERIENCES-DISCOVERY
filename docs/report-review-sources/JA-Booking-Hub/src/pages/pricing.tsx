import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, X, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const plans = [
  {
    name: 'Free',
    price: 0,
    annualPrice: 0,
    lifetimePrice: null,
    description: 'Get started with the basics',
    badge: null,
    highlight: false,
    comingSoon: false,
    cta: 'Start Free',
    href: '/register',
  },
  {
    name: 'Starter',
    price: 9.99,
    annualPrice: 7.99,
    lifetimePrice: 149,
    description: 'For growing businesses',
    badge: null,
    highlight: false,
    comingSoon: true,
    cta: 'Coming Soon',
    href: '/register',
  },
  {
    name: 'Professional',
    price: 19.99,
    annualPrice: 15.99,
    lifetimePrice: 299,
    description: 'For established businesses',
    badge: 'Most Popular',
    highlight: true,
    comingSoon: true,
    cta: 'Coming Soon',
    href: '/register',
  },
  {
    name: 'Business',
    price: 39.99,
    annualPrice: 31.99,
    lifetimePrice: 499,
    description: 'For scaling operations',
    badge: null,
    highlight: false,
    comingSoon: true,
    cta: 'Coming Soon',
    href: '/register',
  },
];

type FeatureValue = boolean | string;

const featureRows: { category: string; features: { label: string; values: FeatureValue[] }[] }[] = [
  {
    category: 'Bookings',
    features: [
      { label: 'Monthly appointments', values: ['20', '100', 'Unlimited', 'Unlimited'] },
      { label: 'Online booking page', values: [true, true, true, true] },
      { label: 'Business subdomain', values: [true, true, true, true] },
      { label: 'Custom domain', values: [false, false, true, true] },
      { label: 'Multiple locations', values: [false, false, false, true] },
    ],
  },
  {
    category: 'Payments',
    features: [
      { label: 'Stripe payments', values: [false, true, true, true] },
      { label: 'Deposit collection', values: [false, true, true, true] },
      { label: 'Full payment online', values: [false, true, true, true] },
      { label: 'Memberships', values: [false, false, false, true] },
      { label: 'Loyalty programme', values: [false, false, false, true] },
    ],
  },
  {
    category: 'Staff & Services',
    features: [
      { label: 'Staff members', values: ['1', '2', '10', 'Unlimited'] },
      { label: 'Services', values: ['5', '20', 'Unlimited', 'Unlimited'] },
      { label: 'Staff scheduling', values: [false, true, true, true] },
    ],
  },
  {
    category: 'Customer Experience',
    features: [
      { label: 'Email reminders', values: [false, true, true, true] },
      { label: 'Booking confirmations', values: [true, true, true, true] },
      { label: 'Customer management', values: [false, true, true, true] },
      { label: 'Reviews & ratings', values: [false, false, true, true] },
      { label: 'Photo gallery', values: [false, false, true, true] },
    ],
  },
  {
    category: 'Branding',
    features: [
      { label: 'JABooking branding', values: [true, true, false, false] },
      { label: 'Remove branding', values: [false, false, true, true] },
    ],
  },
  {
    category: 'Reporting',
    features: [
      { label: 'Basic reports', values: [false, true, true, true] },
      { label: 'Advanced reporting', values: [false, false, true, true] },
      { label: 'Revenue analytics', values: [false, false, true, true] },
    ],
  },
  {
    category: 'Support',
    features: [
      { label: 'Email support', values: [true, true, true, true] },
      { label: 'Priority support', values: [false, false, false, true] },
    ],
  },
];

const faqs = [
  {
    q: 'Can I start for free with no credit card?',
    a: 'Yes. The Free plan is completely free forever with no credit card required. You can create your booking page and start taking appointments immediately.',
  },
  {
    q: 'When are paid plans launching?',
    a: 'Paid plans are coming soon. Sign up for a free account now and you\'ll be the first to know when Starter, Professional, and Business plans go live — along with early access pricing.',
  },
  {
    q: 'What is the Lifetime plan?',
    a: 'The Lifetime option lets you pay once and use that plan tier forever — no monthly or annual fees. Lifetime pricing will be available at launch for Starter (£149), Professional (£299), and Business (£499).',
  },
  {
    q: 'What happens when I reach my appointment limit on the Free plan?',
    a: 'On the Free plan, once you reach 20 appointments in a month, new bookings will be paused until the next month or until you upgrade to a paid plan.',
  },
  {
    q: 'Can I cancel my subscription at any time?',
    a: 'Yes. You can cancel your subscription at any time. You will retain access to your paid plan until the end of your billing period. Lifetime plans are non-refundable after purchase.',
  },
  {
    q: 'Do I need a Stripe account to accept payments?',
    a: 'Yes. To accept online payments, you will need to connect a Stripe account. This will be available on the Starter plan and above when paid plans launch.',
  },
  {
    q: 'Is there a contract or minimum term?',
    a: 'No contracts. All monthly and annual plans are flexible — upgrade, downgrade or cancel at any time.',
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | 'lifetime'>('monthly');

  return (
    <>
      <Helmet>
        <title>Pricing — JABooking</title>
        <meta name="description" content="Simple, transparent pricing for JABooking. Free plan available. Paid plans coming soon — Starter, Professional, Business with monthly, annual and lifetime options." />
        <link rel="canonical" href="https://jabooking.jagroupservices.co.uk/pricing" />
      </Helmet>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-slate-50 to-white pt-16 pb-12 text-center">
          <div className="container mx-auto px-4 lg:px-6">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-full border border-indigo-100 mb-5">
                <Zap size={14} />
                Paid plans coming soon — sign up free now
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
                Simple, Transparent Pricing
              </motion.h1>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Start free today. Paid plans — including a one-off Lifetime option — are launching soon. No hidden fees, no contracts.
              </motion.p>
              <motion.div variants={fadeUp} className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-white shadow text-[#0F172A]' : 'text-muted-foreground'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-white shadow text-[#0F172A]' : 'text-muted-foreground'}`}
                >
                  Annual
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">Save 20%</span>
                </button>
                <button
                  onClick={() => setBillingCycle('lifetime')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'lifetime' ? 'bg-white shadow text-[#0F172A]' : 'text-muted-foreground'}`}
                >
                  Lifetime
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">One-off</span>
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Plan cards */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {plans.map((plan, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`relative rounded-2xl p-6 border-2 flex flex-col ${
                    plan.highlight
                      ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20'
                      : 'border-border bg-white'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        ⭐ {plan.badge}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-lg ${plan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                      {plan.name}
                    </h3>
                    {plan.comingSoon && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${plan.highlight ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mb-4 ${plan.highlight ? 'text-indigo-200' : 'text-muted-foreground'}`}>
                    {plan.description}
                  </p>
                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>Free</span>
                    ) : billingCycle === 'lifetime' && plan.lifetimePrice ? (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                            £{plan.lifetimePrice}
                          </span>
                          <span className={`text-sm mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-muted-foreground'}`}>once</span>
                        </div>
                        <p className={`text-xs mt-1 ${plan.highlight ? 'text-indigo-200' : 'text-muted-foreground'}`}>Pay once, use forever</p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                            £{billingCycle === 'annual' ? plan.annualPrice : plan.price}
                          </span>
                          <span className={`text-sm mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-muted-foreground'}`}>/mo</span>
                        </div>
                        {billingCycle === 'annual' && (
                          <p className={`text-xs mt-1 ${plan.highlight ? 'text-indigo-200' : 'text-muted-foreground'}`}>Billed annually</p>
                        )}
                      </div>
                    )}
                  </div>
                  <Link to={plan.comingSoon ? '#' : plan.href} className="mt-auto">
                    <Button
                      disabled={plan.comingSoon}
                      className={`w-full font-semibold ${
                        plan.comingSoon
                          ? plan.highlight
                            ? 'bg-white/20 text-white/60 cursor-not-allowed'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : plan.highlight
                          ? 'bg-white text-primary hover:bg-indigo-50'
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <p className="text-center text-sm text-muted-foreground mt-6">
              Paid plans are coming soon. Sign up free now and be first to know when they launch.
            </p>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-2 text-center">Full Feature Comparison</h2>
            <p className="text-center text-sm text-muted-foreground mb-8">Paid plan features shown below — available when plans launch.</p>
            <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
              {/* Header row */}
              <div className="grid grid-cols-5 bg-slate-50 border-b border-border">
                <div className="p-4 col-span-1" />
                {plans.map((plan, i) => (
                  <div key={i} className={`p-4 text-center ${plan.highlight ? 'bg-primary/5' : ''}`}>
                    <p className={`font-semibold text-sm ${plan.highlight ? 'text-primary' : 'text-[#0F172A]'}`}>
                      {plan.name}
                    </p>
                    {plan.comingSoon && (
                      <span className="text-xs text-slate-400 font-medium">Coming Soon</span>
                    )}
                  </div>
                ))}
              </div>

              {featureRows.map((section, si) => (
                <div key={si}>
                  <div className="px-4 py-3 bg-slate-50/80 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section.category}</p>
                  </div>
                  {section.features.map((feat, fi) => (
                    <div
                      key={fi}
                      className="grid grid-cols-5 border-b border-border/50 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="p-4 col-span-1">
                        <p className="text-sm text-[#0F172A]">{feat.label}</p>
                      </div>
                      {feat.values.map((val, vi) => (
                        <div key={vi} className={`p-4 text-center flex items-center justify-center ${plans[vi].highlight ? 'bg-primary/5' : ''}`}>
                          {typeof val === 'boolean' ? (
                            val ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <X size={16} className="text-slate-300" />
                            )
                          ) : (
                            <span className="text-sm font-medium text-[#0F172A]">{val}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-6 max-w-3xl">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-8 text-center">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-5 data-[state=open]:shadow-sm">
                  <AccordionTrigger className="text-sm font-semibold text-[#0F172A] hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground pb-4 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-white text-center">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-indigo-200 mb-8 max-w-md mx-auto">
              Create your free account today. No credit card required.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-indigo-50 font-semibold px-10">
                Start for Free
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
