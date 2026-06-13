import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Shield,
  Smartphone,
  CreditCard,
  FileText,
  TrendingUp,
  AlertCircle,
  Building2,
  LayoutGrid,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TIDE_ACCOUNT_URL = 'https://www.tide.co/partners-business-account/?ref=JAGSF2F';
const TIDE_FORMATION_URL = 'https://www.tide.co/partners-company-formation/?ref=JAGSF2F';
const PROMO_CODE = 'JAGSF2F';

export default function TidePartnershipPage() {
  return (
    <>
      <title>Tide Partnership: Open a Business Account or Start a Company — JA Group Services</title>
      <meta
        name="description"
        content="Access a modern business account or register a company through Tide's platform. This page is provided by JA Group Services Ltd as part of a referral partnership with Tide."
      />

      <div className="min-h-screen bg-white">

        {/* 1. HERO SECTION */}
        <section className="relative bg-gradient-to-br from-white to-[#F8FAFF] py-20 lg:py-32 border-b border-gray-100">
          {/* Subtle background pattern */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, #1A3FA8 0.5px, transparent 0.5px)`,
              backgroundSize: '24px 24px'
            }}
          />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                {/* Tide Logo */}
                <div className="flex justify-center mb-6">
                  <img
                    src="/assets/tide-logo-darkblue.png"
                    alt="Tide"
                    className="h-12 w-auto"
                  />
                </div>

                <h1 className="text-5xl md:text-6xl font-bold text-[#0A1F44] leading-tight">
                  Open a Business Account or<br />Start a Company in Minutes
                </h1>

                <div className="space-y-4">
                  <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                    Access a modern business account or register a company through Tide's platform.
                  </p>
                  <p className="text-base text-gray-500 max-w-3xl mx-auto">
                    This page is provided by JA Group Services Ltd as part of a referral partnership with Tide.
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center"
                >
                  <a href={TIDE_ACCOUNT_URL} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      className="bg-[#1A3FA8] hover:bg-[#153588] text-white px-10 py-6 text-lg font-bold shadow-xl shadow-[#1A3FA8]/20 w-full sm:w-auto"
                    >
                      Open Business Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                  <a href={TIDE_FORMATION_URL} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-[#1A3FA8] text-[#1A3FA8] hover:bg-[#F8FAFF] px-10 py-6 text-lg font-bold w-full sm:w-auto"
                    >
                      Start a Company
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </motion.div>

                {/* Redirect notice */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="pt-2"
                >
                  <p className="text-sm text-gray-500">
                    You will be redirected to Tide's website to complete your application.
                  </p>
                </motion.div>

                {/* Important clarity statement */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="pt-6"
                >
                  <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-6 py-3">
                    <AlertCircle className="h-4 w-4 text-[#1A3FA8]" />
                    <p className="text-sm text-gray-700">
                      <strong>JA Group Services is not a bank.</strong> Tide provides the business account services.
                    </p>
                  </div>
                </motion.div>

                {/* Promo code */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="pt-4"
                >
                  <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-6 py-3 shadow-sm">
                    <span className="text-gray-500 text-sm font-medium">Referral code:</span>
                    <span className="font-mono font-black text-[#1A3FA8] text-lg tracking-wider">{PROMO_CODE}</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 2. WHAT THIS SERVICE IS */}
        <section className="bg-white py-20 lg:py-24 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-6"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[#0A1F44]">
                  What is Tide?
                </h2>
                <div className="space-y-4 text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
                  <p>
                    Tide is not a bank and provides business accounts and company formation in partnership with regulated providers.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* OUR ROLE SECTION */}
        <section className="bg-[#F8FAFF] py-16 lg:py-20 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center space-y-4"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44]">
                  Our Role
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  JA Group Services Ltd acts as a referral partner to Tide and provides access through referral links.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. WHAT YOU CAN DO (FEATURES) */}
        <section className="bg-white py-20 lg:py-24 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[#0A1F44] mb-4">
                  What You Can Do
                </h2>
                <p className="text-lg text-gray-600">
                  Everything you need to manage your business finances
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                {[
                  { icon: CheckCircle, text: 'Open a business account online' },
                  { icon: CreditCard, text: 'Send and receive payments' },
                  { icon: Building2, text: 'Register a limited company' },
                  { icon: TrendingUp, text: 'Manage your business finances in one place' }
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-center gap-4 bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-[#1A3FA8]/30 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl bg-[#1A3FA8]/10 flex items-center justify-center shrink-0">
                      <feature.icon className="h-6 w-6 text-[#1A3FA8]" />
                    </div>
                    <p className="text-gray-900 font-medium text-lg">{feature.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* TIDE PLATFORM SHOWCASE */}
        <section className="bg-gradient-to-br from-[#F8FAFF] to-white py-20 lg:py-28 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[#0A1F44] mb-4">
                  Modern Business Banking
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Manage your business finances from anywhere with Tide's mobile app and web platform
                </p>
              </motion.div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Mobile App Image */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="relative"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                    <img
                      src="/assets/tide-app-interface.png"
                      alt="Tide mobile app interface showing payments, transactions, and business account features"
                      className="w-full h-auto"
                    />
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#1A3FA8]/10 rounded-full blur-3xl -z-10" />
                </motion.div>

                {/* Features List */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="space-y-6"
                >
                  {[
                    {
                      icon: Smartphone,
                      title: 'Mobile & Web Access',
                      desc: 'Manage your account on the go with iOS and Android apps, or use the web platform'
                    },
                    {
                      icon: CreditCard,
                      title: 'Instant Payments',
                      desc: 'Send and receive payments instantly with real-time notifications'
                    },
                    {
                      icon: FileText,
                      title: 'Invoice Management',
                      desc: 'Create, send, and track invoices directly from your account'
                    },
                    {
                      icon: TrendingUp,
                      title: 'Financial Insights',
                      desc: 'Get clear insights into your business spending and cash flow'
                    }
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#1A3FA8]/10 flex items-center justify-center shrink-0">
                        <item.icon className="h-6 w-6 text-[#1A3FA8]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0A1F44] text-lg mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. WHY CHOOSE THIS (TRUST SECTION) */}
        <section className="bg-white py-20 lg:py-24 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[#0A1F44] mb-4">
                  Why Choose This
                </h2>
                <p className="text-lg text-gray-600">
                  Built for modern UK businesses
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Clock, title: 'Fast account setup', desc: 'Get started in minutes, not days' },
                  { icon: FileText, title: 'No unnecessary paperwork', desc: 'Simple digital application process' },
                  { icon: Shield, title: 'Designed for small businesses', desc: 'Built specifically for UK SMEs' },
                  { icon: CheckCircle, title: 'Trusted UK platform', desc: 'Regulated and secure' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="bg-[#F8FAFF] border border-[#E0E8FF] rounded-2xl p-6 text-center hover:shadow-lg hover:border-[#1A3FA8]/30 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-[#1A3FA8]/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="h-7 w-7 text-[#1A3FA8]" />
                    </div>
                    <h3 className="font-bold text-[#0A1F44] text-lg mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section className="bg-[#F8FAFF] py-20 lg:py-24 border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-[#0A1F44] mb-4">
                  How It Works
                </h2>
                <p className="text-lg text-gray-600">
                  Three simple steps to get started
                </p>
              </motion.div>

              <div className="space-y-8">
                {[
                  {
                    number: '1',
                    title: 'Click "Open Business Account"',
                    desc: 'Use our referral link to get started with Tide'
                  },
                  {
                    number: '2',
                    title: 'Complete registration with Tide',
                    desc: 'Fill in your business details and verify your identity'
                  },
                  {
                    number: '3',
                    title: 'Start managing your business finances',
                    desc: 'Your account is ready to use — typically within minutes'
                  }
                ].map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.15 }}
                    className="flex gap-6 items-start"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#1A3FA8] flex items-center justify-center shrink-0 shadow-lg">
                      <span className="font-black text-white text-2xl">{step.number}</span>
                    </div>
                    <div className="flex-1 bg-white border border-gray-200 rounded-2xl p-6">
                      <h3 className="font-bold text-[#0A1F44] text-xl mb-2">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. CALL TO ACTION */}
        <section className="bg-gradient-to-br from-[#1A3FA8] to-[#153588] py-20 lg:py-28 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Ready to get started?
                </h2>
                <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                  Open your business account with Tide today and start managing your finances more efficiently.
                </p>

                <div className="pt-4">
                  <a href={TIDE_ACCOUNT_URL} target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      className="bg-white text-[#1A3FA8] hover:bg-gray-100 px-12 py-7 text-lg font-bold shadow-2xl"
                    >
                      Open Business Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </a>
                </div>

                <p className="text-white/70 text-sm pt-4">
                  You will be redirected to Tide's website. Account approval is subject to Tide's eligibility criteria.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 7. DISCLAIMER / IMPORTANT INFORMATION */}
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* About JA Group Services */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-[#F8FAFF] border border-[#E0E8FF] rounded-2xl p-8 mb-12"
              >
                <div className="flex items-start gap-3">
                  <Info className="h-6 w-6 text-[#1A3FA8] shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-[#0A1F44] mb-3">
                      About JA Group Services
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      JA Group Services Ltd is an independent referral partner that connects UK businesses with Tide's business account and company formation services.
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      <strong className="text-gray-900">We are NOT a bank.</strong> All business account and company formation services are provided by Tide and their regulated partners.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* LEGAL DISCLAIMER */}
        <section className="bg-gray-50 py-12 border-t border-gray-200">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-start gap-3 mb-6">
                  <AlertCircle className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                      Important Information
                    </h3>
                    <div className="space-y-3 text-gray-600 text-sm leading-relaxed">
                      <p>
                        <strong className="text-gray-900">JA Group Services Ltd is not a bank and does not provide financial services.</strong> We act as a referral partner to Tide and all services are provided by Tide under their terms.
                      </p>
                      <p>
                        All business account services are provided by Tide Platform Limited, authorised and regulated by the Financial Conduct Authority (FCA). Tide is not responsible for the content of this page.
                      </p>
                      <p>
                        JA Group Services Ltd may receive a referral commission when a business opens a Tide account using our referral link or promo code. This does not affect the cost of any Tide product or service to you.
                      </p>
                      <p className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                        JA Group Services Ltd — Registered in England &amp; Wales. For queries about your Tide account, contact Tide directly at{' '}
                        <a
                          href="https://www.tide.co"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1A3FA8] hover:underline underline-offset-2"
                        >
                          tide.co
                        </a>
                        .
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
