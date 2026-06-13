import { motion } from 'motion/react';
import { Megaphone, Calendar, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/translations';

export default function AnnouncementsPage() {
  const { language } = useLanguage();
  
  return (
    <>
      <title>{t('announcementsPage.title', language)} - JA Group Services</title>
      <meta
        name="description"
        content="Company announcements and updates from JA Group Services Ltd. Check back soon for news and developments."
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0A1F44] via-[#0A1F44] to-[#1a3a5c] text-white py-20 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-[#2563EB]/20 text-[#60A5FA] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#2563EB]/30">
                <Megaphone className="h-4 w-4" />
                {t('announcementsPage.badge', language)}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                {t('announcementsPage.title', language)}
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                {t('announcementsPage.subtitle', language)}
              </p>
            </motion.div>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-12 md:h-16" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#ffffff"></path>
            </svg>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto"
            >
              <Card className="border-2 border-dashed border-[#0A1F44]/20">
                <CardContent className="p-12 text-center">
                  <motion.div
                    initial={{ scale: 0.9 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <Rocket className="h-16 w-16 mx-auto mb-6 text-[#2563EB]" />
                  </motion.div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-[#0A1F44] mb-4">
                    Coming Soon
                  </h2>
                  
                  <p className="text-lg text-[#1A1A1A]/70 leading-relaxed mb-8">
                    Our announcements section will be available soon with company news, product updates, and important notices.
                  </p>
                  
                  <p className="text-[#1A1A1A]/60 mb-8">
                    Thank you for your patience as we build something great!
                  </p>
                  
                  <Link to="/contactus">
                    <Button size="lg" className="gap-2">
                      Contact Us for Updates
                      <Megaphone className="h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Stay Connected Section */}
        <section className="py-16 bg-gradient-to-br from-[#0A1F44] to-[#1a3a5c] text-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay Connected
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Want to be notified when we publish announcements? Get in touch with us and we'll keep you informed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/contactus">
                  <Button size="lg" variant="secondary">
                    Contact Us
                  </Button>
                </Link>
                <Link to="/">
                  <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
