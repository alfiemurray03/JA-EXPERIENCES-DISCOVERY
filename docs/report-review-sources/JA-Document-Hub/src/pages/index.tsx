import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  FileText,
  Download,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Lock,
  Star as _Star,
  PenLine,
  Mail,
  Receipt,
  FileSignature,
  ClipboardList,
  BarChart2,
  Users,
  TrendingUp,
  CheckSquare,
  BookTemplate,
} from 'lucide-react';
import { useSiteSettings } from '@/lib/site-settings-context';

const features = [
  {
    icon: FileText,
    title: '10 Professional Builders',
    description: 'Letters, invoices, contracts, policies, forms, reports, minutes, proposals, checklists, and emails — all in one place.',
  },
  {
    icon: Zap,
    title: 'Generate in Minutes',
    description: 'Answer a few simple questions and your document is generated instantly — no specialist knowledge required.',
  },
  {
    icon: Download,
    title: 'Download & Print',
    description: 'Download your documents as PDF. Print directly from your browser. Your documents, ready when you need them.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Your documents are handled with care. We operate in compliance with UK GDPR and take data protection seriously.',
  },
  {
    icon: BookTemplate,
    title: 'Document Library',
    description: 'Save, organise, and manage all your documents in one place. Available on paid plans — Personal and above.',
  },
  {
    icon: Lock,
    title: 'Custom Branding',
    description: 'Add your own logo, organisation name, and contact details to every document. Available on Personal plan and above.',
  },
];

const BUILDERS = [
  { icon: PenLine,       label: 'Letter Builder',    route: '/letter-builder',    color: '#1B4F8A', desc: 'Formal letters, complaints, HR, cover letters' },
  { icon: Mail,          label: 'Email Builder',      route: '/email-builder',     color: '#7c3aed', desc: 'Professional emails with structured sections' },
  { icon: Receipt,       label: 'Invoice Builder',    route: '/invoice-builder',   color: '#b45309', desc: 'Invoices, quotes, credit notes, receipts' },
  { icon: FileSignature, label: 'Contract Builder',   route: '/contract-builder',  color: '#dc2626', desc: 'Service agreements, NDAs, employment contracts' },
  { icon: Shield,        label: 'Policy Builder',     route: '/policy-builder',    color: '#16a34a', desc: 'Privacy, H&S, safeguarding, compliance policies' },
  { icon: ClipboardList, label: 'Form Builder',       route: '/form-builder',      color: '#0891b2', desc: 'Booking, consent, feedback, registration forms' },
  { icon: BarChart2,     label: 'Report Builder',     route: '/report-builder',    color: '#ea580c', desc: 'Incident, finance, board, project reports' },
  { icon: Users,         label: 'Minutes Builder',    route: '/minutes-builder',   color: '#7c3aed', desc: 'Meeting minutes, agendas, action logs' },
  { icon: TrendingUp,    label: 'Proposal Builder',   route: '/proposal-builder',  color: '#be185d', desc: 'Business, grant, tender, project proposals' },
  { icon: CheckSquare,   label: 'Checklist Builder',  route: '/checklist-builder', color: '#65a30d', desc: 'Onboarding, compliance, audit checklists' },
];




const plans = [
  {
    name: 'Free',
    price: '£0',
    period: '/forever',
    features: ['1 free template demo', 'PDF export', 'Browse full catalogue'],
    cta: 'Try for free',
    href: '/register',
    highlight: false,
    trial: false,
    note: 'No saving or branding',
  },
  {
    name: 'Personal',
    price: '£5.99',
    period: '/month',
    features: ['Free & Standard templates', 'Save up to 3 drafts', '14-day retention', 'PDF export', 'Custom branding & logo'],
    cta: 'Start free trial',
    href: '/register',
    highlight: false,
    trial: true,
    note: null,
  },
  {
    name: 'Standard',
    price: '£7.99',
    period: '/month',
    features: ['Free & Standard templates', 'Save up to 5 drafts', '14-day retention', 'PDF export', 'Custom branding & logo'],
    cta: 'Start free trial',
    href: '/register',
    highlight: false,
    trial: true,
    note: null,
  },
  {
    name: 'Professional',
    price: '£14.99',
    period: '/month',
    features: ['All templates including Premium', 'Save up to 10 drafts', '30-day retention', 'Advanced layouts', 'Multiple brand profiles'],
    cta: 'Start free trial',
    href: '/register',
    highlight: true,
    trial: true,
    note: null,
  },
];

