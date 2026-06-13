import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Scissors, Dumbbell, BookOpen, Heart, Home, PawPrint,
  Briefcase, Camera, Users,
  CheckCircle2, ArrowRight,
  CalendarCheck, CreditCard, Bell, UserCheck, BarChart3, Zap,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { businessCategories } from '@/data/businessCategories';
import { useState } from 'react';

const iconMap: Record<string, React.ElementType> = {
  Scissors, Dumbbell, BookOpen, Heart, Home, PawPrint, Briefcase, Camera, Users,
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

export default function HomePage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual' | 'lifetime'>('monthly');

  const plans = [
    {
      name: 'Free',
      price: 0,
      annualPrice: 0,
      lifetimePrice: null,
      description: 'Get started with the basics',
      badge: null,
      comingSoon: false,
      features: [
        'Up to 20 appointments/month',
        'Business subdomain',
        'Basic public booking page',
        'JABooking branding',
        'Email support',
      ],
      cta: 'Start Free',
      href: '/register',
      highlight: false,
    },
    {
      name: 'Starter',
      price: 9.99,
      annualPrice: 7.99,
      lifetimePrice: 149,
      description: 'For growing businesses',
      badge: null,
      comingSoon: true,
      features: [
        'Up to 100 appointments/month',
        'Email reminders',
        'Stripe payments',
        'Basic customer management',
        'Basic reports',
        'Everything in Free',
      ],
      cta: 'Coming Soon',
      href: '/register',
      highlight: false,
    },
    {
      name: 'Professional',
      price: 19.99,
      annualPrice: 15.99,
      lifetimePrice: 299,
      description: 'For established businesses',
      badge: 'Most Popular',
      comingSoon: true,
      features: [
        'Unlimited appointments',
        'Multiple staff members',
        'Remove JABooking branding',
        'Reviews & Gallery',
        'Advanced reporting',
        'Everything in Starter',
      ],
      cta: 'Coming Soon',
      href: '/register',
      highlight: true,
    },
    {
      name: 'Business',
      price: 39.99,
      annualPrice: 31.99,
      lifetimePrice: 499,
      description: 'For scaling operations',
      badge: null,
      comingSoon: true,
      features: [
        'Multiple locations',
        'Memberships',
        'Loyalty programme',
        'Advanced reporting',
        'Priority support',
        'Everything in Professional',
      ],
      cta: 'Coming Soon',
      href: '/register',
      highlight: false,
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'Create your account',
      desc: 'Sign up free, choose your industry and business type in minutes.',
      icon: UserCheck,
    },
    {
      num: '02',
      title: 'Set up your page',
      desc: 'Add your services, prices, photos, team and availability.',
      icon: Zap,
    },
    {
      num: '03',
      title: 'Share your link',
      desc: 'Your professional booking page is live instantly at your own subdomain.',
      icon: CalendarCheck,
    },
    {
      num: '04',
      title: 'Get booked & paid',
      desc: 'Customers book and pay online. You get notified instantly.',
      icon: CreditCard,
    },
  ];

  const features = [
    {
      icon: CalendarCheck,
      title: 'Smart Calendar & Availability',
      desc: 'Manage your schedule with ease. Set working hours, block time off, and let customers book 24/7.',
      color: 'bg-indigo-50 text-indigo-600',
      size: 'lg',
    },
    {
      icon: CreditCard,
      title: 'Online Payments',
      desc: 'Take deposits or full payment via Stripe. Reduce no-shows and get paid upfront.',
      color: 'bg-emerald-50 text-emerald-600',
      size: 'sm',
    },
    {
      icon: Bell,
      title: 'Automated Reminders',
      desc: 'Email reminders sent automatically before appointments. Cut no-shows dramatically.',
      color: 'bg-amber-50 text-amber-600',
      size: 'sm',
    },
    {
      icon: Users,
      title: 'Staff Management',
      desc: 'Add team members, assign services, manage individual schedules and availability.',
      color: 'bg-pink-50 text-pink-600',
      size: 'sm',
    },
    {
      icon: UserCheck,
      title: 'Customer Management',
      desc: 'Build your client database automatically. Track visit history, spend and loyalty.',
      color: 'bg-blue-50 text-blue-600',
      size: 'sm',
    },
    {
      icon: BarChart3,
      title: 'Reports & Insights',
      desc: 'Track revenue, bookings and growth with clear, actionable reports.',
      color: 'bg-violet-50 text-violet-600',
      size: 'sm',
    },
  ];

  const heroImages = [
    { slot: '/airo-assets/images/pages/home/hero-barber', label: 'Barber' },
    { slot: '/airo-assets/images/pages/home/hero-fitness', label: 'Fitness' },
    { slot: '/airo-assets/images/pages/home/hero-beauty', label: 'Beauty' },
    { slot: '/airo-assets/images/pages/home/hero-tutor', label: 'Education' },
    { slot: '/airo-assets/images/pages/home/hero-photographer', label: 'Photography' },
    { slot: '/airo-assets/images/pages/home/hero-dog-groomer', label: 'Pet Services' },
  ];

  return (
    <>
      <Helmet>
        <title>JABooking — Online Booking for Every Business</title>
        <meta
          name="description"
          content="The UK's multi-industry booking platform. From barbers to personal trainers, tutors to dog groomers — get your professional booking page, manage appointments and get paid online."
        />
        <link rel="canonical" href="https://jabooking.jagroupservices.co.uk/" />
        <meta property="og:title" content="JABooking — Online Booking for Every Business" />
        <meta property="og:description" content="The UK's multi-industry booking platform. Get your professional booking page, manage appointments and get paid online." />
        <meta property="og:url" content="https://jabooking.jagroupservices.co.uk/" />
      </Helmet>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 pt-12 pb-20 md:pt-20 md:pb-28">
          {/* Background decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-emerald-100/40 blur-3xl" />
          </div>

          <div className="container mx-auto px-4 lg:px-6 relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left: Copy */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={stagger}
                className="max-w-xl"
              >
                <motion.div variants={fadeUp}>
                  <Badge className="mb-5 bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50 text-xs font-medium px-3 py-1">
                    🇬🇧 Built for UK Businesses
                  </Badge>
                </motion.div>

                <motion.h1
                  variants={fadeUp}
                  className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-[#0F172A] leading-[1.15] tracking-tight mb-6"
                >
                  The Booking Platform for{' '}
                  <span className="text-primary">Every Business</span>
                </motion.h1>

                <motion.p
                  variants={fadeUp}
                  className="text-lg text-muted-foreground leading-relaxed mb-8"
                >
                  From barbers to personal trainers, tutors to dog groomers — JABooking gives every service business a professional booking page, powerful dashboard, and happy customers.
                </motion.p>

                <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-10">
                  <Link to="/register">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8 h-12 text-base w-full sm:w-auto">
                      Start for Free
                      <ArrowRight size={18} className="ml-2" />
                    </Button>
                  </Link>
                  <Link to="/categories">
                    <Button size="lg" variant="outline" className="font-semibold px-8 h-12 text-base w-full sm:w-auto border-2">
                      See All Categories
                    </Button>
                  </Link>
                </motion.div>

                <motion.div variants={fadeUp} className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
                    <CheckCircle2 size={15} className="text-indigo-600 shrink-0" />
                    <p className="text-xs font-medium text-indigo-700">Free forever plan — no credit card required</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Image mosaic */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' as const }}
                className="hidden lg:grid grid-cols-3 grid-rows-2 gap-3 h-[420px]"
              >
                {heroImages.map((img, i) => (
                  <div
                    key={i}
                    className={`relative overflow-hidden rounded-2xl ${
                      i === 0 ? 'row-span-2' : ''
                    }`}
                  >
                    <img
                      src={img.slot}
                      alt={img.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    <span className="absolute bottom-2 left-2 text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {img.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ───────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-white" id="categories">
          <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                All Industries Welcome
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
                Built for Every Service Business
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Whether you cut hair, train clients, teach students or walk dogs — JABooking has a plan for you.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {businessCategories.map((cat) => {
                const Icon = iconMap[cat.icon] || Briefcase;
                return (
                  <motion.div
                    key={cat.id}
                    variants={fadeUp}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group relative bg-white border border-border rounded-2xl p-6 cursor-pointer hover:border-primary/40 hover:shadow-lg transition-all duration-200"
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: cat.color + '18', color: cat.color }}
                    >
                      <Icon size={22} />
                    </div>
                    <h3 className="font-semibold text-[#0F172A] mb-2 group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cat.types.slice(0, 3).join(' · ')}
                      {cat.types.length > 3 && ` · +${cat.types.length - 3} more`}
                    </p>
                    <div
                      className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: cat.color }}
                    />
                  </motion.div>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center mt-10"
            >
              <Link to="/categories">
                <Button variant="outline" className="border-2 font-semibold">
                  View All Categories & Business Types
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50" id="how-it-works">
          <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-16"
            >
              <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                Simple Setup
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
                Get Booked in Minutes
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-xl mx-auto">
                No technical knowledge needed. Your booking page is live in under 5 minutes.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative"
            >
              {/* Connecting line (desktop) */}
              <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    className="relative bg-white rounded-2xl p-6 border border-border shadow-sm text-center"
                  >
                    <div className="relative inline-flex mb-5">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Icon size={24} className="text-primary" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="font-semibold text-[#0F172A] mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── PUBLIC PAGE PREVIEW ──────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-white overflow-hidden" id="features">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid lg:grid-cols-2 gap-14 items-center">
              {/* Left: UI mockup */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: 'easeOut' as const }}
                className="relative"
              >
                <div className="bg-white rounded-3xl border border-border shadow-2xl overflow-hidden">
                  {/* Cover photo */}
                  <div className="h-28 bg-gradient-to-r from-indigo-500 to-violet-600 relative">
                    <div className="absolute -bottom-8 left-6">
                      <div className="w-16 h-16 rounded-2xl bg-white border-4 border-white shadow-md flex items-center justify-center">
                        <Scissors size={24} className="text-indigo-600" />
                      </div>
                    </div>
                  </div>
                  <div className="pt-12 px-6 pb-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-[#0F172A] text-lg">Your Business Name</h3>
                        <p className="text-sm text-muted-foreground">Your Category · Your City</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-xs text-amber-500 font-medium">★★★★★</span>
                          <span className="text-xs text-muted-foreground ml-1">Your reviews here</span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-primary text-white text-xs h-8">
                        Book Now
                      </Button>
                    </div>
                    {/* Services */}
                    <div className="space-y-2">
                      {[
                        { name: 'Your Service 1', duration: '45 min', price: '£XX' },
                        { name: 'Your Service 2', duration: '60 min', price: '£XX' },
                        { name: 'Your Service 3', duration: '30 min', price: '£XX' },
                      ].map((svc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-border">
                          <div>
                            <p className="text-sm font-medium text-[#0F172A]">{svc.name}</p>
                            <p className="text-xs text-muted-foreground">{svc.duration}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#0F172A]">{svc.price}</span>
                            <Button size="sm" variant="outline" className="h-7 text-xs px-3">Book</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' as const }}
                  className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl border border-border p-3 flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0F172A]">New Booking!</p>
                    <p className="text-xs text-muted-foreground">Your service · 2:00 PM</p>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Feature list */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
              >
                <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                  Your Business Page
                </motion.p>
                <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
                  A Professional Booking Page, Instantly
                </motion.h2>
                <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-8">
                  Every business gets a beautiful, mobile-friendly booking page that works like a mini website — ready to share in minutes.
                </motion.p>
                <motion.ul variants={stagger} className="space-y-3">
                  {[
                    'Business logo & cover photo',
                    'Services with prices & durations',
                    'Team member profiles',
                    'Customer reviews & ratings',
                    'Photo gallery',
                    'Contact details & social links',
                    'SEO-friendly & mobile-optimised',
                    'Your own subdomain (custom domain available)',
                  ].map((item, i) => (
                    <motion.li key={i} variants={fadeUp} className="flex items-center gap-3">
                      <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                      <span className="text-sm text-[#0F172A]">{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div variants={fadeUp} className="mt-8">
                  <Link to="/register">
                    <Button variant="outline" className="border-2 font-semibold">
                      Create Your Booking Page
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-14"
            >
              <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                Platform Features
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
                Everything You Need to Run Your Business
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
                One platform. Every tool you need to manage bookings, payments, staff and customers.
              </motion.p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {features.map((feat, i) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl p-6 border border-border hover:shadow-md transition-all duration-200"
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${feat.color}`}>
                      <Icon size={22} />
                    </div>
                    <h3 className="font-semibold text-[#0F172A] mb-2">{feat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── PRICING ──────────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-white" id="pricing">
          <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="text-center mb-12"
            >
              <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                Pricing
              </motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-4">
                Simple, Transparent Pricing
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                Start free. Upgrade as you grow. No hidden fees.
              </motion.p>

              {/* Billing toggle */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-1 bg-slate-100 rounded-full p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    billingCycle === 'monthly' ? 'bg-white shadow text-[#0F172A]' : 'text-muted-foreground'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    billingCycle === 'annual' ? 'bg-white shadow text-[#0F172A]' : 'text-muted-foreground'
                  }`}
                >
                  Annual
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                    Save 20%
                  </span>
                </button>
                <button
                  onClick={() => setBillingCycle('lifetime')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    billingCycle === 'lifetime' ? 'bg-white shadow text-[#0F172A]' : 'text-muted-foreground'
                  }`}
                >
                  Lifetime
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                    One-off
                  </span>
                </button>
              </motion.div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {plans.map((plan, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`relative rounded-2xl p-6 border-2 flex flex-col transition-all duration-200 ${
                    plan.highlight
                      ? 'border-primary bg-primary text-white shadow-xl shadow-primary/20'
                      : 'border-border bg-white hover:border-primary/30 hover:shadow-md'
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        ⭐ {plan.badge}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
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
                    {plan.price === 0 ? (
                      <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>Free</span>
                    ) : billingCycle === 'lifetime' && plan.lifetimePrice ? (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                            £{plan.lifetimePrice}
                          </span>
                          <span className={`text-sm mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-muted-foreground'}`}>
                            once
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${plan.highlight ? 'text-indigo-200' : 'text-muted-foreground'}`}>
                          Pay once, use forever
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-end gap-1">
                          <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-[#0F172A]'}`}>
                            £{billingCycle === 'annual' ? plan.annualPrice : plan.price}
                          </span>
                          <span className={`text-sm mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-muted-foreground'}`}>
                            /mo
                          </span>
                        </div>
                        {billingCycle === 'annual' && (
                          <p className={`text-xs mt-1 ${plan.highlight ? 'text-indigo-200' : 'text-muted-foreground'}`}>
                            Billed annually
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <CheckCircle2
                          size={16}
                          className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-indigo-200' : 'text-emerald-500'}`}
                        />
                        <span className={`text-sm ${plan.highlight ? 'text-indigo-100' : 'text-muted-foreground'}`}>
                          {feat}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link to={plan.comingSoon ? '#pricing' : plan.href}>
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

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center text-sm text-muted-foreground mt-6"
            >
              Free forever plan available. No credit card required to start.
            </motion.p>
          </div>
        </section>

        {/* ── EARLY ACCESS CTA ─────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-slate-50">
          <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 text-sm font-semibold px-4 py-2 rounded-full border border-indigo-100 mb-6">
                <Zap size={15} />
                Now in Early Access
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-[#0F172A] mb-5">
                Be Among the First Businesses on JABooking
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
                We're launching JABooking and opening up free accounts now. Paid plans are coming soon — sign up free today and lock in early access pricing when we go live.
              </motion.p>
              <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
                {[
                  { icon: CalendarCheck, title: 'Free Booking Page', desc: 'Your own subdomain and public booking page, live immediately.' },
                  { icon: Bell, title: 'Early Access Pricing', desc: 'Sign up now and get notified first when paid plans launch.' },
                  { icon: Users, title: 'Shape the Product', desc: 'Early users help us build the features that matter most.' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="bg-white rounded-2xl p-6 border border-border text-left">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <Icon size={20} className="text-primary" />
                      </div>
                      <h3 className="font-semibold text-[#0F172A] mb-1.5 text-sm">{item.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  );
                })}
              </motion.div>
              <motion.div variants={fadeUp}>
                <Link to="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 h-12 text-base">
                    Create Your Free Account
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-3">No credit card required. Free forever plan available.</p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── FINAL CTA ────────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28 bg-[#0F172A] relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl" />
          </div>
          <div className="container mx-auto px-4 lg:px-6 relative text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-sm px-4 py-2 rounded-full mb-6">
                <CalendarCheck size={16} />
                Free forever plan available
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white mb-5 max-w-2xl mx-auto leading-tight">
                Ready to Fill Your Calendar?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                Join hundreds of UK businesses already using JABooking. Start free, no credit card required.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-10 h-13 text-base">
                    Create Your Free Account
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold px-10 h-13 text-base">
                    View Pricing
                  </Button>
                </Link>
              </motion.div>
              <motion.p variants={fadeUp} className="text-slate-500 text-sm mt-6">
                Free forever plan available. Upgrade anytime.
              </motion.p>
            </motion.div>
          </div>
        </section>
      </main>
    </>
  );
}
