import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Clock, Building2, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';


export default function ContactUsPage() {
  const { language } = useLanguage();

  return (
    <>
      <title>{t('contactPage.title', language)} - JA Group Services</title>
      <meta name="description" content="Get in touch with JA Group Services Ltd. Contact our team for inquiries about our services and corporate solutions." />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0A1F44] to-[#1e3a5f] text-white py-20 lg:py-32">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIvPjwvZz48L3N2Zz4=')] opacity-10"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-block px-4 py-2 bg-[#2563EB]/20 rounded-full mb-6">
                <span className="text-sm font-semibold text-[#60A5FA]">{t('contactPage.badge', language)}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                {t('contactPage.title', language)}
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                {t('contactPage.subtitle', language)}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto -mt-20 relative z-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Phone className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">{t('contactPage.info.phone', language)}</h3>
                    <a
                      href="tel:02038342790"
                      className="text-[#2563EB] hover:underline"
                    >
                      020 3834 2790
                    </a>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">{t('contactPage.info.email', language)}</h3>
                    <a
                      href="mailto:hello@jagroupservices.co.uk"
                      className="text-[#2563EB] hover:underline"
                    >
                      hello@jagroupservices.co.uk
                    </a>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MapPin className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">{t('contactPage.info.address', language)}</h3>
                    <p className="text-[#0A1F44]/70 text-sm">
                      167-169 Great Portland Street<br />
                      5th Floor<br />
                      London, W1W 5PF
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-6 h-6 text-[#2563EB]" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">Business Hours</h3>
                    <p className="text-[#0A1F44]/70 text-sm">
                      Monday - Friday<br />
                      9:00 AM - 5:00 PM GMT
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid lg:grid-cols-5 gap-8">
                {/* Left Column - Why Contact Us */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-2 space-y-6"
                >
                  <div>
                    <h2 className="text-3xl font-bold text-[#0A1F44] mb-4">
                      Why Contact Us?
                    </h2>
                    <p className="text-[#0A1F44]/70 leading-relaxed">
                      We're here to answer your questions and discuss how our services can support your organisation.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-[#2563EB]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-[#2563EB]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0A1F44] mb-1">Corporate Inquiries</h3>
                        <p className="text-sm text-[#0A1F44]/70">
                          Learn about our corporate structure and services
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-[#2563EB]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-[#2563EB]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0A1F44] mb-1">General Questions</h3>
                        <p className="text-sm text-[#0A1F44]/70">
                          Get answers to your questions about our operations
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-10 h-10 bg-[#2563EB]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-[#2563EB]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#0A1F44] mb-1">Professional Support</h3>
                        <p className="text-sm text-[#0A1F44]/70">
                          Connect with our team for professional assistance
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right Column - Coming Soon */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="lg:col-span-3"
                >
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-md">
                    <CardContent className="p-8">
                      <div className="text-center py-12">
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.5 }}
                          className="mb-6"
                        >
                          <MessageSquare className="w-20 h-20 mx-auto text-[#2563EB] mb-4" />
                          <h3 className="text-3xl font-bold text-[#0A1F44] mb-4">Contact Form Coming Soon</h3>
                          <p className="text-lg text-[#0A1F44]/70 max-w-md mx-auto">
                            We're currently setting up our contact form. In the meantime, please reach out to us using the contact information provided.
                          </p>
                        </motion.div>
                        
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ duration: 0.5, delay: 0.2 }}
                          className="inline-flex items-center gap-2 bg-[#2563EB]/10 text-[#2563EB] px-6 py-3 rounded-full font-semibold"
                        >
                          <Clock className="w-5 h-5" />
                          <span>Available Soon</span>
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Company Information */}
        <section className="py-16 lg:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-[#0A1F44] mb-6 text-center">
                    Company Information
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-[#0A1F44] mb-2">Registered Company</h4>
                      <p className="text-[#0A1F44]/70 text-sm mb-1">JA Group Services Ltd</p>
                      <p className="text-[#0A1F44]/70 text-sm">
                        Company No.{' '}
                        <a
                          href="https://find-and-update.company-information.service.gov.uk/company/16314179"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2563EB] hover:underline"
                        >
                          16314179
                        </a>
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#0A1F44] mb-2">Data Protection</h4>
                      <p className="text-[#0A1F44]/70 text-sm">
                        ICO Registration:{' '}
                        <a
                          href="https://ico.org.uk/ESDWebPages/Entry/ZB877370"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2563EB] hover:underline"
                        >
                          ZB877370
                        </a>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