export default function HomePage() {
  const { siteName, brandName, tagline } = useSiteSettings();
  const canonicalUrl = 'https://jadocumenthub.jagroupservices.co.uk';
  const title = `${siteName} — Professional Document Builder`;
  const description = `Generate professional documents in minutes. Employment letters, board minutes, privacy policies, HR documents and more. Operated by ${brandName}.`;

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content={canonicalUrl} />
        <meta property="og:title"       content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name"   content={siteName} />
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content={title} />
        <meta name="twitter:description" content={description} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteName,
          url: canonicalUrl,
          description,
          publisher: {
            '@type': 'Organization',
            name: brandName,
            url: 'https://jagroupservices.co.uk',
          },
        })}</script>
      </Helmet>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary via-primary/90 to-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src="/airo-assets/images/pages/home/hero"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' as const }}
            >
              <Badge className="bg-white/20 text-white border-white/30 mb-4 hover:bg-white/20">
                Operated by {brandName}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                {tagline.split(',').length > 1
                  ? <>{tagline.split(',')[0]},{' '}<span className="text-white/80">{tagline.split(',').slice(1).join(',')}</span></>
                  : <>{tagline.split(' ').slice(0, -2).join(' ')}{' '}<span className="text-white/80">{tagline.split(' ').slice(-2).join(' ')}</span></>
                }
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-2xl">
                Create employment letters, board minutes, privacy policies, HR documents and more — quickly, simply, and professionally. Answer a few questions and download your document instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 font-semibold gap-2">
                  <Link to="/register">
                    Get started free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/40 text-white hover:bg-white/10">
                  <Link to="/builders">Browse Builders</Link>
                </Button>
              </div>
              <p className="text-white/60 text-sm mt-4">Free demo available — no credit card required</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '10', label: 'Document Builders' },
              { value: '100+', label: 'Templates Included' },
              { value: 'PDF', label: 'Export Format' },
              { value: 'UK', label: 'Focused & Compliant' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Everything you need to create professional documents</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {siteName} makes it simple for businesses and individuals to create, manage, and export professional documents without specialist knowledge.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07, ease: 'easeOut' as const }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Builders showcase */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">10 builders, 146 templates</h2>
            <p className="text-muted-foreground">From HR letters to board minutes — every document type covered.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
            {BUILDERS.map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.05, ease: 'easeOut' as const }}
                >
                  <Link
                    to={b.route}
                    className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all text-center group"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform"
                      style={{ background: b.color + '18' }}
                    >
                      <Icon className="w-5 h-5" style={{ color: b.color }} />
                    </div>
                    <span className="text-xs font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">{b.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{b.desc}</span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <div className="text-center">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/builders">
                View All Builders
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">How it works</h2>
            <p className="text-muted-foreground">Create your document in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Choose a Builder', desc: 'Pick the document type you need from our 10 specialist builders.' },
              { step: '02', title: 'Answer the Questions', desc: 'Fill in the guided form with your specific details. Takes just a few minutes.' },
              { step: '03', title: 'Download & Use', desc: 'Your document is generated instantly. Download as PDF and use it straight away.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1, ease: 'easeOut' as const }}
                className="text-center"
              >
                <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold text-lg">{item.step}</span>
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* Testimonials section removed */}

      {/* Pricing */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Simple, transparent pricing</h2>
            <p className="text-muted-foreground">Try for free — upgrade when you need saving, branding, and more templates.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${plan.highlight ? 'border-primary shadow-lg ring-2 ring-primary/20' : ''}`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 text-xs">Most Popular</Badge>
                  </div>
                )}
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="mb-4">
                    <h3 className="font-bold text-base text-foreground">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                      <span className="text-muted-foreground text-xs">{plan.period}</span>
                    </div>
                    {plan.trial
                      ? <p className="text-xs text-primary font-medium mt-1">14-day free trial</p>
                      : plan.note
                        ? <p className="text-xs text-muted-foreground mt-1">{plan.note}</p>
                        : <p className="text-xs text-muted-foreground mt-1">Contact for pricing</p>
                    }
                  </div>
                  <ul className="space-y-1.5 flex-1 mb-5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        <span className="text-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    variant={plan.highlight ? 'default' : 'outline'}
                    className="w-full text-sm"
                  >
                    <Link to={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Organisation plans with multiple user seats also available.{' '}
            <Link to="/pricing" className="text-primary hover:underline">See all plans and full details</Link>
          </p>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-8 bg-amber-50 border-t border-amber-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Important:</strong> {siteName} is a document creation tool only. Documents are template-based and do not constitute legal, financial, tax, or professional advice of any kind.{' '}
            {siteName} is operated by {brandName}. Users are responsible for the accuracy, suitability, and legal compliance of all documents they create.
            Always seek qualified professional advice where required.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to create your first document?</h2>
          <p className="text-white/80 mb-8">Try a free demo — no credit card required. Upgrade to save your work, add branding, and access more templates.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild className="bg-white text-primary hover:bg-white/90 font-semibold gap-2">
              <Link to="/register">
                Get started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/40 text-white hover:bg-white/10">
              <Link to="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
