import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Upload, FileText, CheckCircle, Truck, ChevronRight } from 'lucide-react';
import CMYKMark from '@/components/CMYKMark';

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Print Product Cards (Bento) ─────────────────────────────────────────────
const printProducts = [
  {
    name: 'Business Cards',
    tagline: 'Make the right first impression',
    bg: 'bg-foreground',
    text: 'text-background',
    accent: 'text-background/50',
    large: true,
  },
  {
    name: 'Flyers',
    tagline: 'High-impact, full-colour print',
    bg: 'bg-muted',
    text: 'text-foreground',
    accent: 'text-foreground/50',
    large: false,
  },
  {
    name: 'Posters',
    tagline: 'A3, A2, A1 and beyond',
    bg: 'bg-primary',
    text: 'text-primary-foreground',
    accent: 'text-primary-foreground/60',
    large: false,
  },
  {
    name: 'Banners',
    tagline: 'Roll-up, pull-up, and outdoor',
    bg: 'bg-muted',
    text: 'text-foreground',
    accent: 'text-foreground/50',
    large: false,
  },
  {
    name: 'Stickers & Labels',
    tagline: 'Custom shapes, premium finish',
    bg: 'bg-foreground',
    text: 'text-background',
    accent: 'text-background/50',
    large: false,
  },
  {
    name: 'Custom Print',
    tagline: 'Something unique? We can do it',
    bg: 'bg-primary/10',
    text: 'text-foreground',
    accent: 'text-foreground/50',
    large: false,
  },
];

// ─── Portfolio Items ──────────────────────────────────────────────────────────
const portfolioItems = [
  {
    title: 'Prestige Business Cards',
    type: 'Business Cards',
    description: 'Soft-touch laminate with spot UV finish',
    gradient: 'from-slate-900 to-slate-700',
  },
  {
    title: 'Event Branding Suite',
    type: 'Flyers & Posters',
    description: 'Full event collateral — A5 flyers, A2 posters, roll-up banners',
    gradient: 'from-blue-900 to-blue-700',
  },
  {
    title: 'Restaurant Menu Collection',
    type: 'Menus',
    description: 'Premium laminated menus with custom die-cut',
    gradient: 'from-zinc-800 to-zinc-600',
  },
];

// ─── How It Works Steps ───────────────────────────────────────────────────────
const steps = [
  {
    num: '01',
    title: 'Upload Artwork',
    desc: 'Submit your print-ready files — PDF, PNG, JPG, SVG, AI, PSD. We accept all major formats.',
    icon: Upload,
  },
  {
    num: '02',
    title: 'Request a Quote',
    desc: 'Tell us your product, quantity, size, finish, and deadline. No fixed prices — every job is reviewed.',
    icon: FileText,
  },
  {
    num: '03',
    title: 'We Review & Price',
    desc: 'Our team reviews your files and sends a custom quote. You approve or decline — no obligation.',
    icon: CheckCircle,
  },
  {
    num: '04',
    title: 'Print & Deliver',
    desc: "Once approved and paid, we go to print and deliver straight to your door. We'll keep you updated by email every step of the way.",
    icon: Truck,
  },
];

// ─── Trust Points ─────────────────────────────────────────────────────────────
const trustPoints = [
  {
    label: 'No fixed pricing',
    detail: 'Every job reviewed properly — you get a quote that fits your actual requirements.',
  },
  {
    label: 'Upload any file format',
    detail: 'PDF, PNG, JPG, SVG, AI, PSD — we handle it all. Large files welcome.',
  },
  {
    label: 'Dedicated print support',
    detail: "A real team behind every request. Email us directly and we'll get back to you fast.",
  },
  {
    label: 'Fast turnaround, premium finish',
    detail: 'Rush jobs and standard lead times available. Quality never compromised.',
  },
];

