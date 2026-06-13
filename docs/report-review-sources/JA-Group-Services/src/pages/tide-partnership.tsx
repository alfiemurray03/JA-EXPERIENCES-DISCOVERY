import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Shield,
  Zap,
  Smartphone,
  Users,
  Building2,
  FileText,
  CreditCard,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const TIDE_REFERRAL_URL = 'https://www.tide.co/partners-business-account/?ref=JAGSF2F';
const PROMO_CODE = 'JAGSF2F';

const steps = [
  {
    number: '01',
    title: 'Sign Up via Our Referral Link',
    description: `Visit Tide using our referral link or enter promo code ${PROMO_CODE} during registration to ensure your referral is tracked correctly.`,
  },
  {
    number: '02',
    title: 'Complete Identity Checks',
    description:
      'Tide will carry out standard Know Your Customer (KYC) verification as required by UK financial regulations. This is handled entirely by Tide.',
  },
  {
    number: '03',
    title: 'Open Your Tide Account',
    description:
      'Once approved, your Tide business current account will be ready to use — typically within minutes of completing verification.',
  },
  {
    number: '04',
    title: 'Deposit £100 Within 30 Days',
    description:
      'To activate your account and qualify for any applicable welcome offer, deposit a minimum of £100 within 30 days of opening.',
  },
];

const benefits = [
  {
    icon: Zap,
    title: 'Fast Online Setup',
    description: 'Open a business account in minutes from your phone or desktop — no paperwork, no waiting.',
  },
  {
    icon: Building2,
    title: 'No Branch Visits',
    description: 'Everything is managed digitally. No need to visit a branch or schedule an appointment.',
  },
  {
    icon: Users,
    title: 'Built for Small Businesses',
    description: 'Tide is designed specifically for sole traders, freelancers, and small to medium-sized businesses across the UK.',
  },
  {
    icon: Smartphone,
    title: 'Modern Financial Tools',
    description: 'Access invoicing, expense management, and real-time transaction notifications all within one platform.',
  },
];

const tideFeatures = [
  { icon: CreditCard, label: 'Business Current Accounts' },
  { icon: FileText, label: 'Invoicing & Billing Tools' },
  { icon: Building2, label: 'Company Formation Services' },
  { icon: Zap, label: 'Expense Management' },
  { icon: Shield, label: 'FCA Regulated Platform' },
  { icon: Smartphone, label: 'Mobile & Web App' },
];

