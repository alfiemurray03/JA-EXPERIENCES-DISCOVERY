import { motion } from 'motion/react';
import { ArrowRight, Shield, Building2, CheckCircle, Users, Award, Globe2, Mail, Phone, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';

export default function HomePage() {
  const { language } = useLanguage();

  return (
    <>
      <title>JA Group Services</title>
      <meta
        name="description"
        content="JA Group Services Ltd - A trusted name in professional business solutions, delivering excellence across multiple specialist divisions." />

      <div className="min-h-screen bg-white">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-white pt-20 pb-24 lg:pt-28 lg:pb-32">
          {/* Subtle background accent */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#EEF3FF] rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#F0F7FF] rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: 'radial-gradient(circle, #1A3FA812 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">

                {/* Left */}
                <motion.div
                  className="space-y-8"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55 }}>

                  <motion.h1
                    className="text-5xl md:text-6xl font-bold text-[#0A1F44] leading-[1.06] tracking-tight"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: 0.15 }}>
                    {t('hero.title', language)}
                  </motion.h1>

                  <motion.p
                    className="text-gray-600 text-lg leading-relaxed max-w-lg"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.22 }}>
                    {t('hero.subtitle', language)}
                  </motion.p>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-3"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.3 }}>
                    <Button asChild size="lg" className="bg-[#1A3FA8] hover:bg-[#153588] text-white px-8 py-6 text-base font-bold shadow-lg shadow-[#1A3FA8]/20">
                      <Link to="/about-our-divisions">
                        {t('hero.cta.divisions', language)}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="border-2 border-[#1A3FA8] text-[#1A3FA8] hover:bg-[#EEF3FF] px-8 py-6 text-base font-semibold">
                      <Link to="/contactus">
                        {t('hero.cta.contact', language)}
                      </Link>
                    </Button>
                  </motion.div>
                </motion.div>

                {/* Right — stat cards */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.55, delay: 0.2 }}>
                  {[
                    { icon: Building2, labelKey: 'stats.ukbased.label' as const, valueKey: 'stats.ukbased.value' as const, color: '#1A3FA8' },
                    { icon: Shield, labelKey: 'stats.trusted.label' as const, valueKey: 'stats.trusted.value' as const, color: '#0891B2' },
                    { icon: Users, labelKey: 'stats.customer.label' as const, valueKey: 'stats.customer.value' as const, color: '#7C3AED' },
                    { icon: Award, labelKey: 'stats.professional.label' as const, valueKey: 'stats.professional.value' as const, color: '#059669' },
                  ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={i}
                        className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-gray-200 transition-all"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}
                        whileHover={{ y: -4 }}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${stat.color}14` }}>
                          <Icon className="h-5 w-5" style={{ color: stat.color }} />
                        </div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">{t(stat.labelKey, language)}</p>
                        <p className="text-base font-bold text-[#0A1F44]">{t(stat.valueKey, language)}</p>
                      </motion.div>
                    );
                  })}
                </motion.div>

              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED DIVISION ── */}
        <section className="bg-[#F8FAFF] py-20 lg:py-28 border-y border-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">

              <motion.div
                className="mb-14"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}>
                <p className="text-[#1A3FA8] text-sm font-bold uppercase tracking-widest mb-3">{t('featured.badge', language)}</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44]">{t('featured.sectionTitle', language)}</h2>
              </motion.div>

              <motion.div
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}>
                <div className="grid md:grid-cols-2">

                  {/* Left */}
                  <div className="p-10 md:p-14 space-y-7 flex flex-col justify-center">
                    <div className="bg-[#EEF3FF] p-6 rounded-2xl inline-block">
                      <img src="/assets/ja-domain-hub-logo-new.png" alt="JA Domain Hub" className="h-16 w-auto" />
                    </div>
                    <h3 className="text-3xl font-bold text-[#0A1F44]">JA Domain Hub</h3>
                    <p className="text-gray-600 text-base leading-relaxed">{t('featured.description', language)}</p>
                    <div className="flex flex-wrap gap-2">
                      {['featured.features.domain', 'featured.features.email', 'featured.features.hosting'].map((key, i) => (
                        <span key={i} className="bg-[#EEF3FF] text-[#1A3FA8] border border-[#C7D7F5] px-4 py-1.5 rounded-full text-sm font-semibold">
                          {t(key as any, language)}
                        </span>
                      ))}
                    </div>
                    <a href="https://jadomainhub.co.uk" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="bg-[#1A3FA8] hover:bg-[#153588] text-white font-bold px-8 py-5 text-base w-full sm:w-auto">
                        {t('featured.cta', language)}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </a>
                  </div>

                  {/* Right */}
                  <div className="bg-[#1A3FA8] p-10 md:p-14 text-white">
                    <h4 className="text-xl font-bold mb-8 text-white">{t('featured.keyFeatures', language)}</h4>
                    <div className="space-y-6">
                      {[
                        { icon: Globe2, titleKey: 'featured.feature1.title', descKey: 'featured.feature1.desc' },
                        { icon: Mail, titleKey: 'featured.feature2.title', descKey: 'featured.feature2.desc' },
                        { icon: Shield, titleKey: 'featured.feature3.title', descKey: 'featured.feature3.desc' },
                        { icon: CheckCircle, titleKey: 'featured.feature4.title', descKey: 'featured.feature4.desc' },
                      ].map((f, i) => {
                        const Icon = f.icon;
                        return (
                          <motion.div
                            key={i}
                            className="flex gap-4"
                            initial={{ opacity: 0, x: 16 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.08 }}>
                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                              <Icon className="h-5 w-5 text-white/80" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-sm mb-1">{t(f.titleKey as any, language)}</h5>
                              <p className="text-white/65 text-sm leading-relaxed">{t(f.descKey as any, language)}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </motion.div>

              <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.3 }}>
                <Link to="/recommended-services" className="inline-flex items-center gap-1.5 text-[#1A3FA8] font-semibold text-sm hover:gap-3 transition-all">
                  {t('featured.viewall', language)}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section className="bg-white py-20 lg:py-28">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">

              <motion.div
                className="mb-14"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}>
                <p className="text-[#1A3FA8] text-sm font-bold uppercase tracking-widest mb-3">{t('why.badge', language)}</p>
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44] mb-3">{t('why.title', language)}</h2>
                <p className="text-gray-600 text-lg max-w-2xl">{t('why.subtitle', language)}</p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { icon: Building2, titleKey: 'why.ukbased.title', descKey: 'why.ukbased.desc', color: '#1A3FA8', delay: 0 },
                  { icon: Users, titleKey: 'why.customer.title', descKey: 'why.customer.desc', color: '#0891B2', delay: 0.08 },
                  { icon: Shield, titleKey: 'why.trusted.title', descKey: 'why.trusted.desc', color: '#7C3AED', delay: 0.16 },
                  { icon: Award, titleKey: 'why.professional.title', descKey: 'why.professional.desc', color: '#059669', delay: 0.24 },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={i}
                      className="bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-lg hover:border-gray-200 transition-all group"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: item.delay }}
                      whileHover={{ y: -4 }}>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: `${item.color}14` }}>
                        <Icon className="h-6 w-6" style={{ color: item.color }} />
                      </div>
                      <h3 className="font-bold text-[#0A1F44] text-base mb-2">{t(item.titleKey as any, language)}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{t(item.descKey as any, language)}</p>
                    </motion.div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* ── CONTACT CTA ── */}
        <section className="bg-[#1A3FA8] py-16 lg:py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/8 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 items-center">

                <motion.div
                  className="space-y-5"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}>
                  <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">{t('contact.title', language)}</h2>
                  <p className="text-white/80 text-lg leading-relaxed">{t('contact.subtitle', language)}</p>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button asChild size="lg" className="bg-white text-[#1A3FA8] hover:bg-gray-100 px-8 py-6 text-base font-bold shadow-xl">
                      <Link to="/contactus">
                        {t('contact.cta.primary', language)}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="lg" variant="ghost" className="text-white border border-white/30 hover:bg-white/10 px-8 py-6 text-base font-semibold">
                      <Link to="/about-us">{t('contact.cta.secondary', language)}</Link>
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  className="flex flex-col gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.1 }}>
                  <a href="tel:02038342790" className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/15 transition-all group">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-widest mb-0.5">Phone</p>
                      <p className="text-white font-semibold text-sm">{t('contact.phone', language)}</p>
                    </div>
                  </a>
                  <a href="mailto:hello@jagroupservices.co.uk" className="flex items-center gap-4 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 hover:bg-white/15 transition-all group">
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-widest mb-0.5">Email</p>
                      <p className="text-white font-semibold text-sm">{t('contact.email', language)}</p>
                    </div>
                  </a>
                </motion.div>

              </div>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
