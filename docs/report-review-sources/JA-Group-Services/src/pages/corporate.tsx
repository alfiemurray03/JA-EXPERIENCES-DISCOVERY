import { motion } from 'motion/react';
import { Building2, Shield, FileText, Users, ExternalLink, ArrowRight, Handshake, Target, CheckCircle2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';

export default function CorporatePage() {
  const { language } = useLanguage();
  
  return (
    <>
      <title>{t('corporatePage.title', language)} - JA Group Services</title>
      <meta
        name="description"
        content="Corporate governance, partnership opportunities and compliance details for JA Group Services Ltd. We welcome partnerships with service providers and businesses."
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0A1F44] via-[#0A1F44] to-[#1e3a5f] py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center space-y-6 text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-block">
                <span className="bg-[#2563EB]/20 text-[#60A5FA] px-4 py-2 rounded-full text-sm font-medium border border-[#2563EB]/30">
                  {t('corporatePage.badge', language)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
                {t('corporatePage.title', language)}
              </h1>
              <p className="text-xl text-white/90 leading-relaxed">
                {t('corporatePage.subtitle', language)}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Partnership Opportunities */}
        <section className="bg-white py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-block mb-4">
                  <span className="bg-[#2563EB]/10 text-[#2563EB] px-4 py-2 rounded-full text-sm font-medium">
                    {t('corporate.partnership.badge', language)}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#0A1F44] mb-4">
                  {t('corporate.partnership.title', language)}
                </h2>
                <p className="text-xl text-[#1A1A1A]/70 max-w-3xl mx-auto">
                  {t('corporate.partnership.subtitle', language)}
                </p>
              </motion.div>

              <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="bg-[#2563EB]/10 rounded-full w-20 h-20 flex items-center justify-center">
                    <Handshake className="h-10 w-10 text-[#2563EB]" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-[#0A1F44]">
                    {t('corporate.collab.title', language)}
                  </h3>
                  <p className="text-lg text-[#1A1A1A]/70 leading-relaxed">
                    {t('corporate.collab.p1', language)}
                  </p>
                  <p className="text-lg text-[#1A1A1A]/70 leading-relaxed">
                    {t('corporate.collab.p2', language)}
                  </p>
                </motion.div>

                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Card className="bg-gradient-to-br from-[#F8F9FA] to-white border-[#0A1F44]/10">
                    <CardContent className="p-8">
                      <h4 className="text-xl font-bold text-[#0A1F44] mb-6">{t('corporate.areas.title', language)}</h4>
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <div className="bg-[#2563EB]/10 rounded-full p-1 mt-1">
                            <CheckCircle2 className="h-5 w-5 text-[#2563EB]" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#0A1F44] mb-1">{t('corporate.areas.service.title', language)}</div>
                            <div className="text-sm text-[#1A1A1A]/70">{t('corporate.areas.service.desc', language)}</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-[#2563EB]/10 rounded-full p-1 mt-1">
                            <CheckCircle2 className="h-5 w-5 text-[#2563EB]" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#0A1F44] mb-1">{t('corporate.areas.tech.title', language)}</div>
                            <div className="text-sm text-[#1A1A1A]/70">{t('corporate.areas.tech.desc', language)}</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-[#2563EB]/10 rounded-full p-1 mt-1">
                            <CheckCircle2 className="h-5 w-5 text-[#2563EB]" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#0A1F44] mb-1">{t('corporate.areas.reseller.title', language)}</div>
                            <div className="text-sm text-[#1A1A1A]/70">{t('corporate.areas.reseller.desc', language)}</div>
                          </div>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="bg-[#2563EB]/10 rounded-full p-1 mt-1">
                            <CheckCircle2 className="h-5 w-5 text-[#2563EB]" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#0A1F44] mb-1">{t('corporate.areas.strategic.title', language)}</div>
                            <div className="text-sm text-[#1A1A1A]/70">{t('corporate.areas.strategic.desc', language)}</div>
                          </div>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Why Partner With Us */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-[#0A1F44] to-[#1e3a5f] border-0 text-white">
                  <CardContent className="p-8 lg:p-12">
                    <div className="text-center mb-12">
                      <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('corporate.why.title', language)}</h3>
                      <p className="text-white/90 text-lg">Professional, reliable and committed to mutual success</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                      <div className="text-center">
                        <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="font-bold mb-2">Established & Compliant</h4>
                        <p className="text-sm text-white/80">Registered company with ICO compliance and professional governance</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Target className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="font-bold mb-2">UK Market Focus</h4>
                        <p className="text-sm text-white/80">Dedicated to serving UK businesses with local expertise</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-white/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Users className="h-8 w-8 text-white" />
                        </div>
                        <h4 className="font-bold mb-2">Long-Term Relationships</h4>
                        <p className="text-sm text-white/80">We prioritise sustainable partnerships over short-term gains</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Partnership CTA */}
              <motion.div
                className="text-center mt-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gradient-to-br from-[#F8F9FA] to-white border-[#0A1F44]/10">
                  <CardContent className="p-8 lg:p-12">
                    <Mail className="h-12 w-12 text-[#2563EB] mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-[#0A1F44] mb-4">Interested in Partnering?</h3>
                    <p className="text-lg text-[#1A1A1A]/70 mb-6 max-w-2xl mx-auto">
                      Get in touch to discuss partnership opportunities. We're happy to explore how we can work together to deliver exceptional services to UK businesses.
                    </p>
                    <Button
                      asChild
                      size="lg"
                      className="px-8 py-6 text-lg"
                    >
                      <Link to="/contactus">
                        Contact Us About Partnerships
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Company Information */}
        <section className="bg-gradient-to-br from-[#F8F9FA] to-white py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44] mb-4">
                  {t('corporate.info.title', language)}
                </h2>
                <p className="text-xl text-[#1A1A1A]/70">
                  Official registration and compliance information
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-8">
                      <Building2 className="h-12 w-12 text-[#2563EB] mb-4" />
                      <h3 className="text-2xl font-bold text-[#0A1F44] mb-4">Companies House</h3>
                      <div className="space-y-3 text-[#1A1A1A]/70">
                        <p><strong className="text-[#0A1F44]">Registered Name:</strong> JA Group Services Ltd</p>
                        <p><strong className="text-[#0A1F44]">Company Number:</strong> 16314179</p>
                        <p><strong className="text-[#0A1F44]">Registered Address:</strong><br />167-169 Great Portland Street<br />London, W1W 5PF<br />United Kingdom</p>
                      </div>
                      <Button
                        asChild
                        className="mt-6 w-full"
                        variant="outline"
                      >
                        <a
                          href="https://find-and-update.company-information.service.gov.uk/company/16314179"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View on Companies House
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-8">
                      <Shield className="h-12 w-12 text-[#2563EB] mb-4" />
                      <h3 className="text-2xl font-bold text-[#0A1F44] mb-4">Data Protection</h3>
                      <div className="space-y-3 text-[#1A1A1A]/70">
                        <p><strong className="text-[#0A1F44]">ICO Registration:</strong> ZB877370</p>
                        <p><strong className="text-[#0A1F44]">Status:</strong> GDPR Compliant</p>
                        <p className="text-sm">We are registered with the Information Commissioner's Office and comply with UK GDPR requirements for data protection.</p>
                      </div>
                      <Button
                        asChild
                        className="mt-6 w-full"
                        variant="outline"
                      >
                        <a
                          href="https://ico.org.uk/ESDWebPages/Entry/ZB877370"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View ICO Registration
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Group Structure */}
        <section className="bg-white py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44] mb-4">
                  Corporate Structure
                </h2>
                <p className="text-xl text-[#1A1A1A]/70">
                  Our organisational framework
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardContent className="p-8 lg:p-12">
                    <div className="space-y-8">
                      <div>
                        <h3 className="text-2xl font-bold text-[#0A1F44] mb-4">Parent Company</h3>
                        <p className="text-lg text-[#1A1A1A]/70 mb-4">
                          JA Group Services Ltd is a wholly-owned subsidiary of JSDS Group Ltd, providing a structured framework for service delivery and operational management.
                        </p>
                        <Button
                          asChild
                          variant="outline"
                        >
                          <Link to="/jsds-group">
                            Learn About JSDS Group Ltd
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>

                      <div className="border-t pt-8">
                        <h3 className="text-2xl font-bold text-[#0A1F44] mb-4">Operating Framework</h3>
                        <p className="text-lg text-[#1A1A1A]/70 mb-6">
                          We operate as an active management and delivery organisation, prioritising governance, compliance, and disciplined growth over short-term expansion.
                        </p>
                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <div className="bg-[#2563EB]/10 rounded-full p-1 mt-0.5">
                              <div className="w-2 h-2 bg-[#2563EB] rounded-full" />
                            </div>
                            <span className="text-[#1A1A1A]/70">Structured, accountable and professionally governed operations</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="bg-[#2563EB]/10 rounded-full p-1 mt-0.5">
                              <div className="w-2 h-2 bg-[#2563EB] rounded-full" />
                            </div>
                            <span className="text-[#1A1A1A]/70">Clear responsibility and consistency of delivery</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="bg-[#2563EB]/10 rounded-full p-1 mt-0.5">
                              <div className="w-2 h-2 bg-[#2563EB] rounded-full" />
                            </div>
                            <span className="text-[#1A1A1A]/70">Long-term operational stability and sustainable growth</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Legal & Policies */}
        <section className="bg-gradient-to-br from-[#F8F9FA] to-white py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44] mb-4">
                  Legal & Policies
                </h2>
                <p className="text-xl text-[#1A1A1A]/70">
                  Our commitment to transparency and compliance
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <FileText className="h-10 w-10 text-[#2563EB] mb-4" />
                      <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">Privacy Policy</h3>
                      <p className="text-sm text-[#1A1A1A]/70 mb-4">How we collect, use and protect your data</p>
                      <Button asChild variant="link" className="p-0 h-auto">
                        <Link to="/privacy-policy">Read Policy →</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <FileText className="h-10 w-10 text-[#2563EB] mb-4" />
                      <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">Terms of Service</h3>
                      <p className="text-sm text-[#1A1A1A]/70 mb-4">Terms and conditions for using our services</p>
                      <Button asChild variant="link" className="p-0 h-auto">
                        <Link to="/terms-of-service">Read Terms →</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <FileText className="h-10 w-10 text-[#2563EB] mb-4" />
                      <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">Cookies Policy</h3>
                      <p className="text-sm text-[#1A1A1A]/70 mb-4">Information about cookies and tracking</p>
                      <Button asChild variant="link" className="p-0 h-auto">
                        <Link to="/cookies-policy">Read Policy →</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <FileText className="h-10 w-10 text-[#2563EB] mb-4" />
                      <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">Complaints Policy</h3>
                      <p className="text-sm text-[#1A1A1A]/70 mb-4">How to raise concerns or complaints</p>
                      <Button asChild variant="link" className="p-0 h-auto">
                        <Link to="/complaints-policy">Read Policy →</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <FileText className="h-10 w-10 text-[#2563EB] mb-4" />
                      <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">Translation Disclaimer</h3>
                      <p className="text-sm text-[#1A1A1A]/70 mb-4">Information about translated content</p>
                      <Button asChild variant="link" className="p-0 h-auto">
                        <Link to="/translation-disclaimer">Read Disclaimer →</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gradient-to-br from-[#0A1F44] to-[#1e3a5f] py-20 lg:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-4xl mx-auto text-center space-y-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">
                Questions About Our Corporate Governance?
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Contact us for more information about our structure, policies, compliance or partnership opportunities
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-[#0A1F44] hover:bg-white/90 px-8 py-6 text-lg"
              >
                <Link to="/contactus">
                  Contact Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