export default function HomePage() {
  return (
    <>
      <title>JA Print Studio — Design. Print. Delivered.</title>
      <meta
        name="description"
        content="Premium custom print services. Submit your request, upload your artwork, and get a custom quote by email. Business cards, flyers, posters, banners, stickers, and more."
      />

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-background pt-16 pb-0 lg:pt-24">
        {/* CMYK accent — top right */}
        <div className="absolute top-8 right-8 opacity-30">
          <CMYKMark size="lg" />
        </div>

        <div className="container mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-xl"
            >
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-8">
                <div className="h-px w-8 bg-primary" />
                <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                  Premium Print Services
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-6xl lg:text-7xl xl:text-8xl font-heading font-bold text-foreground leading-none tracking-tight mb-6"
              >
                Design.
                <br />
                Print.
                <br />
                <span className="text-primary">Delivered.</span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="text-lg text-foreground/60 leading-relaxed mb-10 max-w-md"
              >
                Custom print services with design upload and quote requests. Every job reviewed by our team — no automated pricing, no compromises.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-6">
                <Link
                  to="/quote"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-sm hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20"
                >
                  Get a Quote
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to="/quote"
                  className="inline-flex items-center gap-2 px-6 py-3.5 border border-foreground/20 text-foreground text-sm font-semibold rounded-sm hover:border-foreground/40 hover:bg-muted transition-all hover:-translate-y-0.5"
                >
                  <Upload size={16} />
                  Upload Your Design
                </Link>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Link
                  to="/what-we-print"
                  className="inline-flex items-center gap-1.5 text-sm text-foreground/50 hover:text-primary transition-colors group"
                >
                  View What We Print
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' as const, delay: 0.2 }}
              className="relative"
            >
              {/* Abstract print-inspired visual */}
              <div className="relative aspect-[4/3] lg:aspect-square rounded-sm overflow-hidden bg-foreground">
                {/* Grid pattern */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                  }}
                />
                {/* Layered print mockup visual */}
                <div className="absolute inset-0 flex items-center justify-center p-10">
                  {/* Stacked card mockup */}
                  <div className="relative w-full max-w-xs">
                    {/* Card stack */}
                    <div className="absolute top-4 left-4 w-full aspect-[1.75/1] bg-white/5 rounded-sm border border-white/10 rotate-3" />
                    <div className="absolute top-2 left-2 w-full aspect-[1.75/1] bg-white/8 rounded-sm border border-white/15 rotate-1" />
                    <div className="relative w-full aspect-[1.75/1] bg-white rounded-sm shadow-2xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
                      <div className="p-5 h-full flex flex-col justify-between">
                        <div>
                          <div className="h-2 w-16 bg-foreground/80 rounded-full mb-1.5" />
                          <div className="h-1.5 w-10 bg-foreground/30 rounded-full" />
                        </div>
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="h-1 w-20 bg-foreground/20 rounded-full mb-1" />
                            <div className="h-1 w-14 bg-foreground/20 rounded-full" />
                          </div>
                          <CMYKMark size="sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating label */}
                <div className="absolute top-6 left-6 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-sm">
                  Business Cards
                </div>

                {/* Bottom strip */}
                <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                  <div className="flex-1 bg-[#00AEEF]" />
                  <div className="flex-1 bg-[#EC008C]" />
                  <div className="flex-1 bg-[#FFF200]" />
                  <div className="flex-1 bg-[#231F20]" />
                </div>
              </div>

              {/* Floating stat */}
              <div className="absolute -bottom-5 -left-5 bg-background border border-border/60 rounded-sm px-5 py-4 shadow-xl">
                <div className="text-2xl font-heading font-bold text-foreground">13+</div>
                <div className="text-xs text-foreground/50 mt-0.5">Print Products</div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trust Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: 'easeOut' as const }}
          className="mt-16 border-t border-border/40 bg-muted/50"
        >
          <div className="container mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border/40">
              {['Custom Quotes', 'Design Upload', 'Premium Print Support', 'Every Job Reviewed Properly'].map((item) => (
                <div key={item} className="py-4 px-6 text-center">
                  <span className="text-xs font-semibold tracking-wide text-foreground/60 uppercase">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-16"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">How It Works</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-heading font-bold text-foreground max-w-lg leading-tight">
              From file to finished print
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 relative"
          >
            {/* Connecting line (desktop) */}
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-border/60 z-0" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className="relative z-10 p-8 group"
              >
                {/* Number */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-full bg-background border-2 border-border/60 flex items-center justify-center group-hover:border-primary group-hover:bg-primary transition-all duration-300">
                    <step.icon size={16} className="text-foreground/40 group-hover:text-primary-foreground transition-colors duration-300" />
                  </div>
                  <span className="text-4xl font-heading font-bold text-foreground/10 group-hover:text-primary/20 transition-colors duration-300">
                    {step.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3">{step.title}</h3>
                <p className="text-sm text-foreground/55 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── WHAT WE PRINT PREVIEW ────────────────────────────────────────── */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6"
          >
            <div>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-primary" />
                <span className="text-xs font-semibold tracking-widest uppercase text-primary">What We Print</span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight">
                13 print products.<br />One studio.
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link
                to="/what-we-print"
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/60 hover:text-primary transition-colors group"
              >
                See all 13 print products
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          {/* Bento Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {printProducts.map((product, i) => (
              <motion.div
                key={product.name}
                variants={fadeUp}
                className={`group relative rounded-sm overflow-hidden ${product.bg} ${
                  i === 0 ? 'col-span-2 lg:col-span-1 row-span-2' : ''
                }`}
              >
                <div className={`p-7 ${i === 0 ? 'min-h-[280px] lg:min-h-[320px]' : 'min-h-[140px]'} flex flex-col justify-between`}>
                  <div>
                    <h3 className={`text-xl font-heading font-bold ${product.text} mb-1`}>{product.name}</h3>
                    <p className={`text-sm ${product.accent}`}>{product.tagline}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-4">
                    <Link
                      to="/quote"
                      className={`text-xs font-semibold px-3 py-1.5 rounded-sm border transition-all hover:-translate-y-0.5 ${
                        product.bg.includes('primary') && !product.bg.includes('/10')
                          ? 'border-white/30 text-white hover:bg-white/10'
                          : product.bg.includes('foreground')
                          ? 'border-white/20 text-white hover:bg-white/10'
                          : 'border-foreground/20 text-foreground hover:bg-foreground/5'
                      }`}
                    >
                      Get a Quote
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── DESIGN SUPPORT UPSELL ────────────────────────────────────────── */}
      <section className="py-20 bg-foreground relative overflow-hidden">
        {/* CMYK accent */}
        <div className="absolute bottom-8 right-8 opacity-20">
          <CMYKMark size="lg" />
        </div>

        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-background/50">Design Support</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-heading font-bold text-background leading-tight mb-4">
              Need help with design?<br />We offer full design support.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-background/50 mb-8 text-lg">
              Whether you have print-ready artwork or need a design created from scratch, we've got you covered.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-10">
              {['Print-Ready Artwork', 'Small Edits', 'Full Design Created'].map((option) => (
                <span
                  key={option}
                  className="px-4 py-2 border border-background/20 text-background/70 text-sm font-medium rounded-sm"
                >
                  {option}
                </span>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link
                to="/quote"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground text-sm font-semibold rounded-sm hover:bg-primary/90 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/30"
              >
                Include design support in your quote
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUST SECTION ────────────────────────────────────────────────── */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mb-16"
          >
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Why JA Print Studio</span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-heading font-bold text-foreground max-w-lg leading-tight">
              Print done properly.
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/30"
          >
            {trustPoints.map((point, i) => (
              <motion.div
                key={point.label}
                variants={fadeUp}
                className="bg-background p-10 group hover:bg-muted/30 transition-colors"
              >
                <div className="text-6xl font-heading font-bold text-foreground/5 group-hover:text-primary/10 transition-colors mb-4 leading-none">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{point.label}</h3>
                <p className="text-foreground/55 leading-relaxed">{point.detail}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── PORTFOLIO TEASER ─────────────────────────────────────────────── */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6"
          >
            <div>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
                <div className="h-px w-8 bg-primary" />
                <span className="text-xs font-semibold tracking-widest uppercase text-primary">Recent Work</span>
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight">
                Printed with precision.
              </motion.h2>
            </div>
            <motion.div variants={fadeUp}>
              <Link
                to="/portfolio"
                className="inline-flex items-center gap-2 text-sm font-semibold text-foreground/60 hover:text-primary transition-colors group"
              >
                View Recent Work
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {portfolioItems.map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                className={`group relative rounded-sm overflow-hidden ${i === 0 ? 'md:col-span-2' : ''}`}
              >
                <div className={`bg-gradient-to-br ${item.gradient} aspect-[4/3] ${i === 0 ? 'md:aspect-[16/9]' : ''} relative overflow-hidden`}>
                  {/* Grid overlay */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                      backgroundSize: '30px 30px',
                    }}
                  />
                  {/* CMYK bottom strip */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 flex opacity-60">
                    <div className="flex-1 bg-[#00AEEF]" />
                    <div className="flex-1 bg-[#EC008C]" />
                    <div className="flex-1 bg-[#FFF200]" />
                    <div className="flex-1 bg-[#231F20]" />
                  </div>
                  {/* Content overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-1">{item.type}</div>
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-white/60">{item.description}</p>
                  </div>
                  {/* Hover CTA */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to="/portfolio"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-foreground text-xs font-semibold rounded-sm hover:bg-white/90 transition-colors"
                    >
                      Request Similar
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── ONLINE DESIGNER TEASER ───────────────────────────────────────── */}
      <section className="py-16 bg-background border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 border border-dashed border-border/60 rounded-sm bg-muted/20"
          >
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 rounded-sm bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-4 h-4 rounded-sm border-2 border-foreground/20" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-foreground/50">Online Designer</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-muted text-foreground/40 rounded-sm tracking-wide uppercase">Coming Soon</span>
                </div>
                <p className="text-sm text-foreground/40 max-w-lg">
                  Design tools are on their way. For now, upload your artwork or request design support from our team.
                </p>
              </div>
            </div>
            <Link
              to="/quote"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border border-border/60 text-foreground/50 text-sm font-medium rounded-sm hover:border-primary hover:text-primary transition-colors"
            >
              Upload Artwork Instead
              <Upload size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-6 left-6 opacity-20">
          <CMYKMark size="lg" />
        </div>

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="max-w-2xl"
          >
            <motion.h2 variants={fadeUp} className="text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6">
              Ready to print?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-primary-foreground/70 text-lg mb-10">
              Submit your request, upload your artwork, and get a custom quote from our team. No automated pricing. No shortcuts.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link
                to="/quote"
                className="inline-flex items-center gap-2 px-7 py-4 bg-background text-foreground text-sm font-bold rounded-sm hover:bg-background/90 transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Get a Quote
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-7 py-4 border border-primary-foreground/30 text-primary-foreground text-sm font-semibold rounded-sm hover:border-primary-foreground/60 hover:bg-primary-foreground/10 transition-all hover:-translate-y-0.5"
              >
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
