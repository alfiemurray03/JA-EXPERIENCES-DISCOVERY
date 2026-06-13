import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import {
  Zap, ArrowRight, Check, TrendingUp, Globe, Mail,
  Star, DollarSign, BarChart3, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBranding } from '@/lib/branding';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const APP_URL = 'https://jasmartprofile.jagroupservices.co.uk';

export default function PartnersPage() {
  const branding = useBranding();
  const [form, setForm] = useState({ name: '', email: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/partner-enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          message: 'Affiliate programme interest registration (public /partners page).',
          type: 'affiliate',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Affiliate Programme — {branding.platform_name}</title>
        <meta name="description" content={`Join the ${branding.platform_name} Affiliate Programme. Earn commissions by referring customers. Coming soon — register your interest today.`} />
        <link rel="canonical" href={`${APP_URL}/partners`} />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Nav */}
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-foreground">{branding.platform_name}</span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
                <a href="/#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
                <Link to="/partners" className="text-sm text-foreground font-medium">Affiliate</Link>
              </nav>
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/login">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden pt-20 pb-24">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-64 h-64 bg-green-500/10 rounded-full blur-3xl" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <Badge className="mb-6 bg-green-500/10 text-green-400 border-green-500/20">
                  <TrendingUp className="w-3 h-3 mr-1" /> Affiliate Programme
                </Badge>
              </motion.div>
              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-foreground mb-6">
                Earn by sharing{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                  {branding.platform_name ?? 'JA Smart Profile'}
                </span>
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Refer customers to {branding.platform_name ?? 'JA Smart Profile'} and earn a commission on every paid plan they subscribe to.
                No technical knowledge required — just share your unique link.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => document.getElementById('notify')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                >
                  Register Interest <ArrowRight className="w-4 h-4" />
                </button>
                <Link to="/login">
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-semibold hover:bg-muted transition-colors">
                    Log in to get your link <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </motion.div>
              <motion.div variants={fadeUp} className="mt-6">
                <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-primary text-sm font-semibold">Affiliate Programme — Apply Now</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20 border-t border-border/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeUp} className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How it works</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Three simple steps to start earning with the {branding.platform_name ?? 'JA Smart Profile'} Affiliate Programme.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6 mb-16">
                {[
                  { icon: Globe,      title: 'Share your link',  desc: 'Get a unique referral link and share it on your website, social media, email newsletters, or anywhere online.', color: 'text-blue-400',   bg: 'bg-blue-500/10' },
                  { icon: DollarSign, title: 'They subscribe',   desc: 'When someone signs up via your link and takes a paid plan, the referral is tracked automatically to you.', color: 'text-green-400',  bg: 'bg-green-500/10' },
                  { icon: BarChart3,  title: 'You earn',         desc: 'Commissions are calculated monthly and paid out via bank transfer or PayPal once the programme launches.', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <Card className="bg-card border-border h-full">
                      <CardContent className="p-6">
                        <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                          <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">Step {i + 1}</p>
                        <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Benefits */}
              <motion.div variants={fadeUp} className="rounded-2xl border border-green-500/20 bg-green-500/5 p-8">
                <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-400" /> What to expect
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Competitive commission rates on all paid plans',
                    'Monthly payouts via bank transfer or PayPal',
                    'Real-time tracking dashboard',
                    'Dedicated affiliate support from JA Group Services',
                    'Marketing materials and branded assets provided',
                    'No minimum traffic requirements to apply',
                    'Cookie tracking window for fair attribution',
                    'Lifetime commissions on referred customers',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Notify Me */}
        <section id="notify" className="py-20 bg-muted/20">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeUp} className="text-center mb-10">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <Bell className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Get notified when the Affiliate Programme launches
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Leave your name and email and we'll reach out as soon as the programme is open.
                  No spam — just one email when it's ready.
                </p>
              </motion.div>

              {submitted ? (
                <motion.div variants={fadeUp} className="rounded-2xl border border-green-500/20 bg-green-500/5 p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-7 h-7 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">You're on the list!</h3>
                  <p className="text-muted-foreground text-sm">
                    We'll email you at <span className="text-foreground font-medium">{form.email}</span> when the Affiliate Programme launches.
                  </p>
                </motion.div>
              ) : (
                <motion.div variants={fadeUp}>
                  <div className="rounded-2xl border border-border bg-card p-8">
                    <form onSubmit={handleNotify} className="space-y-4">
                      {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
                      )}
                      <div>
                        <Label htmlFor="notify-name">Your Name</Label>
                        <Input
                          id="notify-name"
                          required
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="mt-1.5 bg-background border-border"
                          placeholder="Jane Smith"
                        />
                      </div>
                      <div>
                        <Label htmlFor="notify-email">Email Address</Label>
                        <Input
                          id="notify-email"
                          required
                          type="email"
                          value={form.email}
                          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          className="mt-1.5 bg-background border-border"
                          placeholder="jane@example.com"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary hover:bg-primary/90 text-white mt-2"
                      >
                        {submitting ? 'Registering…' : 'Notify me when it launches'}
                        {!submitting && <ArrowRight className="ml-2 w-4 h-4" />}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">
                        We'll only contact you about this programme. No marketing emails.
                      </p>
                    </form>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.div variants={fadeUp} className="rounded-2xl border border-primary/20 bg-primary/5 p-10">
                <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-foreground mb-3">Have a question?</h2>
                <p className="text-muted-foreground mb-6">
                  Our team at JA Group Services is happy to answer any questions about the Affiliate Programme.
                </p>
                <a href={`mailto:${branding.contact_email || 'jasmartprofile@jagroupservices.co.uk'}`}>
                  <Button className="bg-primary hover:bg-primary/90 text-white">
                    <Mail className="w-4 h-4 mr-2" />
                    {branding.contact_email || 'jasmartprofile@jagroupservices.co.uk'}
                  </Button>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-foreground text-sm">{branding.platform_name}</span>
            </Link>
            <p className="text-muted-foreground text-sm">© {new Date().getFullYear()} {branding.platform_name}. Part of JA Group Services.</p>
            <div className="flex gap-4">
              <Link to="/" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Home</Link>
              <a href="/#pricing" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Pricing</a>
              <Link to="/login" className="text-muted-foreground text-sm hover:text-foreground transition-colors">Log In</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