export default function TidePartnershipPage() {
  return (
    <>
      <title>Tide Partnership - JA Group Services</title>
      <meta
        name="description"
        content="JA Group Services Ltd is a referral partner of Tide, the UK business financial platform. Open a Tide business account using our referral link and promo code JAGSF2F."
      />

      <div className="min-h-screen">

        {/* ── Hero ── */}
        <section className="relative bg-gradient-to-br from-[#0A1F44] via-[#0A1F44] to-[#1e3a5f] py-20 lg:py-32 overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2563EB]/8 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="container mx-auto px-4 relative">
            <motion.div
              className="max-w-4xl mx-auto text-center space-y-6 text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block">
                <span className="bg-[#2563EB]/20 text-[#60A5FA] px-4 py-2 rounded-full text-sm font-medium border border-[#2563EB]/30">
                  Referral Partnership
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Tide Partnership
              </h1>
              <p className="text-xl md:text-2xl text-white/85 leading-relaxed max-w-2xl mx-auto">
                Business banking made simple for UK businesses
              </p>
              <p className="text-white/65 text-base max-w-xl mx-auto">
                JA Group Services Ltd has partnered with Tide to help UK businesses access modern, digital-first financial services.
              </p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <a href={TIDE_REFERRAL_URL} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-10 py-7 text-lg font-semibold shadow-lg shadow-[#2563EB]/30"
                  >
                    Open a Tide Account
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 px-10 py-7 text-lg font-semibold"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  How It Works
                </Button>
              </motion.div>
              <p className="text-white/50 text-sm pt-2">
                Use promo code <span className="font-mono font-bold text-[#60A5FA] bg-[#2563EB]/20 px-2 py-0.5 rounded">{PROMO_CODE}</span> when signing up
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── About Tide ── */}
        <section className="bg-white py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block mb-4">
                  <span className="bg-[#2563EB]/10 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium">
                    About Tide
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44] mb-4">
                  What Is Tide?
                </h2>
                <p className="text-[#0A1F44]/70 text-lg max-w-3xl mx-auto leading-relaxed">
                  Tide is a UK-based financial platform built specifically for businesses. It offers a comprehensive suite of tools designed to simplify day-to-day financial management for sole traders, freelancers, and small to medium-sized enterprises.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  className="space-y-5"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-[#0A1F44]/75 text-base leading-relaxed">
                    Founded in the UK and regulated by the Financial Conduct Authority (FCA), Tide provides business current accounts alongside a growing range of financial services — all accessible through a single, intuitive platform.
                  </p>
                  <p className="text-[#0A1F44]/75 text-base leading-relaxed">
                    Whether you are starting a new business or looking to modernise your existing financial operations, Tide offers a straightforward, digital-first alternative to traditional high-street banking.
                  </p>
                  <div className="pt-2">
                    <a
                      href={TIDE_REFERRAL_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[#2563EB] font-semibold hover:underline underline-offset-4 text-sm"
                    >
                      Learn more at tide.co
                      <ExternalLink className="ml-1.5 h-4 w-4" />
                    </a>
                  </div>
                </motion.div>

                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {tideFeatures.map((feature, i) => (
                    <Card key={i} className="border border-[#E5EAF2] shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-5 flex items-start gap-3">
                        <div className="bg-[#2563EB]/10 p-2 rounded-lg shrink-0">
                          <feature.icon className="h-5 w-5 text-[#2563EB]" />
                        </div>
                        <span className="text-[#0A1F44] text-sm font-medium leading-snug">{feature.label}</span>
                      </CardContent>
                    </Card>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Role ── */}
        <section className="bg-[#F4F7FB] py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block mb-4">
                  <span className="bg-[#2563EB]/10 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium">
                    Our Role
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44] mb-4">
                  JA Group Services &amp; Tide
                </h2>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border border-[#2563EB]/20 shadow-md bg-white">
                  <CardContent className="p-8 md:p-10 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-[#2563EB]/10 p-3 rounded-xl shrink-0">
                        <Shield className="h-6 w-6 text-[#2563EB]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0A1F44] mb-2">Independent Referral Partner</h3>
                        <p className="text-[#0A1F44]/70 leading-relaxed">
                          JA Group Services Ltd acts solely as an independent referral partner of Tide. We introduce businesses to Tide's platform and provide information to help them make an informed decision. We do not provide banking, financial, or payment services of any kind.
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-[#E5EAF2] pt-6 flex items-start gap-4">
                      <div className="bg-[#2563EB]/10 p-3 rounded-xl shrink-0">
                        <Building2 className="h-6 w-6 text-[#2563EB]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0A1F44] mb-2">All Services Provided by Tide</h3>
                        <p className="text-[#0A1F44]/70 leading-relaxed">
                          All business account services, onboarding, verification, and financial products are provided exclusively by Tide Platform Limited. Any queries regarding your Tide account, transactions, or services should be directed to Tide directly.
                        </p>
                      </div>
                    </div>
                    <div className="border-t border-[#E5EAF2] pt-6 flex items-start gap-4">
                      <div className="bg-[#2563EB]/10 p-3 rounded-xl shrink-0">
                        <FileText className="h-6 w-6 text-[#2563EB]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[#0A1F44] mb-2">No Financial Advice</h3>
                        <p className="text-[#0A1F44]/70 leading-relaxed">
                          Nothing on this page constitutes financial advice. We recommend that you review Tide's terms, conditions, and eligibility criteria before applying. JA Group Services Ltd is not authorised or regulated by the FCA to provide financial services.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section id="how-it-works" className="bg-white py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                className="text-center mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block mb-4">
                  <span className="bg-[#2563EB]/10 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium">
                    How It Works
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44] mb-4">
                  Four Simple Steps
                </h2>
                <p className="text-[#0A1F44]/65 text-lg max-w-2xl mx-auto">
                  Getting started with Tide through our referral is straightforward. Here is what to expect.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {steps.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="h-full border border-[#E5EAF2] shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-7 space-y-4">
                        <div className="flex items-center gap-4">
                          <span className="text-4xl font-black text-[#2563EB]/20 leading-none">{step.number}</span>
                          <h3 className="text-lg font-bold text-[#0A1F44] leading-snug">{step.title}</h3>
                        </div>
                        <p className="text-[#0A1F44]/65 text-sm leading-relaxed">{step.description}</p>
                        {i === 0 && (
                          <div className="bg-[#F4F7FB] rounded-lg px-4 py-3 flex items-center gap-2">
                            <span className="text-[#0A1F44]/60 text-xs">Promo code:</span>
                            <span className="font-mono font-bold text-[#2563EB] text-sm tracking-wider">{PROMO_CODE}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="text-center mt-10"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <a href={TIDE_REFERRAL_URL} target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-10 py-7 text-lg font-semibold shadow-md"
                  >
                    Get Started with Tide
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Benefits ── */}
        <section className="bg-gradient-to-br from-[#0A1F44] to-[#1e3a5f] py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-14"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block mb-4">
                  <span className="bg-[#2563EB]/20 text-[#60A5FA] px-4 py-2 rounded-full text-sm font-medium border border-[#2563EB]/30">
                    Benefits
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Why Choose Tide?
                </h2>
                <p className="text-white/65 text-lg max-w-2xl mx-auto">
                  Tide is built for the way modern UK businesses operate — fast, flexible, and fully digital.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <Card className="h-full bg-white/8 border border-white/15 backdrop-blur-sm hover:bg-white/12 transition-colors">
                      <CardContent className="p-7 space-y-4">
                        <div className="bg-[#2563EB]/30 p-3 rounded-xl w-fit">
                          <benefit.icon className="h-6 w-6 text-[#60A5FA]" />
                        </div>
                        <h3 className="text-white font-bold text-base">{benefit.title}</h3>
                        <p className="text-white/65 text-sm leading-relaxed">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Call to Action ── */}
        <section className="bg-white py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block">
                  <span className="bg-[#2563EB]/10 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium">
                    Get Started Today
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44]">
                  Ready to Open Your Tide Account?
                </h2>
                <p className="text-[#0A1F44]/65 text-lg leading-relaxed">
                  Join thousands of UK businesses already using Tide. Use our referral link to get started — it takes just a few minutes to apply online.
                </p>

                <div className="bg-[#F4F7FB] rounded-2xl p-6 border border-[#E5EAF2] space-y-3">
                  <p className="text-[#0A1F44]/60 text-sm font-medium uppercase tracking-wide">Your Referral Details</p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    <div className="bg-white border border-[#E5EAF2] rounded-lg px-5 py-3 text-sm text-[#0A1F44]/70">
                      Promo Code: <span className="font-mono font-bold text-[#2563EB] ml-1">{PROMO_CODE}</span>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-500 hidden sm:block" />
                    <div className="bg-white border border-[#E5EAF2] rounded-lg px-5 py-3 text-sm text-[#0A1F44]/70">
                      Referred by: <span className="font-semibold text-[#0A1F44] ml-1">JA Group Services Ltd</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <a href={TIDE_REFERRAL_URL} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      className="bg-[#2563EB] hover:bg-[#1d4ed8] text-white px-10 py-7 text-lg font-semibold shadow-lg shadow-[#2563EB]/20"
                    >
                      Open a Tide Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </div>
                <p className="text-[#0A1F44]/40 text-xs">
                  You will be redirected to Tide's website. Account approval is subject to Tide's eligibility criteria.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Legal & Disclosure ── */}
        <section className="bg-[#F4F7FB] py-14 border-t border-[#E5EAF2]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-start gap-3 mb-6">
                  <AlertCircle className="h-5 w-5 text-[#0A1F44]/50 shrink-0 mt-0.5" />
                  <h2 className="text-base font-bold text-[#0A1F44] uppercase tracking-wide">
                    Legal &amp; Disclosure
                  </h2>
                </div>
                <div className="space-y-3 text-[#0A1F44]/60 text-sm leading-relaxed">
                  <p>
                    <strong className="text-[#0A1F44]/80">Not a Bank.</strong> JA Group Services Ltd is not a bank and does not provide banking, payment, or financial services. We are an independent referral partner only.
                  </p>
                  <p>
                    <strong className="text-[#0A1F44]/80">Services Provided by Tide.</strong> All business account services referenced on this page are provided by Tide Platform Limited, which is authorised and regulated by the Financial Conduct Authority (FCA). Tide is not responsible for the content of this page.
                  </p>
                  <p>
                    <strong className="text-[#0A1F44]/80">Affiliate Disclosure.</strong> JA Group Services Ltd may receive a referral commission or other benefit when a business successfully opens a Tide account using our referral link or promo code. This does not affect the cost of any Tide product or service to you.
                  </p>
                  <p>
                    <strong className="text-[#0A1F44]/80">No Financial Advice.</strong> The information on this page is provided for general informational purposes only and does not constitute financial, legal, or professional advice. You should conduct your own due diligence before opening any financial account.
                  </p>
                  <p>
                    <strong className="text-[#0A1F44]/80">Eligibility.</strong> Account approval is subject to Tide's own eligibility criteria, terms, and conditions. JA Group Services Ltd has no involvement in the account opening or approval process.
                  </p>
                  <p className="pt-2 border-t border-[#E5EAF2]">
                    JA Group Services Ltd — Registered in England &amp; Wales. For queries about your Tide account, please contact Tide directly at{' '}
                    <a href="https://www.tide.co" target="_blank" rel="noopener noreferrer" className="text-[#2563EB] hover:underline underline-offset-2">
                      tide.co
                    </a>.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
