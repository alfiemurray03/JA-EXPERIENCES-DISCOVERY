import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import {
  CreditCard, QrCode, Link2, Mail, BarChart3, Palette,
  Check, Menu, X, ArrowRight, Globe, Phone,
  Linkedin, Twitter, Instagram, Star, Zap, Shield, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useBranding } from '@/lib/branding';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

function DemoProfileCard() {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-2xl scale-110" />
      <div className="relative rounded-3xl border border-white/10 bg-slate-800/90 backdrop-blur-sm p-6 shadow-2xl">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold mb-3 ring-4 ring-blue-500/30">
            AJ
          </div>
          <h3 className="text-white font-bold text-lg">Alex Johnson</h3>
          <p className="text-blue-400 text-sm">Senior Product Designer</p>
          <p className="text-slate-400 text-xs">Available for freelance</p>
        </div>
        {/* Contact buttons */}
        <div className="flex gap-2 mb-4">
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-xl transition-colors">
            <Phone className="w-3 h-3" /> Call
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded-xl transition-colors">
            <Mail className="w-3 h-3" /> Email
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs py-2 rounded-xl transition-colors">
            <Globe className="w-3 h-3" /> Web
          </button>
        </div>
        {/* Social */}
        <div className="flex gap-2 mb-4 justify-center">
          {[Linkedin, Twitter, Instagram].map((Icon, i) => (
            <div key={i} className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300 hover:text-blue-400 hover:bg-slate-600 transition-colors cursor-pointer">
              <Icon className="w-4 h-4" />
            </div>
          ))}
        </div>
        {/* Links */}
        <div className="space-y-2">
          {['Portfolio & Case Studies', 'Book a Consultation'].map((label, i) => (
            <div key={i} className="flex items-center justify-between bg-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-white hover:bg-slate-600/60 transition-colors cursor-pointer">
              <span>{label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </div>
          ))}
        </div>
        {/* Branding */}
        <p className="text-center text-slate-500 text-xs mt-4">Powered by JA Smart Profile</p>
      </div>
    </div>
  );
}

const features = [
  {
    icon: CreditCard,
    title: 'Digital Business Card',
    description: 'Create a stunning digital business card with your photo, contact details, and links. Share it instantly via QR code or link.',
    size: 'large',
    gradient: 'from-blue-500/10 to-blue-600/5',
  },
  {
    icon: QrCode,
    title: 'QR Code Generator',
    description: 'Generate a custom QR code for your profile. Download as PNG and print on physical cards, flyers, or merchandise.',
    size: 'small',
    gradient: 'from-purple-500/10 to-purple-600/5',
  },
  {
    icon: Link2,
    title: 'Custom Links & Buttons',
    description: 'Add unlimited links to your social profiles, website, portfolio, booking page, and more.',
    size: 'small',
    gradient: 'from-cyan-500/10 to-cyan-600/5',
  },
  {
    icon: Mail,
    title: 'Contact Form',
    description: 'Let visitors send you messages directly from your profile. All enquiries saved to your dashboard.',
    size: 'small',
    gradient: 'from-green-500/10 to-green-600/5',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track profile views, link clicks, and visitor trends. Understand how people engage with your card.',
    size: 'small',
    gradient: 'from-orange-500/10 to-orange-600/5',
  },
  {
    icon: Palette,
    title: 'Multiple Themes',
    description: 'Choose from beautiful themes to match your brand. Customise colours and style to stand out.',
    size: 'large',
    gradient: 'from-pink-500/10 to-pink-600/5',
  },
];

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: ['1 profile', '5 links', 'Basic QR code', 'Platform branding', 'Basic analytics'],
    popular: false,
  },
  {
    name: 'Starter',
    price: 5,
    description: 'For individuals and freelancers',
    features: ['1 profile', '20 links', 'QR code download', 'Contact form', 'Basic analytics', 'Custom themes'],
    popular: false,
  },
  {
    name: 'Professional',
    price: 15,
    description: 'For professionals and creators',
    features: ['5 profiles', 'Unlimited links', 'Advanced analytics', 'Remove branding', 'vCard download', 'Priority features'],
    popular: true,
  },
  {
    name: 'Business',
    price: 29,
    description: 'For teams and businesses',
    features: ['20 profiles', 'Unlimited links', 'Team profiles', 'Business branding', 'Advanced analytics', 'Priority support'],
    popular: false,
  },
];

