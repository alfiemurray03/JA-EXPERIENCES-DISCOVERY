import { motion } from 'motion/react';
import { Building2, Network, Shield, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';

export default function AboutOurDivisionsPage() {
  const { language } = useLanguage();
  
  return (
    <>
      <title>{t('divisionsPage.title', language)} - JA Group Services</title>
      <meta
        name="description"
        content="Learn about the division framework and operational structure of JA Group Services Ltd."
      />

      <div className="min-h-screen bg-[#FAFAF9]">
        {/* Hero Section */}
        <section className="relative bg-[#0A1F44] py-20 lg:py-32">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#2563EB]" />
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center space-y-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white">
                {t('divisionsPage.title', language)}
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                {t('divisionsPage.subtitle', language)}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Operating Framework */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-12">
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-serif text-[#0A1F44]">
                  {t('divisions.framework.title', language)}
                </h2>
                <p className="text-lg text-[#1A1A1A]/70 max-w-3xl mx-auto">
                  {t('divisions.framework.subtitle', language)}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <Card className="border-[#0A1F44]/10 h-full">
                    <CardHeader>
                      <Building2 className="h-10 w-10 text-[#2563EB] mb-4" />
                      <CardTitle className="text-xl font-serif text-[#0A1F44]">
                        {t('divisions.framework.governance.title', language)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        {t('divisions.framework.governance.desc', language)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="border-[#0A1F44]/10 h-full">
                    <CardHeader>
                      <Network className="h-10 w-10 text-[#2563EB] mb-4" />
                      <CardTitle className="text-xl font-serif text-[#0A1F44]">
                        {t('divisions.framework.infrastructure.title', language)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        {t('divisions.framework.infrastructure.desc', language)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <Card className="border-[#0A1F44]/10 h-full">
                    <CardHeader>
                      <Shield className="h-10 w-10 text-[#2563EB] mb-4" />
                      <CardTitle className="text-xl font-serif text-[#0A1F44]">
                        {t('divisions.framework.standards.title', language)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        {t('divisions.framework.standards.desc', language)}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Current Divisions */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto space-y-12">
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-serif text-[#0A1F44]">
                  {t('divisions.current.title', language)}
                </h2>
                <p className="text-lg text-[#1A1A1A]/70">
                  {t('divisions.current.subtitle', language)}
                </p>
              </motion.div>

              {/* JA DOMAIN HUB */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-[#2563EB]/20 bg-gradient-to-br from-[#2563EB]/5 to-white shadow-lg">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <img 
                          src="/assets/ja-domain-hub-logo-new.png" 
                          alt="JA Domain Hub" 
                          className="h-16 w-auto object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <CardTitle className="text-2xl font-serif text-[#0A1F44]">
                          JA DOMAIN HUB
                        </CardTitle>
                        <p className="text-[#2563EB] font-medium">{t('divisions.jadomainhub.role', language)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-[#1A1A1A]/70 leading-relaxed">
                      {t('divisions.jadomainhub.desc', language)}
                    </p>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-[#0A1F44]">{t('divisions.jadomainhub.services.title', language)}</h3>
                      <ul className="space-y-2 text-[#1A1A1A]/70">
                        <li className="flex items-start gap-2">
                          <span className="text-[#2563EB] mt-1">•</span>
                          <span>{t('divisions.jadomainhub.services.item1', language)}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#2563EB] mt-1">•</span>
                          <span>{t('divisions.jadomainhub.services.item2', language)}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#2563EB] mt-1">•</span>
                          <span>{t('divisions.jadomainhub.services.item3', language)}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-[#2563EB] mt-1">•</span>
                          <span>{t('divisions.jadomainhub.services.item4', language)}</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-[#0A1F44]">{t('divisions.jadomainhub.partnerships.title', language)}</h3>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        {t('divisions.jadomainhub.partnerships.desc', language)}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <a
                        href="https://sso.secureserver.net/?plid=599857&prog_id=599857&realm=idp&path=%2F&app=account&referrer=sso"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-[#2563EB] hover:bg-[#0A1F44] text-white">
                          {t('divisions.jadomainhub.button.portal', language)}
                        </Button>
                      </a>
                      <a
                        href="https://jadomainhub.co.uk"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" className="border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#0A1F44]/5">
                          {t('divisions.jadomainhub.button.visit', language)}
                        </Button>
                      </a>
                      <Link to="/directory">
                        <Button variant="outline" className="border-[#0A1F44]/20 text-[#0A1F44] hover:bg-[#0A1F44]/5">
                          {t('divisions.jadomainhub.button.contact', language)}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Future Growth */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-8">
              <motion.div
                className="text-center space-y-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-serif text-[#0A1F44]">
                  {t('divisions.future.title', language)}
                </h2>
                <p className="text-lg text-[#1A1A1A]/70">
                  {t('divisions.future.subtitle', language)}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-[#0A1F44]/10">
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-[#1A1A1A]/70 leading-relaxed">
                      {t('divisions.future.p1', language)}
                    </p>
                    <p className="text-[#1A1A1A]/70 leading-relaxed">
                      {t('divisions.future.p2', language)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
