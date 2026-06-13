import { motion } from 'motion/react';
import { Building2, Shield, TrendingUp, Handshake } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';

export default function AboutUsPage() {
  const { language } = useLanguage();
  
  return (
    <>
      <title>{t('aboutPage.title', language)} - JA Group Services</title>
      <meta
        name="description"
        content="Learn about JA Group Services Ltd - a professionally governed operating company providing structured frameworks for business divisions." />


      <div className="min-h-screen bg-[#FAFAF9]">
        {/* Hero Section */}
        <section className="relative bg-[#0A1F44] py-20 lg:py-32">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white">
                {t('aboutPage.title', language)}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {t('aboutPage.subtitle', language)}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Company Overview */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-16">
              {/* Who We Are */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}>

                <h2 className="text-3xl md:text-4xl font-serif text-[#0A1F44]">
                  {t('about.whoWeAre.title', language)}
                </h2>
                <div className="space-y-4 text-lg text-[#1A1A1A]/70 leading-relaxed">
                  <p>
                    {t('about.whoWeAre.p1', language)}
                  </p>
                  <p>
                    {t('about.whoWeAre.p2', language)}
                  </p>
                </div>
              </motion.div>

              {/* Our Purpose */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}>

                <h2 className="text-3xl md:text-4xl font-serif text-[#0A1F44]">
                  {t('about.ourPurpose.title', language)}
                </h2>
                <div className="space-y-4 text-lg text-[#1A1A1A]/70 leading-relaxed">
                  <p>
                    {t('about.ourPurpose.p1', language)}
                  </p>
                  <p>
                    {t('about.ourPurpose.p2', language)}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-12">
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}>

                <h2 className="text-3xl md:text-4xl font-serif text-[#0A1F44]">
                  {t('about.coreValues.title', language)}
                </h2>
                <p className="text-lg text-[#1A1A1A]/70">
                  {t('about.coreValues.subtitle', language)}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Governance & Accountability */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}>

                  <Card className="border-[#0A1F44]/10 h-full">
                    <CardHeader>
                      <Shield className="h-10 w-10 text-[#2563EB] mb-4" />
                      <CardTitle className="text-2xl font-serif text-[#0A1F44]">
                        {t('about.governance.title', language)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        {t('about.governance.desc', language)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Disciplined Growth */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}>

                  <Card className="border-[#0A1F44]/10 h-full">
                    <CardHeader>
                      <TrendingUp className="h-10 w-10 text-[#2563EB] mb-4" />
                      <CardTitle className="text-2xl font-serif text-[#0A1F44]">
                        {t('about.growth.title', language)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        {t('about.growth.desc', language)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Professional Infrastructure */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}>

                  <Card className="border-[#0A1F44]/10 h-full">
                    <CardHeader>
                      <Building2 className="h-10 w-10 text-[#2563EB] mb-4" />
                      <CardTitle className="text-2xl font-serif text-[#0A1F44]">
                        {t('about.professional.title', language)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        {t('about.professional.desc', language)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Strategic Partnerships */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}>

                  <Card className="border-[#0A1F44]/10 h-full">
                    <CardHeader>
                      <Handshake className="h-10 w-10 text-[#2563EB] mb-4" />
                      <CardTitle className="text-2xl font-serif text-[#0A1F44]">
                        {t('about.partnerships.title', language)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        {t('about.partnerships.desc', language)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Information */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}>

                <Card className="border-[#0A1F44]/10">
                  <CardHeader>
                    <CardTitle className="text-2xl font-serif text-[#0A1F44]">
                      Company Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]/60 mb-1">Registered Name</p>
                        <p className="text-[#1A1A1A]">JA Group Services Ltd</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]/60 mb-1">Company Number</p>
                        <p className="text-[#1A1A1A]">16314179</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]/60 mb-1">ICO Registration</p>
                        <p className="text-[#1A1A1A]">ZB877370</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1A1A1A]/60 mb-1">Jurisdiction</p>
                        <p className="text-[#1A1A1A]">England & Wales</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-[#0A1F44]/10">
                      <p className="text-sm font-medium text-[#1A1A1A]/60 mb-2">Registered Office</p>
                      <p className="text-[#1A1A1A]/70">
                        167-169 Great Portland Street<br />
                        5th Floor<br />
                        London W1W 5PF<br />
                        United Kingdom
                      </p>
                    </div>
                    <div className="pt-4 border-t border-[#0A1F44]/10">
                      <p className="text-sm text-[#1A1A1A]/60">JA Group Services Ltd operates as part of JSDS Group Ltd.

                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>);

}