import { motion } from 'motion/react';
import { Cookie, Shield, Settings, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CookiesPolicyPage() {
  const cookieTypes = [
    {
      icon: Shield,
      title: 'Strictly Necessary Cookies',
      description: 'Essential for the website to function properly',
      examples: ['Session management', 'Security features', 'Cookie consent preferences'],
      retention: 'Session or up to 1 year',
      canDisable: false,
    },
    {
      icon: Settings,
      title: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalisation',
      examples: ['Language preferences', 'Region selection', 'User interface customisation'],
      retention: 'Up to 2 years',
      canDisable: true,
    },
    {
      icon: Info,
      title: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website',
      examples: ['Google Analytics', 'Page view tracking', 'User behavior analysis'],
      retention: 'Up to 2 years',
      canDisable: true,
    },
  ];

  return (
    <>
      <title>Cookies Policy - JA Group Services</title>
      <meta
        name="description"
        content="Learn about how JA Group Services Ltd uses cookies and similar technologies on our website"
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-[#0A1F44] text-white py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-[#2563EB]/20 text-[#87CEEB] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Cookie className="h-4 w-4" />
                Legal Information
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">Cookies Policy</h1>
              <p className="text-xl text-white/80 leading-relaxed">
                How we use cookies and similar technologies on our website
              </p>
            </motion.div>
          </div>
        </section>

        {/* Last Updated */}
        <section className="py-8 bg-[#FAFAF9] border-b border-[#0A1F44]/10">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto text-center"
            >
              <p className="text-sm text-[#1A1A1A]/60">
                <strong>Last Updated:</strong> February 2026
              </p>
            </motion.div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-serif font-bold text-[#0A1F44] mb-6">What Are Cookies?</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
                  Cookies are small text files that are placed on your device when you visit our website. They
                  help us provide you with a better experience by remembering your preferences and understanding
                  how you use our site.
                </p>
                <p className="text-[#1A1A1A]/70 leading-relaxed">
                  This Cookies Policy explains what cookies are, how we use them, and how you can control them.
                  By using our website, you consent to our use of cookies in accordance with this policy.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Cookie Types */}
        <section className="py-16 bg-[#FAFAF9]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-serif font-bold text-[#0A1F44] mb-3">
                Types of Cookies We Use
              </h2>
              <p className="text-lg text-[#1A1A1A]/70">
                We use different types of cookies for various purposes
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto space-y-6">
              {cookieTypes.map((type, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="border-[#0A1F44]/10">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#2563EB]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <type.icon className="h-6 w-6 text-[#2563EB]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <CardTitle className="text-xl font-serif text-[#0A1F44]">
                              {type.title}
                            </CardTitle>
                            {type.canDisable ? (
                              <span className="inline-flex items-center gap-1 bg-[#87CEEB]/20 text-[#0A1F44] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                Optional
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-[#2563EB]/10 text-[#2563EB] px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap">
                                Required
                              </span>
                            )}
                          </div>
                          <CardDescription className="text-[#1A1A1A]/70">
                            {type.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-semibold text-[#0A1F44] mb-2">Examples:</h4>
                          <ul className="space-y-1">
                            {type.examples.map((example, exampleIndex) => (
                              <li key={exampleIndex} className="text-sm text-[#1A1A1A]/70 flex items-start gap-2">
                                <span className="text-[#2563EB] mt-1">•</span>
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#0A1F44]/10">
                          <span className="text-sm text-[#1A1A1A]/60">
                            <strong>Retention:</strong> {type.retention}
                          </span>
                          {type.canDisable && (
                            <span className="text-sm text-[#2563EB]">
                              Can be disabled in settings
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How We Use Cookies */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-serif font-bold text-[#0A1F44] mb-6">
                How We Use Cookies
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#0A1F44] mb-3">Essential Website Functions</h3>
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    We use strictly necessary cookies to enable core functionality such as security, network
                    management, and accessibility. These cookies are essential for the website to function and
                    cannot be disabled.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-[#0A1F44] mb-3">Analytics and Performance</h3>
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    We use analytics cookies to understand how visitors interact with our website. This helps us
                    improve our services and user experience. We use Google Analytics, which collects information
                    anonymously and reports website trends without identifying individual visitors.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-[#0A1F44] mb-3">Personalization</h3>
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    Functional cookies allow us to remember your preferences and provide enhanced features. This
                    includes remembering your language preference, region selection, and other customisation
                    options.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Third-Party Cookies */}
        <section className="py-16 bg-[#FAFAF9]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-serif font-bold text-[#0A1F44] mb-6">
                Third-Party Cookies
              </h2>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-6">
                In addition to our own cookies, we may use third-party cookies to help us analyse website usage
                and improve our services. These third parties include:
              </p>
              <div className="space-y-4">
                <Card className="border-[#0A1F44]/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-serif text-[#0A1F44]">Google Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#1A1A1A]/70 leading-relaxed">
                      We use Google Analytics to understand how visitors use our website. Google Analytics uses
                      cookies to collect information about your use of our website in an anonymous form. For more
                      information about Google Analytics cookies, please see Google's privacy policy.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Managing Cookies */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-serif font-bold text-[#0A1F44] mb-6">
                Managing Your Cookie Preferences
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-[#0A1F44] mb-3">Cookie Banner</h3>
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    When you first visit our website, you'll see a cookie consent banner. You can choose to accept
                    or decline optional cookies. Your preferences will be saved and you can change them at any
                    time.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-[#0A1F44] mb-3">Browser Settings</h3>
                  <p className="text-[#1A1A1A]/70 leading-relaxed mb-3">
                    Most web browsers allow you to control cookies through their settings. You can set your browser
                    to refuse cookies or delete certain cookies. Please note that if you disable cookies, some
                    features of our website may not function properly.
                  </p>
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    For more information about managing cookies in your browser, please refer to your browser's
                    help documentation:
                  </p>
                  <ul className="mt-3 space-y-2">
                    <li className="text-sm text-[#1A1A1A]/70 flex items-start gap-2">
                      <span className="text-[#2563EB] mt-1">•</span>
                      <a
                        href="https://support.google.com/chrome/answer/95647"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2563EB] hover:underline"
                      >
                        Google Chrome
                      </a>
                    </li>
                    <li className="text-sm text-[#1A1A1A]/70 flex items-start gap-2">
                      <span className="text-[#2563EB] mt-1">•</span>
                      <a
                        href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2563EB] hover:underline"
                      >
                        Mozilla Firefox
                      </a>
                    </li>
                    <li className="text-sm text-[#1A1A1A]/70 flex items-start gap-2">
                      <span className="text-[#2563EB] mt-1">•</span>
                      <a
                        href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2563EB] hover:underline"
                      >
                        Safari
                      </a>
                    </li>
                    <li className="text-sm text-[#1A1A1A]/70 flex items-start gap-2">
                      <span className="text-[#2563EB] mt-1">•</span>
                      <a
                        href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2563EB] hover:underline"
                      >
                        Microsoft Edge
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-[#0A1F44] mb-3">Opt-Out of Analytics</h3>
                  <p className="text-[#1A1A1A]/70 leading-relaxed">
                    You can opt out of Google Analytics tracking by installing the{' '}
                    <a
                      href="https://tools.google.com/dlpage/gaoptout"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563EB] hover:underline"
                    >
                      Google Analytics Opt-out Browser Add-on
                    </a>
                    .
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Updates to Policy */}
        <section className="py-16 bg-[#FAFAF9]">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-serif font-bold text-[#0A1F44] mb-6">
                Updates to This Policy
              </h2>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
                We may update this Cookies Policy from time to time to reflect changes in our practices or for
                other operational, legal, or regulatory reasons. We will notify you of any material changes by
                posting the updated policy on our website with a new "Last Updated" date.
              </p>
              <p className="text-[#1A1A1A]/70 leading-relaxed">
                We encourage you to review this policy periodically to stay informed about how we use cookies.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl font-serif font-bold text-[#0A1F44] mb-6">Contact Us</h2>
              <p className="text-[#1A1A1A]/70 leading-relaxed mb-4">
                If you have any questions about our use of cookies or this Cookies Policy, please contact us:
              </p>
              <Card className="border-[#0A1F44]/10 bg-[#FAFAF9]">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0A1F44] mb-1">Email:</p>
                      <a
                        href="mailto:hello@jagroupservices.co.uk"
                        className="text-[#2563EB] hover:underline"
                      >
                        hello@jagroupservices.co.uk
                      </a>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A1F44] mb-1">Registered Address:</p>
                      <p className="text-sm text-[#1A1A1A]/70">
                        167-169 Great Portland Street
                        <br />
                        5th Floor
                        <br />
                        London, W1W 5PF
                        <br />
                        United Kingdom
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A1F44] mb-1">Company Number:</p>
                      <p className="text-sm text-[#1A1A1A]/70">16314179</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A1F44] mb-1">ICO Registration:</p>
                      <p className="text-sm text-[#1A1A1A]/70">ZB877370</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>
    </>
  );
}