const faqs = [
  { q: 'Is the free plan really free?', a: 'Yes! The free plan is completely free forever. You get 1 profile, 5 links, and a basic QR code. No credit card required.' },
  { q: 'What URL will my profile be on?', a: 'Every profile gets a unique URL at jasmartprofile.jagroupservices.co.uk/yourusername. Choose your username when you sign up.' },
  { q: 'How does the QR code work?', a: 'Your QR code links directly to your public profile page. Free users can display it on screen; paid plans can download it as a PNG to print on physical cards or flyers.' },
  { q: 'Can people download my contact as a vCard?', a: 'vCard download is available on the Professional and Business plans. Visitors can save your contact directly to their phone with one tap.' },
  { q: 'Can I remove the platform branding?', a: 'Yes! The Professional and Business plans allow you to remove the "Powered by" footer from your public profile.' },
  { q: 'How many links can I add?', a: 'Free plan: 5 links. Starter: 20 links. Professional and Business: unlimited links.' },
  { q: 'Can I have multiple profiles?', a: 'Starter plan supports 1 profile. Professional supports up to 5 profiles. Business supports up to 20 profiles — perfect for teams.' },
  { q: 'Can visitors message me directly?', a: 'Yes! Paid plans include 2-way direct messaging. Visitors can send you a message from your card and you can reply from your dashboard in real time.' },
  { q: 'Is my data secure?', a: 'Yes. We use industry-standard security practices including encrypted sessions and rate limiting. Your private data is never shown publicly unless you choose to display it.' },
];

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const branding = useBranding();

  return (
    <>
      <Helmet>
        <title>{branding.platform_name} — {branding.platform_tagline}</title>
        <meta name="description" content={branding.platform_description} />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-foreground">{branding.platform_name}</span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
                <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              </nav>

              {/* CTA */}
              <div className="hidden md:flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/login">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">Start Free</Button>
                </Link>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-border bg-background px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#how-it-works" className="block text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
              <a href="#pricing" className="block text-sm text-muted-foreground" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
              <div className="flex gap-2 pt-2">
                <Link to="/login" className="flex-1"><Button variant="outline" size="sm" className="w-full">Log In</Button></Link>
                <Link to="/login" className="flex-1"><Button size="sm" className="w-full bg-primary">Start Free</Button></Link>
              </div>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          {/* Background grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          {/* Gradient orbs */}
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Copy */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="text-center lg:text-left"
              >
                <motion.div variants={fadeUp}>
                  <Badge className="mb-6 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
                    <Zap className="w-3 h-3 mr-1" /> Free to start — no credit card required
                  </Badge>
                </motion.div>
                <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-foreground mb-6">
                  Create your digital business card{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">in minutes</span>
                </motion.h1>
                <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
                  Create a professional digital business card, QR code profile, mini website, and contact link page for yourself or your business.
                </motion.p>
                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link to="/login">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 w-full sm:w-auto">
                      Start Free <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <a href="#features">
                    <Button size="lg" variant="outline" className="border-border hover:bg-muted w-full sm:w-auto">
                      See Features
                    </Button>
                  </a>
                </motion.div>
                <motion.div variants={fadeUp} className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-400" /> Free forever plan
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-400" /> No credit card
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-green-400" /> Live in minutes
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Demo card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' as const }}
                className="flex justify-center"
              >
                <DemoProfileCard />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">Features</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Everything you need to stand out</motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
                One link to share everything. Your digital identity, beautifully presented.
              </motion.p>
            </motion.div>

            {/* Bento grid */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {features.map((feature, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`relative rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-all duration-300 group ${
                    i === 0 || i === 5 ? 'lg:col-span-2' : ''
                  }`}
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">How it Works</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Up and running in 3 steps</motion.h2>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid md:grid-cols-3 gap-8 relative"
            >
              {/* Connector line */}
              <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-px bg-gradient-to-r from-primary/20 via-primary/60 to-primary/20" />

              {[
                { step: '01', icon: Users, title: 'Sign Up Free', desc: 'Create your account in seconds. No credit card required. Choose your unique username.' },
                { step: '02', icon: Palette, title: 'Customise Your Card', desc: 'Add your photo, contact details, social links, and choose a theme that matches your brand.' },
                { step: '03', icon: QrCode, title: 'Share Everywhere', desc: 'Share your link, display your QR code, or let people save your contact with one tap.' },
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="text-center relative">
                  <div className="w-24 h-24 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 relative">
                    <item.icon className="w-10 h-10 text-primary" />
                    <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Example Profile Preview */}
        <section className="py-24 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <motion.p variants={fadeUp} className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">Live Preview</motion.p>
                <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                  Beautiful profiles that convert
                </motion.h2>
                <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-6">
                  Your digital business card looks stunning on every device. Mobile-first design ensures your profile makes the right impression.
                </motion.p>
                <motion.ul variants={stagger} className="space-y-3">
                  {['Works perfectly on mobile and desktop', 'Multiple themes to match your brand', 'One-tap to call, email, or visit your website', 'Share via QR code or direct link'].map((item, i) => (
                    <motion.li key={i} variants={fadeUp} className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      {item}
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div variants={fadeUp} className="mt-8">
                  <Link to="/login">
                    <Button variant="outline" className="border-border">
                      Create Your Profile <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' as const }}
                className="flex justify-center"
              >
                <DemoProfileCard />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.p variants={fadeUp} className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">Pricing</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Simple, transparent pricing</motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-2">Start free. Upgrade when you need more.</motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {plans.map((plan, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className={`relative rounded-2xl border p-6 flex flex-col ${
                    plan.popular
                      ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                      : 'border-border bg-card'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-white border-0 shadow-lg">
                        <Star className="w-3 h-3 mr-1" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="font-bold text-foreground text-lg mb-1">{plan.name}</h3>
                    <p className="text-muted-foreground text-xs mb-4">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      {plan.price === 0 ? (
                        <span className="text-3xl font-bold text-foreground">Free</span>
                      ) : (
                        <>
                          <span className="text-3xl font-bold text-foreground">£{plan.price}</span>
                          <span className="text-sm text-muted-foreground">/mo</span>
                        </>
                      )}
                    </div>
                    {plan.price > 0 && (
                      <p className="text-muted-foreground text-xs mt-1">Billed monthly</p>
                    )}
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.price === 0 ? (
                    <Link to="/login">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                        Start Free
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/login">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                        Get Started
                      </Button>
                    </Link>
                  )}                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24 bg-muted/20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.p variants={fadeUp} className="text-primary text-sm font-semibold uppercase tracking-wider mb-3">FAQ</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Frequently asked questions</motion.h2>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((faq, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <AccordionItem value={`faq-${i}`} className="border border-border rounded-xl px-4 bg-card">
                      <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline py-4">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-12"
            >
              <motion.div variants={fadeUp} className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ready to create your digital card?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8">
                Join thousands of professionals sharing their digital business card. Free to start, no credit card required.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                    Create Your Card Free <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
              {/* Brand */}
              <div className="col-span-2">
                <Link to="/" className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-bold text-lg text-foreground">{branding.platform_name}</span>
                </Link>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  {branding.platform_tagline}
                </p>
                {branding.footer_tagline && (
                  <p className="text-xs text-muted-foreground mt-2">{branding.footer_tagline}</p>
                )}
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Support:{' '}
                    <a href={`mailto:${branding.support_email || 'jasmartprofile@jagroupservices.co.uk'}`} className="hover:text-foreground transition-colors">
                      {branding.support_email || 'jasmartprofile@jagroupservices.co.uk'}
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <a href="https://jasmartprofile.jagroupservices.co.uk" className="hover:text-foreground transition-colors">
                      jasmartprofile.jagroupservices.co.uk
                    </a>
                  </p>
                </div>
              </div>
              {/* Links */}
              {[
                { title: 'Product', links: [
                  { label: 'Features', href: '#features' },
                  { label: 'Pricing', href: '#pricing' },
                  { label: 'How it Works', href: '#how-it-works' },
                ]},
                { title: 'Support', links: [
                  { label: 'Report an Issue', href: '/report-issue' },
                  { label: 'Contact Us', href: `mailto:${branding.support_email || 'jasmartprofile@jagroupservices.co.uk'}` },
                ]},
                { title: 'Legal', links: [
                  { label: 'Privacy Policy', href: '/legal/privacy' },
                  { label: 'Terms of Service', href: '/legal/terms' },
                  { label: 'Cookie Policy', href: '/legal/cookies' },
                ]},
              ].map((col, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-foreground text-sm mb-4">{col.title}</h4>
                  <ul className="space-y-2.5">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        {link.href.startsWith('/') && !link.href.includes('#') ? (
                          <Link to={link.href} className="text-muted-foreground text-sm hover:text-foreground transition-colors">{link.label}</Link>
                        ) : (
                          <a href={link.href} className="text-muted-foreground text-sm hover:text-foreground transition-colors">{link.label}</a>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} {branding.platform_name}. All rights reserved.</p>
              {branding.footer_show_legal_name === '1' && branding.legal_company_name && (
                <p className="text-muted-foreground text-sm">
                  {branding.platform_name} is a service provided by {branding.legal_company_name}
                  {branding.legal_company_number ? ` · Co. No. ${branding.legal_company_number}` : ''}
                </p>
              )}
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
