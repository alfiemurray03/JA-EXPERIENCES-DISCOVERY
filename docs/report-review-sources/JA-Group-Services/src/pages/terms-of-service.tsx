import { motion } from 'motion/react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <>
      <title>Terms of Service - JA Group Services</title>
      <meta
        name="description"
        content="Terms of Service for JA Group Services Ltd. Read our terms governing the use of our platform and services."
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-[#0A1F44] via-[#0A1F44] to-[#1a3a5c] text-white py-20 overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 bg-[#2563EB]/20 text-[#60A5FA] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[#2563EB]/30">
                <FileText className="h-4 w-4" />
                LEGAL INFORMATION
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Terms of Service
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Terms governing your use of JA Group Services Ltd platforms and services
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
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <Card className="border-2">
                  <CardHeader className="bg-gradient-to-r from-[#0A1F44] to-[#1a3a5c] text-white">
                    <CardTitle className="text-2xl">JA Group Services Ltd – Terms of Service</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="prose prose-slate max-w-none">
                      <p className="text-sm text-[#1A1A1A]/60 mb-8">
                        <strong>Effective Date:</strong> 21 March 2026
                      </p>

                      <div className="border-b border-[#0A1F44]/10 pb-4 mb-8"></div>

                      {/* Section 1 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">1. Introduction</h2>
                      <p className="mb-4">1.1 These Terms of Service ("Terms") govern your access to and use of the websites, platforms, services, and digital environments operated by or on behalf of JA Group Services Ltd (the "Company", "we", "us", or "our").</p>
                      <p className="mb-4">1.2 JA Group Services Ltd is a company incorporated in England and Wales with company number 16314179 and registered office at 167–169 Great Portland Street, 5th Floor, London, W1W 5PF, United Kingdom.</p>
                      <p className="mb-4">1.3 The Company operates under the trading name "JA Group Services" as its primary brand.</p>
                      <p className="mb-4">1.4 The Company also operates "JA Domain Hub" as a division and trading name. It forms part of JA Group Services Ltd and does not constitute a separate legal entity.</p>
                      <p className="mb-4">1.5 These Terms apply to:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>jagroupservices.co.uk and all associated domains;</li>
                        <li>any subdomains, applications, or portals operated by the Company;</li>
                        <li>all services, tools, features, and systems made available by the Company;</li>
                        <li>all divisions and branded environments operated under JA Group Services Ltd.</li>
                      </ul>
                      <p className="mb-4">1.6 By accessing or using the Platform, you agree to be legally bound by these Terms.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 2 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">2. Definitions</h2>
                      <p className="mb-2"><strong>"Business User"</strong> means a person acting for purposes relating to a trade, business, craft, or profession.</p>
                      <p className="mb-2"><strong>"Consumer"</strong> means an individual acting for purposes wholly or mainly outside their trade, business, craft, or profession.</p>
                      <p className="mb-2"><strong>"Platform"</strong> means any website, system, application, or digital environment operated by or on behalf of the Company.</p>
                      <p className="mb-2"><strong>"Third Party Services"</strong> means services, products, or systems provided by external providers and made accessible through the Platform.</p>
                      <p className="mb-4"><strong>"User"</strong> means any individual or organisation accessing or using the Platform.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 3 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">3. Nature of Services</h2>
                      <p className="mb-4">3.1 JA Group Services Ltd operates as a digital platform provider, intermediary, introducer, and service organiser.</p>
                      <p className="mb-4">3.2 The Company may:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>provide access to digital platforms, tools, and systems;</li>
                        <li>present, organise, or promote services under its branding;</li>
                        <li>facilitate introductions between users and third-party providers;</li>
                        <li>provide administrative, informational, and customer support functions;</li>
                        <li>operate branded divisions and digital environments.</li>
                      </ul>
                      <p className="mb-4">3.3 The Company's role is facilitative in nature.</p>
                      <p className="mb-4">3.4 Unless expressly stated otherwise, the Company does not provide the underlying services made available through the Platform.</p>
                      <p className="mb-4">3.5 The Company does not:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>operate third-party infrastructure or systems;</li>
                        <li>control the delivery or performance of Third Party Services;</li>
                        <li>act as merchant of record for Third Party Services unless expressly stated;</li>
                        <li>assume contractual responsibility for third-party services.</li>
                      </ul>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 4 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">4. Operation of the Platform</h2>
                      <p className="mb-4">4.1 The Platform provides a structured digital environment through which users may access services, tools, and third-party offerings.</p>
                      <p className="mb-4">4.2 Depending on the section of the Platform, users may:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>access information published by the Company;</li>
                        <li>interact with services presented under Company branding;</li>
                        <li>be redirected to external websites or systems;</li>
                        <li>engage with services provided by third-party providers.</li>
                      </ul>
                      <p className="mb-4">4.3 Certain parts of the Platform may:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>operate using third-party infrastructure;</li>
                        <li>include embedded or integrated third-party systems;</li>
                        <li>redirect users to external platforms or providers.</li>
                      </ul>
                      <p className="mb-4">4.4 The presentation of services within the Platform does not indicate that the Company provides or operates those services.</p>
                      <p className="mb-4">4.5 Users are responsible for reviewing and accepting the terms of any third-party provider before engaging with their services.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 5 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">5. Contracting and Intermediary Role</h2>
                      <p className="mb-4">5.1 The Company operates as an intermediary and introducer of services.</p>
                      <p className="mb-4">5.2 Where services are provided directly by the Company, any contract shall be between you and JA Group Services Ltd.</p>
                      <p className="mb-4">5.3 Where services are provided by a Third Party Provider:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>this will be clearly indicated;</li>
                        <li>your contract will be formed directly with that provider;</li>
                        <li>the provider's terms and conditions shall apply.</li>
                      </ul>
                      <p className="mb-4">5.4 In such cases, the Company is not a party to that contract and does not assume responsibility for service delivery, performance, or outcomes.</p>
                      <p className="mb-4">5.5 Any assistance or support provided by the Company does not constitute responsibility for the underlying service.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 6 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">6. Divisions and Trading Names</h2>
                      <p className="mb-4">6.1 The Company may operate under various branding or trading names.</p>
                      <p className="mb-4">6.2 Each division:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>forms part of JA Group Services Ltd;</li>
                        <li>is not a separate legal entity;</li>
                        <li>may be subject to additional service-specific terms.</li>
                      </ul>
                      <p className="mb-4">6.3 Where division-specific or service-specific terms apply, those terms must be read alongside these Terms and shall take precedence in the event of any inconsistency.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 7 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">7. Third Party Services</h2>
                      <p className="mb-4">7.1 The Platform may include or provide access to Third Party Services.</p>
                      <p className="mb-4">7.2 Where a user engages with such services:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>the contract is formed directly with the third-party provider;</li>
                        <li>the provider's terms apply;</li>
                        <li>the Company is not a party to that contract.</li>
                      </ul>
                      <p className="mb-4">7.3 The Company shall not be responsible for:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>the performance or quality of Third Party Services;</li>
                        <li>availability, pricing, or delivery;</li>
                        <li>delays, disruptions, or failures;</li>
                        <li>disputes between users and providers.</li>
                      </ul>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 8 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">8. Partnerships and Commercial Arrangements</h2>
                      <p className="mb-4">8.1 The Company may enter into commercial relationships with third parties.</p>
                      <p className="mb-4">8.2 These arrangements may include:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>affiliate partnerships;</li>
                        <li>reseller or referral arrangements;</li>
                        <li>integrations with third-party systems;</li>
                        <li>promotional or featured listings.</li>
                      </ul>
                      <p className="mb-4">8.3 Such arrangements do not create a partnership, joint venture, or agency relationship unless expressly agreed in writing.</p>
                      <p className="mb-4">8.4 The Company may receive financial or non-financial benefits from such arrangements.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 9 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">9. Recommended Services</h2>
                      <p className="mb-4">9.1 The Platform may include sections such as:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>Recommended Services;</li>
                        <li>Find Activities & Tours;</li>
                        <li>similar features linking to third parties.</li>
                      </ul>
                      <p className="mb-4">9.2 Where users access such services:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>they do so at their own discretion;</li>
                        <li>the contract is with the provider;</li>
                        <li>the Company is not responsible for the service provided.</li>
                      </ul>
                      <p className="mb-4">9.3 The inclusion of services does not constitute endorsement or guarantee.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 10 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">10. Direct Services</h2>
                      <p className="mb-4">10.1 The Company does not generally provide services directly unless expressly stated.</p>
                      <p className="mb-4">10.2 Where direct services are introduced:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>this will be clearly communicated;</li>
                        <li>separate terms may apply.</li>
                      </ul>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 11 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">11. Pricing and Payments</h2>
                      <p className="mb-4">11.1 Prices displayed on the Platform may change from time to time.</p>
                      <p className="mb-4">11.2 Payments for services may be processed either by the Company or by Third Party Providers, depending on the nature of the service.</p>
                      <p className="mb-4">11.3 Where payments are processed by Third Party Providers, the Company does not control their billing systems or payment processes.</p>
                      <p className="mb-4">11.4 The Company may charge fees for certain services, features, or access to the Platform. Any applicable fees will be clearly communicated prior to the point of use or transaction.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 12 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">12. Refunds and Cancellations</h2>
                      <p className="mb-4">12.1 Refunds for Third Party Services are governed solely by the terms of the relevant provider.</p>
                      <p className="mb-4">12.2 The Company does not process, administer, or guarantee refunds for Third Party Services.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 13 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">13. Acceptable Use</h2>
                      <p className="mb-4">13.1 Users must not:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>use the Platform for unlawful purposes;</li>
                        <li>attempt unauthorised access to systems or data;</li>
                        <li>interfere with or disrupt the operation or security of the Platform;</li>
                        <li>introduce malicious software, viruses, or harmful code;</li>
                        <li>misuse any features, tools, or services provided.</li>
                      </ul>
                      <p className="mb-4">13.2 The Company reserves the right to suspend, restrict, or terminate access where a breach of this clause is identified.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 14 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">14. User Accounts and Security</h2>
                      <p className="mb-4">14.1 Where user accounts are required:</p>
                      <ul className="list-disc pl-6 mb-4">
                        <li>users must ensure that all information provided is accurate and up to date;</li>
                        <li>users are responsible for maintaining the confidentiality and security of their account credentials.</li>
                      </ul>
                      <p className="mb-4">14.2 Users must notify the Company immediately of any unauthorised use or suspected breach of security.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 15 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">15. Intellectual Property</h2>
                      <p className="mb-4">15.1 All intellectual property rights in the Platform, including branding, content, designs, and materials, are owned by or licensed to JA Group Services Ltd.</p>
                      <p className="mb-4">15.2 Where intellectual property is licensed, all rights remain with the relevant licensor.</p>
                      <p className="mb-4">15.3 Users are granted a limited, non-exclusive, non-transferable licence to access and use the Platform.</p>
                      <p className="mb-4">15.4 Users must not copy, reproduce, distribute, or exploit any content without prior written consent.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 16 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">16. Data Protection</h2>
                      <p className="mb-4">16.1 Personal data is processed in accordance with the Company's Privacy Policy.</p>
                      <p className="mb-4">16.2 Third Party Providers may process personal data independently in accordance with their own privacy policies.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 17 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">17. Regulatory Position and No Reliance</h2>
                      <p className="mb-4">17.1 The Company does not provide regulated financial, legal, or professional services unless expressly stated.</p>
                      <p className="mb-4">17.2 Nothing on the Platform constitutes advice, recommendation, or endorsement.</p>
                      <p className="mb-4">17.3 Any content made available on the Platform is provided for general information purposes only and must not be relied upon as professional, financial, legal, or other advice.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 18 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">18. Disclaimer</h2>
                      <p className="mb-4">18.1 The Platform and services are provided on an "as is" and "as available" basis.</p>
                      <p className="mb-4">18.2 The Company makes no representations or warranties, whether express or implied, regarding accuracy, completeness, reliability, availability, or uninterrupted access.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 19 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">19. Limitation of Liability</h2>
                      <p className="mb-4">19.1 Nothing in these Terms excludes or limits liability for death, personal injury, fraud, or any liability which cannot be excluded under applicable law.</p>
                      <p className="mb-4">19.2 The Company shall not be liable for indirect or consequential loss, loss of profit, revenue, data, or business opportunity.</p>
                      <p className="mb-4">19.3 The Company shall not be liable for acts or omissions of third parties.</p>
                      <p className="mb-4">19.4 Where liability cannot be excluded for Business Users, it shall be limited to the total fees paid in the preceding twelve months.</p>
                      <p className="mb-4">19.5 Nothing in these Terms affects Consumer rights under applicable law.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 20 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">20. Complaints and Feedback</h2>
                      <p className="mb-4">20.1 Formal complaints must be submitted to: <a href="mailto:complaints@jagroupservices.co.uk" className="text-[#2563EB] hover:underline">complaints@jagroupservices.co.uk</a></p>
                      <p className="mb-4">20.2 General feedback, suggestions, or comments should be submitted to: <a href="mailto:feedback@jagroupservices.co.uk" className="text-[#2563EB] hover:underline">feedback@jagroupservices.co.uk</a></p>
                      <p className="mb-4">20.3 Communications submitted to the incorrect channel may be redirected or may not be treated as formal complaints.</p>
                      <p className="mb-4">20.4 Complaints will be handled in accordance with the Company's Complaints Policy.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 21 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">21. Indemnity (Business Users)</h2>
                      <p className="mb-4">21.1 Business Users agree to indemnify and hold harmless the Company against any claims, losses, damages, liabilities, and expenses arising from misuse of the Platform or breach of these Terms.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 22 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">22. Force Majeure</h2>
                      <p className="mb-4">22.1 The Company shall not be liable for any failure or delay caused by events beyond its reasonable control.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 23 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">23. Relationship of the Parties</h2>
                      <p className="mb-4">23.1 Nothing in these Terms creates any partnership, joint venture, employment, or agency relationship.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 24 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">24. Assignment</h2>
                      <p className="mb-4">24.1 The Company may assign or transfer its rights and obligations without restriction.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 25 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">25. Severability</h2>
                      <p className="mb-4">25.1 If any provision of these Terms is found to be invalid or unenforceable, such provision shall be modified to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 26 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">26. Third Party Rights</h2>
                      <p className="mb-4">26.1 A person who is not a party to these Terms shall have no right to enforce any provision under the Contracts (Rights of Third Parties) Act 1999.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 27 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">27. Entire Agreement</h2>
                      <p className="mb-4">27.1 These Terms constitute the entire agreement between the user and the Company.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 28 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">28. Variation</h2>
                      <p className="mb-4">28.1 The Company may amend these Terms by publishing an updated version on the Platform.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 29 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">29. Governing Law and Jurisdiction</h2>
                      <p className="mb-4">29.1 These Terms are governed by the laws of England and Wales.</p>
                      <p className="mb-4">29.2 Consumers may bring proceedings in their local UK courts.</p>
                      <p className="mb-4">29.3 Business Users submit to the exclusive jurisdiction of the courts of England and Wales.</p>

                      <div className="border-b border-[#0A1F44]/10 my-8"></div>

                      {/* Section 30 */}
                      <h2 className="text-2xl font-bold text-[#0A1F44] mt-8 mb-4">30. Contact</h2>
                      <p className="mb-2"><strong>JA Group Services Ltd</strong></p>
                      <p className="mb-2">167–169 Great Portland Street</p>
                      <p className="mb-2">5th Floor</p>
                      <p className="mb-2">London</p>
                      <p className="mb-2">W1W 5PF</p>
                      <p className="mb-4">United Kingdom</p>
                      <p className="mb-4">Email: <a href="mailto:hello@jagroupservices.co.uk" className="text-[#2563EB] hover:underline">hello@jagroupservices.co.uk</a></p>
                    </div>
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
