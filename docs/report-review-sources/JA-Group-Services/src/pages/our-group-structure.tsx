import { motion } from 'motion/react';
import { Building2, Network, Shield, Users, TrendingUp, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';

export default function OurGroupStructurePage() {
  const { language } = useLanguage();
  
  return (
    <>
      <title>{t('structurePage.title', language)} - JA Group Services</title>
      <meta
        name="description"
        content="Understanding the corporate structure of JA Group Services Ltd and its relationship with JSDS Group Ltd." />


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
                {t('structurePage.title', language)}
              </h1>
                <p className="text-xl text-white/90 max-w-3xl mx-auto">
                  {t('structurePage.subtitle', language)}
                </p>
            </motion.div>
          </div>
        </section>

        {/* Corporate Structure Overview */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-12">
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}>

                <h2 className="text-3xl md:text-4xl font-serif text-[#0A1F44]">
                  {t('structure.overview.title', language)}
                </h2>
                <p className="text-lg text-[#1A1A1A]/70 max-w-3xl mx-auto">
                  {t('structure.overview.p1', language)}
                </p>
                <p className="text-lg text-[#1A1A1A]/70 max-w-3xl mx-auto">
                  {t('structure.overview.p2', language)}
                </p>
              </motion.div>

              {/* Structure Diagram */}
              <motion.div
                className="space-y-8"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}>

                {/* JSDS Group Ltd - Parent Company */}
                <Card className="border-[#0A1F44]/20 bg-gradient-to-br from-[#0A1F44]/5 to-white">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Building2 className="h-10 w-10 text-[#0A1F44] flex-shrink-0" />
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-serif text-[#0A1F44]">
                          {t('structure.jsds.title', language)}
                        </CardTitle>
                        <p className="text-[#1A1A1A]/60 font-medium">{t('structure.jsds.role', language)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[#1A1A1A]/70 leading-relaxed">
                      {t('structure.jsds.desc', language)}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 pt-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-[#2563EB] flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium text-[#0A1F44]">Strategic Oversight</p>
                          <p className="text-sm text-[#1A1A1A]/60">Group-level governance and direction</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-[#2563EB] flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium text-[#0A1F44]">Holding Function</p>
                          <p className="text-sm text-[#1A1A1A]/60">Corporate structure management</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Arrow Indicator */}
                <div className="flex justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-px h-12 bg-[#2563EB]" />
                    <div className="text-[#2563EB] font-medium">Wholly-Owned Subsidiary</div>
                    <div className="w-px h-12 bg-[#2563EB]" />
                  </div>
                </div>

                {/* JA Group Services Ltd - Operating Company */}
                <Card className="border-[#2563EB]/30 bg-gradient-to-br from-[#2563EB]/5 to-white shadow-lg">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Network className="h-10 w-10 text-[#2563EB] flex-shrink-0" />
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-serif text-[#0A1F44]">
                          {t('structure.ja.title', language)}
                        </CardTitle>
                        <p className="text-[#2563EB] font-medium">{t('structure.ja.role', language)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[#1A1A1A]/70 leading-relaxed">
                      {t('structure.ja.desc', language)}
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 pt-4">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-[#2563EB] flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium text-[#0A1F44]">Division Management</p>
                          <p className="text-sm text-[#1A1A1A]/60">Operational oversight</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-[#2563EB] flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium text-[#0A1F44]">Compliance</p>
                          <p className="text-sm text-[#1A1A1A]/60">Regulatory frameworks</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-[#2563EB] flex-shrink-0 mt-1" />
                        <div>
                          <p className="font-medium text-[#0A1F44]">Trading Activities</p>
                          <p className="text-sm text-[#1A1A1A]/60">All business operations</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Key Distinctions */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}>

                <h2 className="text-3xl md:text-4xl font-serif text-[#0A1F44]">
                  Key Distinctions
                </h2>
                <p className="text-lg text-[#1A1A1A]/70">
                  Understanding the roles and responsibilities within our corporate structure.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* JSDS Group Ltd */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}>

                  <Card className="border-[#0A1F44]/10 h-full">
                    <CardHeader>
                      <CardTitle className="text-xl font-serif text-[#0A1F44]">
                        JSDS Group Ltd
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <p className="font-medium text-[#0A1F44]">Role:</p>
                        <p className="text-[#1A1A1A]/70">Parent company providing strategic oversight</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-[#0A1F44]">Activities:</p>
                        <ul className="space-y-1 text-[#1A1A1A]/70 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span>Group-level governance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span>Corporate structure management</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span>Strategic direction</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-[#0A1F44]">Public Presence:</p>
                        <p className="text-[#1A1A1A]/70">Not public-facing, no trading activities</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* JA Group Services Ltd */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}>

                  <Card className="border-[#2563EB]/20 h-full bg-[#2563EB]/5">
                    <CardHeader>
                      <CardTitle className="text-xl font-serif text-[#0A1F44]">
                        JA Group Services Ltd
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <p className="font-medium text-[#0A1F44]">Role:</p>
                        <p className="text-[#1A1A1A]/70">Wholly-owned subsidiary conducting all trading activities</p>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-[#0A1F44]">Activities:</p>
                        <ul className="space-y-1 text-[#1A1A1A]/70 text-sm">
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span>Division operations and management</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span>Client-facing services</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span>All trading and commercial activities</span>
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="font-medium text-[#0A1F44]">Public Presence:</p>
                        <p className="text-[#1A1A1A]/70">Public-facing entity, primary point of contact</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Structure */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}>

                <h2 className="text-3xl md:text-4xl font-serif text-[#0A1F44]">
                  {t('structure.why.title', language)}
                </h2>
                <p className="text-lg text-[#1A1A1A]/70">
                  {t('structure.why.subtitle', language)}
                </p>
              </motion.div>

              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}>

                <Card className="border-[#0A1F44]/10">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-xl font-serif text-[#0A1F44]">
                        {t('structure.relationship.title', language)}
                      </h3>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        {t('structure.relationship.p1', language)}
                      </p>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        {t('structure.relationship.p2', language)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact & Learn More */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div
                className="text-center space-y-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}>

                <h2 className="text-3xl md:text-4xl font-serif text-[#0A1F44]">
                  {t('structure.learn.title', language)}
                </h2>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                  <Link to="/about-us">
                    <Button className="bg-[#2563EB] hover:bg-[#0A1F44] text-white">
                      {t('structure.learn.about', language)}
                    </Button>
                  </Link>
                  <Link to="/about-our-divisions">
                    <Button variant="outline" className="border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#0A1F44]/5">
                      {t('structure.learn.divisions', language)}
                    </Button>
                  </Link>
                  <Link to="/corporate">
                    <Button variant="outline" className="border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#0A1F44]/5">
                      {t('structure.learn.corporate', language)}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>);

}