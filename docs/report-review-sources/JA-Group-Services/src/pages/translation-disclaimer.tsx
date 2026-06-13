import { motion } from 'motion/react';
import { Languages, AlertCircle, FileText, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function TranslationDisclaimerPage() {
  return (
    <>
      <title>Translation Disclaimer - JA Group Services</title>
      <meta
        name="description"
        content="Important disclaimer about our automated translation service powered by Google Translate, including limitations, accuracy notices, and legal terms"
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
                <Languages className="h-4 w-4" />
                TRANSLATION SERVICES
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Translation Disclaimer
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Understanding our automated translation service, its limitations, and your rights
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

        {/* Main Content */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
              {/* Introduction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2">
                  <CardHeader className="bg-gradient-to-r from-[#0A1F44] to-[#1a3a5c] text-white">
                    <div className="flex items-center gap-3">
                      <Languages className="h-6 w-6" />
                      <CardTitle className="text-2xl">About Our Translation Service</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-4">
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        JA Group Services Ltd provides automated translation services powered by <strong>Google Translate</strong> to make our website content accessible to users worldwide. This service is provided as a convenience to help non-English speakers access information about our services.
                      </p>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        <strong>Last Updated:</strong> February 2026
                      </p>
                      <p className="text-[#1A1A1A]/70 leading-relaxed">
                        <strong>Company Number:</strong> 16314179
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* How It Works */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-[#2563EB]" />
                      <CardTitle className="text-2xl text-[#0A1F44]">How Translation Works</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">Automated Translation</h3>
                        <p className="text-[#1A1A1A]/70 leading-relaxed">
                          Our website uses Google Translate's automated translation technology to convert content from English into multiple languages. This translation happens in real-time when you select a language from the language selector in the footer.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">Available Languages</h3>
                        <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                          We currently support translation into the following languages:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-[#1A1A1A]/70">
                          <div>• Spanish (Español)</div>
                          <div>• French (Français)</div>
                          <div>• German (Deutsch)</div>
                          <div>• Italian (Italiano)</div>
                          <div>• Portuguese (Português)</div>
                          <div>• Russian (Русский)</div>
                          <div>• Chinese (中文)</div>
                          <div>• Japanese (日本語)</div>
                          <div>• Arabic (العربية)</div>
                          <div>• Hindi (हिन्दी)</div>
                          <div>• Polish (Polski)</div>
                          <div>• Dutch (Nederlands)</div>
                          <div>• Turkish (Türkçe)</div>
                          <div>• Korean (한국어)</div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">Language Preference Storage</h3>
                        <p className="text-[#1A1A1A]/70 leading-relaxed">
                          Your language preference is saved in your browser's local storage. When you return to our website, it will automatically display in your previously selected language.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Limitations and Disclaimers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-2 border-amber-200">
                  <CardHeader className="bg-amber-50">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-6 w-6 text-amber-600" />
                      <CardTitle className="text-2xl text-[#0A1F44]">Important Limitations</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                        <p className="text-amber-900 font-semibold mb-2">⚠️ Translation Accuracy</p>
                        <p className="text-amber-800 text-sm leading-relaxed">
                          Automated translations are provided by third-party technology and may not be completely accurate. Machine translation cannot capture nuances, context, or specialised terminology as effectively as human translation.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">Known Limitations</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span className="text-[#1A1A1A]/70"><strong>Technical Terms:</strong> Industry-specific terminology may not translate accurately</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span className="text-[#1A1A1A]/70"><strong>Legal Language:</strong> Legal terms and conditions may lose precision in translation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span className="text-[#1A1A1A]/70"><strong>Cultural Context:</strong> Idioms, phrases, and cultural references may not translate appropriately</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span className="text-[#1A1A1A]/70"><strong>Formatting:</strong> Some page layouts or formatting may be affected by translation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-amber-600 mt-1">•</span>
                            <span className="text-[#1A1A1A]/70"><strong>Updates:</strong> Newly added content may take time to be available for translation</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">Official Language</h3>
                        <p className="text-[#1A1A1A]/70 leading-relaxed">
                          <strong>English is the official language</strong> of JA Group Services Ltd and all our legal documents, policies, and agreements. In the event of any discrepancy or dispute regarding the interpretation of translated content, the English version shall prevail and be considered authoritative.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Legal Disclaimer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-2 border-red-200">
                  <CardHeader className="bg-red-50">
                    <div className="flex items-center gap-3">
                      <Shield className="h-6 w-6 text-red-600" />
                      <CardTitle className="text-2xl text-[#0A1F44]">Legal Disclaimer</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">No Warranty</h3>
                        <p className="text-[#1A1A1A]/70 leading-relaxed">
                          JA Group Services Ltd makes <strong>no warranties or representations</strong> regarding the accuracy, reliability, or completeness of any translated content. The translation service is provided "as is" without warranty of any kind, either express or implied.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">Limitation of Liability</h3>
                        <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                          JA Group Services Ltd shall not be liable for any losses, damages, or consequences arising from:
                        </p>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Errors, inaccuracies, or omissions in translated content</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Misunderstandings or misinterpretations of translated information</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Decisions made based on translated content</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-red-600 mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Technical issues or unavailability of the translation service</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">Third-Party Service</h3>
                        <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
                          The translation service is provided by <strong>Google Translate</strong>, a third-party service operated by Google LLC. We do not control and are not responsible for the translation algorithms, accuracy, or availability of this service.
                        </p>
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                          <p className="text-blue-900 font-semibold mb-2">Google Terms Apply</p>
                          <p className="text-blue-800 text-sm leading-relaxed mb-3">
                            By using the translation feature on this website, you agree to be bound by Google's Terms of Service and Privacy Policy:
                          </p>
                          <ul className="space-y-2 text-sm">
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span className="text-blue-800">
                                <strong>Google Terms of Service:</strong>{' '}
                                <a 
                                  href="https://policies.google.com/terms" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="underline hover:text-blue-900"
                                >
                                  https://policies.google.com/terms
                                </a>
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span className="text-blue-800">
                                <strong>Google Privacy Policy:</strong>{' '}
                                <a 
                                  href="https://policies.google.com/privacy" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="underline hover:text-blue-900"
                                >
                                  https://policies.google.com/privacy
                                </a>
                              </span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-blue-600 mt-1">•</span>
                              <span className="text-blue-800">
                                <strong>Google Translate Additional Terms:</strong>{' '}
                                <a 
                                  href="https://translate.google.com/intl/en/about/" 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="underline hover:text-blue-900"
                                >
                                  https://translate.google.com/intl/en/about/
                                </a>
                              </span>
                            </li>
                          </ul>
                          <p className="text-blue-800 text-sm leading-relaxed mt-3">
                            Google may collect data about your use of the translation service, including the text being translated. Please review Google's privacy policy to understand how your data is processed.
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">Legal and Official Matters</h3>
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                          <p className="text-red-900 font-semibold mb-2">⚠️ Important Notice</p>
                          <p className="text-red-800 text-sm leading-relaxed">
                            For any legal, contractual, or official matters, you <strong>must refer to the original English version</strong> of our documents. Do not rely on translated versions for legal decisions, contract agreements, or official communications. If you require professional translation services, please contact us directly.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* User Rights and Responsibilities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-2xl text-[#0A1F44]">Your Rights and Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">Your Rights</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Access website content in your preferred language</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Switch between languages at any time</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Request clarification on translated content by contacting us</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Access the original English version at any time</span>
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-[#0A1F44] mb-3">Your Responsibilities</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Understand that translations may not be 100% accurate</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Verify important information in the original English version</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Contact us if you need clarification or professional translation</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[#2563EB] mt-1">•</span>
                            <span className="text-[#1A1A1A]/70">Accept that the English version is authoritative for legal purposes</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Contact Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="border-2 border-[#2563EB]">
                  <CardContent className="p-8">
                    <div className="text-center space-y-4">
                      <h3 className="text-2xl font-bold text-[#0A1F44]">Need Help with Translation?</h3>
                      <p className="text-[#1A1A1A]/70 leading-relaxed max-w-2xl mx-auto">
                        If you have questions about our translation service, need clarification on translated content, or require professional translation services, please contact us.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                        <Link to="/contactus">
                          <Button size="lg" className="bg-[#2563EB] hover:bg-[#2563EB]/90">
                            Contact Us
                          </Button>
                        </Link>
                        <a href="mailto:info@jagroupservices.co.uk">
                          <Button size="lg" variant="outline">
                            Email: info@jagroupservices.co.uk
                          </Button>
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Footer Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="text-center text-sm text-[#1A1A1A]/60 pt-8 border-t"
              >
                <p className="mb-2">
                  <strong>JA Group Services Ltd</strong> | Company No. 16314179 | ICO Registration: ZB877370
                </p>
                <p className="mb-2">
                  Registered Address: 167-169 Great Portland Street, 5th Floor, London, W1W 5PF, United Kingdom
                </p>
                <p>
                  Part of <strong>JSDS Group Ltd</strong>
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
