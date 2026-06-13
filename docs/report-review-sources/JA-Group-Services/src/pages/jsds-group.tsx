import { motion } from 'motion/react';
import { Building2, Shield, Users, TrendingUp, ChevronRight, Mail, MapPin, Phone, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function JSDSGroupPage() {
  return (
    <>
      <title>JSDS Group Ltd - Parent Company & Strategic Holdings</title>
      <meta name="description" content="JSDS Group Ltd is the parent holding company providing strategic oversight, governance, and long-term direction for our subsidiary companies and business divisions." />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0A1F44] via-[#1e3a5f] to-[#0A1F44] text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 py-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <Badge className="bg-white/20 text-white border-white/30 mb-6 backdrop-blur-sm">
              PARENT HOLDING COMPANY
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              JSDS Group Ltd
            </h1>
            
            <div className="w-24 h-1 bg-[#2563EB] mx-auto mb-6"></div>
            
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              Strategic oversight and governance for our portfolio of subsidiary companies and business divisions
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-[#2563EB] hover:bg-[#2563EB]/90 text-white"
                asChild
              >
                <a href="#subsidiaries">
                  Our Subsidiaries
                  <ChevronRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                asChild
              >
                <a href="#contact">
                  Contact Us
                </a>
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <Badge className="bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 mb-4">
              WHO WE ARE
            </Badge>
            <h2 className="text-4xl font-bold text-[#0A1F44] mb-6">
              Strategic Parent Company
            </h2>
            <p className="text-lg text-[#0A1F44]/70 leading-relaxed">
              JSDS Group Ltd serves as the parent holding company, providing strategic direction, 
              governance frameworks, and long-term oversight for our portfolio of subsidiary companies. 
              We ensure operational excellence, regulatory compliance, and sustainable growth across 
              all business divisions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: 'Governance',
                description: 'Robust corporate governance and compliance frameworks across all subsidiaries',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
              },
              {
                icon: Building2,
                title: 'Strategic Oversight',
                description: 'Long-term strategic planning and direction for subsidiary operations',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
              },
              {
                icon: Users,
                title: 'Leadership',
                description: 'Executive leadership and management support for business divisions',
                color: 'text-green-600',
                bg: 'bg-green-50',
              },
              {
                icon: TrendingUp,
                title: 'Growth',
                description: 'Sustainable growth strategies and investment in subsidiary development',
                color: 'text-orange-600',
                bg: 'bg-orange-50',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${item.bg} rounded-lg flex items-center justify-center mb-4`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-[#0A1F44] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#0A1F44]/60 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Subsidiaries Section */}
      <section id="subsidiaries" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <Badge className="bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 mb-4">
              OUR PORTFOLIO
            </Badge>
            <h2 className="text-4xl font-bold text-[#0A1F44] mb-6">
              Subsidiary Companies
            </h2>
            <p className="text-lg text-[#0A1F44]/70 leading-relaxed">
              JSDS Group Ltd maintains full ownership and strategic oversight of our subsidiary companies, 
              each operating with professional autonomy within our governance framework.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-[#2563EB]/20 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-[#2563EB] to-[#1e40af] p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-white/20 text-white border-white/30 mb-3 backdrop-blur-sm">
                        WHOLLY-OWNED SUBSIDIARY
                      </Badge>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        JA Group Services Ltd
                      </h3>
                      <p className="text-white/90">
                        Company No. 16314179
                      </p>
                    </div>
                    <Building2 className="w-16 h-16 text-white/30" />
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <p className="text-[#0A1F44]/70 mb-6 leading-relaxed">
                    JA Group Services Ltd operates as our primary subsidiary company, providing structured 
                    and professionally governed operating frameworks for business divisions and strategic partnerships.
                  </p>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#2563EB] rounded-full mt-2"></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#0A1F44] mb-2">Primary Division</h4>
                        <img 
                          src="/assets/ja-domain-hub-logo-new.png" 
                          alt="JA Domain Hub" 
                          className="h-12 w-auto object-contain"
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#2563EB] rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-[#0A1F44] mb-1">Corporate Focus</h4>
                        <p className="text-sm text-[#0A1F44]/60">Governance, accountability, and professional infrastructure</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-[#2563EB] rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-semibold text-[#0A1F44] mb-1">Strategic Partnerships</h4>
                        <p className="text-sm text-[#0A1F44]/60">Managed partnerships and business development initiatives</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-[#2563EB] hover:bg-[#2563EB]/90 text-white"
                      asChild
                    >
                      <Link to="/">
                        Visit Website
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      asChild
                    >
                      <Link to="/about-us">
                        Learn More
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Corporate Values */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center mb-16"
          >
            <Badge className="bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 mb-4">
              OUR PRINCIPLES
            </Badge>
            <h2 className="text-4xl font-bold text-[#0A1F44] mb-6">
              Corporate Values
            </h2>
            <p className="text-lg text-[#0A1F44]/70 leading-relaxed">
              Our values guide every decision and shape the culture across all subsidiary companies.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Accountability',
                description: 'We maintain the highest standards of corporate accountability and transparency in all operations.',
              },
              {
                title: 'Long-Term Vision',
                description: 'Strategic planning focused on sustainable growth and long-term value creation for stakeholders.',
              },
              {
                title: 'Professional Excellence',
                description: 'Commitment to professional standards, regulatory compliance, and operational excellence.',
              },
            ].map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1e40af] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">{index + 1}</span>
                    </div>
                    <h3 className="text-xl font-bold text-[#0A1F44] mb-3">
                      {value.title}
                    </h3>
                    <p className="text-[#0A1F44]/60 leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Corporate Information Section */}
      <section id="contact" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <Badge className="bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20 mb-4">
                CORPORATE INFORMATION
              </Badge>
              <h2 className="text-4xl font-bold text-[#0A1F44] mb-6">
                Parent Holding Company
              </h2>
              <p className="text-lg text-[#0A1F44]/70 leading-relaxed">
                JSDS Group Ltd is a strategic holding company providing governance and oversight. 
                All operational enquiries should be directed to our subsidiary company.
              </p>
            </div>

            <Card className="border-2 border-[#2563EB]/20 bg-gradient-to-br from-[#0A1F44] to-[#1e3a5f] text-white shadow-xl mb-8">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-3">JSDS Group Ltd</h3>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      Parent Holding Company
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      Registered in England & Wales
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-2 text-white/80">
                  <MapPin className="w-4 h-4" />
                  <p className="text-sm">
                    167-169 Great Portland Street, London, W1W 5PF, United Kingdom
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#2563EB]/20 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#0A1F44] mb-3">For All Enquiries</h3>
                    <p className="text-[#0A1F44]/70 mb-4 leading-relaxed">
                      JSDS Group Ltd does not engage in direct public or commercial operations. 
                      For all business enquiries, partnerships, services, or general contact, please reach out to our subsidiary company:
                    </p>
                    <div className="bg-slate-50 rounded-lg p-6 mb-4">
                      <h4 className="font-semibold text-[#0A1F44] mb-3">JA Group Services Ltd</h4>
                      <div className="space-y-2 text-sm text-[#0A1F44]/70">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-[#2563EB]" />
                          <a href="mailto:hello@jagroupservices.co.uk" className="text-[#2563EB] hover:underline font-medium">
                            hello@jagroupservices.co.uk
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#2563EB]" />
                          <span>167-169 Great Portland Street, London, W1W 5PF</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white"
                      asChild
                    >
                      <Link to="/">
                        Visit JA Group Services Ltd Website
                        <ChevronRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-br from-[#0A1F44] to-[#1e3a5f] text-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-4">
              Strategic Leadership for Sustainable Growth
            </h2>
            <p className="text-white/80 mb-8 text-lg">
              JSDS Group Ltd provides the governance, oversight, and strategic direction 
              that enables our subsidiaries to thrive.
            </p>
            <Button 
              size="lg" 
              className="bg-white text-[#0A1F44] hover:bg-white/90"
              asChild
            >
              <Link to="/">
                Visit JA Group Services Ltd
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}