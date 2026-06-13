// Translation strings for all supported languages
// Add your own translations here for each language
import type { SupportedLanguage } from './i18n';

export type TranslationKey = 
  // Navigation
  | 'nav.home'
  | 'nav.about'
  | 'nav.divisions'
  | 'nav.structure'
  | 'nav.services'
  | 'nav.activities'
  | 'nav.contact'
  | 'nav.corporate'
  
  // Homepage Hero
  | 'hero.badge'
  | 'hero.title'
  | 'hero.subtitle'
  | 'hero.cta.divisions'
  | 'hero.cta.contact'
  
  // Stats Cards
  | 'stats.ukbased.label'
  | 'stats.ukbased.value'
  | 'stats.trusted.label'
  | 'stats.trusted.value'
  | 'stats.customer.label'
  | 'stats.customer.value'
  | 'stats.professional.label'
  | 'stats.professional.value'
  
  // Featured Division
  | 'featured.badge'
  | 'featured.cta'
  | 'featured.viewall'
  
  // Why Choose Us
  | 'why.badge'
  | 'why.title'
  | 'why.subtitle'
  | 'why.ukbased.title'
  | 'why.ukbased.desc'
  | 'why.customer.title'
  | 'why.customer.desc'
  | 'why.trusted.title'
  | 'why.trusted.desc'
  | 'why.professional.title'
  | 'why.professional.desc'
  
  // Contact CTA
  | 'contact.title'
  | 'contact.subtitle'
  | 'contact.phone'
  | 'contact.email'
  | 'contact.title'
  | 'contact.subtitle'
  | 'contact.phone'
  | 'contact.email'
  | 'contact.cta.primary'
  | 'contact.cta.secondary'
  
  // Footer
  | 'footer.company'
  | 'footer.legal'
  
  // Contact Page
  | 'contactPage.title'
  | 'contactPage.subtitle'
  | 'contactPage.badge'
  | 'contactPage.form.name'
  | 'contactPage.form.email'
  | 'contactPage.form.subject'
  | 'contactPage.form.message'
  | 'contactPage.form.submit'
  | 'contactPage.info.title'
  | 'contactPage.info.phone'
  | 'contactPage.info.email'
  | 'contactPage.info.address'
  
  // About Us Page
  | 'aboutPage.title'
  | 'aboutPage.subtitle'
  | 'aboutPage.badge'
  | 'aboutPage.mission.title'
  | 'aboutPage.mission.desc'
  | 'aboutPage.vision.title'
  | 'aboutPage.vision.desc'
  | 'aboutPage.values.title'
  | 'aboutPage.values.desc'
  
  // Corporate Page
  | 'corporatePage.title'
  | 'corporatePage.subtitle'
  | 'corporatePage.badge'
  | 'corporatePage.company.title'
  | 'corporatePage.company.desc'
  | 'corporatePage.governance.title'
  | 'corporatePage.governance.desc'
  
  // Divisions Page
  | 'divisionsPage.title'
  | 'divisionsPage.subtitle'
  | 'divisionsPage.badge'
  | 'divisionsPage.intro'
  | 'divisionsPage.cta'
  
  // Structure Page
  | 'structurePage.title'
  | 'structurePage.subtitle'
  | 'structurePage.badge'
  
  // Services Page
  | 'servicesPage.title'
  | 'servicesPage.subtitle'
  | 'servicesPage.badge'
  
  // Activities Page
  | 'activitiesPage.title'
  | 'activitiesPage.subtitle'
  | 'activitiesPage.badge'
  | 'activitiesPage.search'
  | 'activitiesPage.viewAll'
  
  // Announcements Page
  | 'announcementsPage.title'
  | 'announcementsPage.subtitle'
  | 'announcementsPage.badge'
  
  // Sitemap Page
  | 'sitemapPage.title'
  | 'sitemapPage.subtitle'
  | 'sitemapPage.badge'
  
  // Homepage - Featured Division Content
  | 'featured.badge'
  | 'featured.sectionTitle'
  | 'featured.description'
  | 'featured.features.domain'
  | 'featured.features.email'
  | 'featured.features.hosting'
  | 'featured.keyFeatures'
  | 'featured.feature1.title'
  | 'featured.feature1.desc'
  | 'featured.feature2.title'
  | 'featured.feature2.desc'
  | 'featured.feature3.title'
  | 'featured.feature3.desc'
  | 'featured.feature4.title'
  | 'featured.feature4.desc'
  
  // About Us - Body Content
  | 'about.whoWeAre.title'
  | 'about.whoWeAre.p1'
  | 'about.whoWeAre.p2'
  | 'about.ourPurpose.title'
  | 'about.ourPurpose.p1'
  | 'about.ourPurpose.p2'
  | 'about.coreValues.title'
  | 'about.coreValues.subtitle'
  | 'about.governance.title'
  | 'about.governance.desc'
  | 'about.growth.title'
  | 'about.growth.desc'
  | 'about.professional.title'
  | 'about.professional.desc'
  | 'about.partnerships.title'
  | 'about.partnerships.desc'
  
  // Group Structure - Body Content
  | 'structure.overview.title'
  | 'structure.overview.p1'
  | 'structure.overview.p2'
  | 'structure.jsds.title'
  | 'structure.jsds.role'
  | 'structure.jsds.desc'
  | 'structure.ja.title'
  | 'structure.ja.role'
  | 'structure.ja.desc'
  | 'structure.relationship.title'
  | 'structure.relationship.p1'
  | 'structure.relationship.p2'
  | 'structure.why.title'
  | 'structure.why.subtitle'
  | 'structure.why.governance.title'
  | 'structure.why.governance.desc'
  | 'structure.why.clarity.title'
  | 'structure.why.clarity.desc'
  | 'structure.why.sustainability.title'
  | 'structure.why.sustainability.desc'
  | 'structure.why.compliance.title'
  | 'structure.why.compliance.desc'
  | 'structure.learn.title'
  | 'structure.learn.about'
  | 'structure.learn.divisions'
  | 'structure.learn.corporate'
  
  // Corporate Page - Body Content
  | 'corporate.partnership.badge'
  | 'corporate.partnership.title'
  | 'corporate.partnership.subtitle'
  | 'corporate.collab.title'
  | 'corporate.collab.p1'
  | 'corporate.collab.p2'
  | 'corporate.areas.title'
  | 'corporate.areas.service.title'
  | 'corporate.areas.service.desc'
  | 'corporate.areas.tech.title'
  | 'corporate.areas.tech.desc'
  | 'corporate.areas.reseller.title'
  | 'corporate.areas.reseller.desc'
  | 'corporate.areas.strategic.title'
  | 'corporate.areas.strategic.desc'
  | 'corporate.why.title'
  | 'corporate.why.uk.title'
  | 'corporate.why.uk.desc'
  | 'corporate.why.professional.title'
  | 'corporate.why.professional.desc'
  | 'corporate.why.support.title'
  | 'corporate.why.support.desc'
  | 'corporate.why.growth.title'
  | 'corporate.why.growth.desc'
  | 'corporate.info.badge'
  | 'corporate.info.title'
  | 'corporate.info.name.label'
  | 'corporate.info.name.value'
  | 'corporate.info.number.label'
  | 'corporate.info.number.value'
  | 'corporate.info.registered.label'
  | 'corporate.info.registered.value'
  | 'corporate.info.vat.label'
  | 'corporate.info.vat.value'
  | 'corporate.info.ico.label'
  | 'corporate.info.ico.value'
  | 'corporate.governance.badge'
  | 'corporate.governance.title'
  | 'corporate.governance.subtitle'
  | 'corporate.governance.framework.title'
  | 'corporate.governance.framework.desc'
  | 'corporate.governance.compliance.title'
  | 'corporate.governance.compliance.desc'
  | 'corporate.governance.accountability.title'
  | 'corporate.governance.accountability.desc'
  | 'corporate.governance.transparency.title'
  | 'corporate.governance.transparency.desc'
  | 'corporate.contact.title'
  | 'corporate.contact.subtitle'
  | 'corporate.contact.button'
  
  // Divisions Page - Body Content
  | 'divisions.framework.title'
  | 'divisions.framework.subtitle'
  | 'divisions.framework.governance.title'
  | 'divisions.framework.governance.desc'
  | 'divisions.framework.infrastructure.title'
  | 'divisions.framework.infrastructure.desc'
  | 'divisions.framework.standards.title'
  | 'divisions.framework.standards.desc'
  | 'divisions.current.title'
  | 'divisions.current.subtitle'
  | 'divisions.jadomainhub.role'
  | 'divisions.jadomainhub.desc'
  | 'divisions.jadomainhub.services.title'
  | 'divisions.jadomainhub.services.item1'
  | 'divisions.jadomainhub.services.item2'
  | 'divisions.jadomainhub.services.item3'
  | 'divisions.jadomainhub.services.item4'
  | 'divisions.jadomainhub.partnerships.title'
  | 'divisions.jadomainhub.partnerships.desc'
  | 'divisions.jadomainhub.button.portal'
  | 'divisions.jadomainhub.button.visit'
  | 'divisions.jadomainhub.button.contact'
  | 'divisions.future.title'
  | 'divisions.future.subtitle'
  | 'divisions.future.p1'
  | 'divisions.future.p2'
  
  // Recommended Services Page - Body Content
  | 'recommended.title'
  | 'recommended.hero.badge'
  | 'recommended.hero.subtitle'
  | 'recommended.tabs.business'
  | 'recommended.tabs.activities'
  | 'recommended.business.badge'
  | 'recommended.business.title'
  | 'recommended.business.subtitle'
  | 'recommended.business.section1'
  
  // Header Navigation
  | 'header.divisions'
  | 'header.divisions.about'
  | 'header.contact'
  | 'header.company'
  | 'header.company.about'
  | 'header.company.structure'
  | 'header.company.corporate'
  
  // Footer
  | 'footer.company'
  | 'footer.company.about'
  | 'footer.company.contact'
  | 'footer.company.team'
  | 'footer.company.parent'
  | 'footer.legal'
  | 'footer.legal.terms'
  | 'footer.legal.privacy'
  | 'footer.legal.cookies';

export const translations: Record<SupportedLanguage, Record<TranslationKey, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.divisions': 'Our Divisions',
    'nav.structure': 'Group Structure',
    'nav.services': 'Services',
    'nav.activities': 'Activities & Tours',
    'nav.contact': 'Contact Us',
    'nav.corporate': 'Corporate',
    
    // Homepage Hero
    'hero.badge': 'UK Business Group',
    'hero.title': 'JA Group Services Ltd',
    'hero.subtitle': 'A growing name in business solutions. Specialist divisions built to support and grow with you.',
    'hero.cta.divisions': 'Explore Our Divisions',
    'hero.cta.contact': 'Get in Touch',
    
    // Stats Cards
    'stats.ukbased.label': 'UK Based',
    'stats.ukbased.value': 'London',
    'stats.trusted.label': 'Quality',
    'stats.trusted.value': 'Services',
    'stats.customer.label': 'Customer',
    'stats.customer.value': 'Focussed',
    'stats.professional.label': 'Multiple',
    'stats.professional.value': 'Divisions',
    
    // Why Choose Us
    'why.badge': 'Why Choose Us',
    'why.title': 'Built for Excellence',
    'why.subtitle': 'Professional expertise backed by UK-based support and commitment to quality',
    'why.ukbased.title': 'UK-Based Excellence',
    'why.ukbased.desc': 'Proudly based in London, providing local expertise and dedicated support.',
    'why.customer.title': 'Customer Focussed',
    'why.customer.desc': 'Understanding and meeting your needs with tailored solutions.',
    'why.trusted.title': 'Quality Service',
    'why.trusted.desc': 'Collaborating with leading providers to deliver quality solutions.',
    'why.professional.title': 'Professional Standards',
    'why.professional.desc': 'Committed to excellence, transparency, and customer satisfaction.',
    
    // Contact CTA
    'contact.title': 'Ready to Get Started?',
    'contact.subtitle': 'Have questions about JA Group Services or our divisions? We\'re here to help.',
    'contact.phone': '020 3834 2790',
    'contact.email': 'hello@jagroupservices.co.uk',
    'contact.cta.primary': 'Contact Us Today',
    'contact.cta.secondary': 'Learn More About Us',
    
    // Contact Page
    'contactPage.title': 'Contact Us',
    'contactPage.subtitle': 'Get in touch with our team',
    'contactPage.badge': 'GET IN TOUCH',
    'contactPage.form.name': 'Your Name',
    'contactPage.form.email': 'Email Address',
    'contactPage.form.subject': 'Subject',
    'contactPage.form.message': 'Your Message',
    'contactPage.form.submit': 'Send Message',
    'contactPage.info.title': 'Contact Information',
    'contactPage.info.phone': 'Phone',
    'contactPage.info.email': 'Email',
    'contactPage.info.address': 'Address',
    
    // About Us Page
    'aboutPage.title': 'About Us',
    'aboutPage.subtitle': 'Learn more about JA Group Services',
    'aboutPage.badge': 'WHO WE ARE',
    'aboutPage.mission.title': 'Our Mission',
    'aboutPage.mission.desc': 'To deliver excellence through our specialist divisions',
    'aboutPage.vision.title': 'Our Vision',
    'aboutPage.vision.desc': 'To be the trusted partner for businesses across the UK',
    'aboutPage.values.title': 'Our Values',
    'aboutPage.values.desc': 'Integrity, Excellence, and Customer Focus',
    
    // Corporate Page
    'corporatePage.title': 'Corporate Information',
    'corporatePage.subtitle': 'Learn about our company structure and governance',
    'corporatePage.badge': 'CORPORATE',
    'corporatePage.company.title': 'Company Details',
    'corporatePage.company.desc': 'JA Group Services Ltd is registered in England and Wales',
    'corporatePage.governance.title': 'Governance',
    'corporatePage.governance.desc': 'Committed to transparency and best practices',
    
    // Divisions Page
    'divisionsPage.title': 'Our Divisions',
    'divisionsPage.subtitle': 'Specialist services across multiple sectors',
    'divisionsPage.badge': 'OUR DIVISIONS',
    'divisionsPage.intro': 'Explore our range of specialist divisions',
    'divisionsPage.cta': 'Learn More',
    
    // Structure Page
    'structurePage.title': 'Our Group Structure',
    'structurePage.subtitle': 'Understanding our corporate organisation',
    'structurePage.badge': 'GROUP STRUCTURE',
    
    // Services Page
    'servicesPage.title': 'Recommended Services',
    'servicesPage.subtitle': 'Trusted partners and service providers',
    'servicesPage.badge': 'RECOMMENDED SERVICES',
    
    // Activities Page
    'activitiesPage.title': 'Find Activities & Tours',
    'activitiesPage.subtitle': 'Discover experiences worldwide',
    'activitiesPage.badge': 'ACTIVITIES & TOURS',
    'activitiesPage.search': 'Search activities...',
    'activitiesPage.viewAll': 'View All Activities',
    
    // Announcements Page
    'announcementsPage.title': 'Announcements',
    'announcementsPage.subtitle': 'Latest updates from JA Group Services',
    'announcementsPage.badge': 'ANNOUNCEMENTS',
    
    // Sitemap Page
    'sitemapPage.title': 'Sitemap',
    'sitemapPage.subtitle': 'Navigate our website',
    'sitemapPage.badge': 'SITEMAP',
    
    // Homepage - Featured Division Content
    'featured.badge': 'Our Featured Division',
    'featured.sectionTitle': 'Introducing JA Domain Hub',
    'featured.description': 'Professional domain and hosting services designed for businesses of all sizes.',
    'featured.features.domain': 'Domain Registration',
    'featured.features.email': 'Professional Email',
    'featured.features.hosting': 'Web Hosting',
    'featured.keyFeatures': 'Key Features',
    'featured.feature1.title': 'Domain Registration',
    'featured.feature1.desc': 'Secure your perfect domain name',
    'featured.feature2.title': 'Professional Email',
    'featured.feature2.desc': 'Business email hosting solutions',
    'featured.feature3.title': 'Secure Hosting',
    'featured.feature3.desc': 'Reliable and protected web hosting',
    'featured.feature4.title': 'Expert Support',
    'featured.feature4.desc': 'UK-based customer assistance',
    'featured.cta': 'Visit JA Domain Hub',
    'featured.viewall': 'View All Recommended Services',
    
    // About Us - Body Content
    'about.whoWeAre.title': 'Who We Are',
    'about.whoWeAre.p1': 'JA Group Services Ltd is a UK-registered operating company that provides professional governance, operational infrastructure, and compliance frameworks for business divisions.',
    'about.whoWeAre.p2': 'We operate with a focus on accountability, structured oversight, and long-term sustainability. Our approach prioritises disciplined growth over rapid expansion, ensuring each division operates within a robust governance framework.',
    'about.ourPurpose.title': 'Our Purpose',
    'about.ourPurpose.p1': 'We exist to provide the operational backbone that enables business divisions to focus on their core services while benefiting from shared governance, compliance infrastructure, and professional standards.',
    'about.ourPurpose.p2': 'Our model separates operational oversight from day-to-day division activities, creating clear accountability structures and sustainable business practices.',
    'about.coreValues.title': 'Core Values',
    'about.coreValues.subtitle': 'The principles that guide our operations and decision-making.',
    'about.governance.title': 'Governance & Accountability',
    'about.governance.desc': 'We maintain structured oversight frameworks, clear reporting lines, and transparent accountability measures across all divisions and operations.',
    'about.growth.title': 'Disciplined Growth',
    'about.growth.desc': 'Growth is measured and deliberate. We prioritise operational readiness and sustainability over rapid expansion, ensuring each division has the infrastructure it needs.',
    'about.professional.title': 'Professional Standards',
    'about.professional.desc': 'We uphold high standards of professionalism, compliance, and ethical conduct across all business activities and partnerships.',
    'about.partnerships.title': 'Collaborative Partnerships',
    'about.partnerships.desc': 'We build long-term relationships with partners who share our commitment to quality, transparency, and professional service delivery.',
    
    // Group Structure - Body Content
    'structure.overview.title': 'Corporate Structure Overview',
    'structure.overview.p1': 'JA Group Services Ltd operates as a wholly-owned subsidiary of JSDS Group Ltd, creating a clear parent-subsidiary relationship that provides both operational independence and strategic oversight.',
    'structure.overview.p2': 'This structure enables focused operational management whilst maintaining the governance, compliance, and strategic direction benefits of a parent company relationship.',
    'structure.jsds.title': 'JSDS Group Ltd',
    'structure.jsds.role': 'Parent Company',
    'structure.jsds.desc': 'JSDS Group Ltd serves as the parent company, providing strategic oversight, governance frameworks, and long-term direction. The parent company ensures compliance standards are maintained and supports sustainable growth across the group structure.',
    'structure.ja.title': 'JA Group Services Ltd',
    'structure.ja.role': 'Operating Subsidiary',
    'structure.ja.desc': 'JA Group Services Ltd operates as the active subsidiary, managing day-to-day operations, division frameworks, and service delivery. As an operating company, it maintains operational independence whilst benefiting from parent company oversight and support.',
    'structure.relationship.title': 'The Parent-Subsidiary Relationship',
    'structure.relationship.p1': 'This structure creates clear separation between strategic governance (parent company) and operational management (subsidiary), enabling focused execution whilst maintaining accountability and oversight.',
    'structure.relationship.p2': 'The relationship ensures that operational decisions can be made efficiently whilst strategic direction, compliance frameworks, and governance standards remain consistent and professionally managed.',
    'structure.why.title': 'Why This Structure?',
    'structure.why.subtitle': 'The benefits of our corporate organisation',
    'structure.why.governance.title': 'Clear Governance',
    'structure.why.governance.desc': 'Separation of strategic oversight and operational management creates clear accountability and decision-making frameworks.',
    'structure.why.clarity.title': 'Operational Clarity',
    'structure.why.clarity.desc': 'Defined roles and responsibilities enable efficient operations whilst maintaining professional standards and compliance.',
    'structure.why.sustainability.title': 'Long-term Sustainability',
    'structure.why.sustainability.desc': 'Parent company oversight ensures sustainable growth strategies and consistent governance across all operations.',
    'structure.why.compliance.title': 'Compliance & Standards',
    'structure.why.compliance.desc': 'Structured frameworks ensure all operations meet regulatory requirements and maintain professional standards.',
    'structure.learn.title': 'Learn More',
    'structure.learn.about': 'About JA Group Services',
    'structure.learn.divisions': 'Our Divisions',
    'structure.learn.corporate': 'Corporate & Partnerships',
    
    // Corporate Page - Body Content
    'corporate.partnership.badge': 'PARTNERSHIP OPPORTUNITIES',
    'corporate.partnership.title': 'Partner With Us',
    'corporate.partnership.subtitle': 'We\'re always interested in collaborating with service providers and businesses who share our commitment to quality and professionalism',
    'corporate.collab.title': 'Collaborative Partnerships',
    'corporate.collab.p1': 'We believe in building strong, mutually beneficial partnerships with service providers, technology partners, and businesses who can enhance our service offerings to UK customers.',
    'corporate.collab.p2': 'Whether you offer complementary services, innovative solutions, or have expertise that aligns with our mission, we\'d love to explore partnership opportunities.',
    'corporate.areas.title': 'Partnership Areas',
    'corporate.areas.service.title': 'Service Providers',
    'corporate.areas.service.desc': 'Digital services, hosting, development, marketing',
    'corporate.areas.tech.title': 'Technology Partners',
    'corporate.areas.tech.desc': 'Software solutions, platforms, integrations',
    'corporate.areas.reseller.title': 'Reseller Opportunities',
    'corporate.areas.reseller.desc': 'White-label services, affiliate programmes',
    'corporate.areas.strategic.title': 'Strategic Alliances',
    'corporate.areas.strategic.desc': 'Joint ventures, co-marketing, referral partnerships',
    'corporate.why.title': 'Why Partner With Us',
    'corporate.why.uk.title': 'UK-Based Operations',
    'corporate.why.uk.desc': 'Professional UK company with established governance and compliance frameworks',
    'corporate.why.professional.title': 'Professional Standards',
    'corporate.why.professional.desc': 'Commitment to quality, transparency, and ethical business practices',
    'corporate.why.support.title': 'Dedicated Support',
    'corporate.why.support.desc': 'Collaborative approach with clear communication and reliable partnership management',
    'corporate.why.growth.title': 'Growth Opportunities',
    'corporate.why.growth.desc': 'Access to our customer base and potential for long-term business development',
    'corporate.info.badge': 'COMPANY INFORMATION',
    'corporate.info.title': 'Company Details',
    'corporate.info.name.label': 'Registered Name',
    'corporate.info.name.value': 'JA Group Services Ltd',
    'corporate.info.number.label': 'Company Number',
    'corporate.info.number.value': '16024881',
    'corporate.info.registered.label': 'Registered Office',
    'corporate.info.registered.value': '124 City Road, London, England, EC1V 2NX',
    'corporate.info.vat.label': 'VAT Number',
    'corporate.info.vat.value': 'Not VAT Registered',
    'corporate.info.ico.label': 'ICO Registration',
    'corporate.info.ico.value': 'ZB877370',
    'corporate.governance.badge': 'GOVERNANCE',
    'corporate.governance.title': 'Corporate Governance',
    'corporate.governance.subtitle': 'Our commitment to professional standards and accountability',
    'corporate.governance.framework.title': 'Governance Framework',
    'corporate.governance.framework.desc': 'Structured oversight and decision-making processes ensure accountability across all operations and divisions.',
    'corporate.governance.compliance.title': 'Regulatory Compliance',
    'corporate.governance.compliance.desc': 'Full compliance with UK company law, data protection regulations, and industry standards.',
    'corporate.governance.accountability.title': 'Clear Accountability',
    'corporate.governance.accountability.desc': 'Defined roles, responsibilities, and reporting structures maintain transparency and professional standards.',
    'corporate.governance.transparency.title': 'Operational Transparency',
    'corporate.governance.transparency.desc': 'Open communication with stakeholders, partners, and customers about our operations and practices.',
    'corporate.contact.title': 'Get In Touch',
    'corporate.contact.subtitle': 'Interested in partnership opportunities or have questions about our company?',
    'corporate.contact.button': 'Contact Us',
    
    // Divisions Page - Body Content
    'divisions.framework.title': 'Operating Framework',
    'divisions.framework.subtitle': 'Our division structure enables specialised service delivery while maintaining consistent governance, compliance, and professional standards across all operations.',
    'divisions.framework.governance.title': 'Governance & Accountability',
    'divisions.framework.governance.desc': 'Each division operates under JA Group Services Ltd\'s governance framework, ensuring accountability and professional standards.',
    'divisions.framework.infrastructure.title': 'Professional Infrastructure',
    'divisions.framework.infrastructure.desc': 'Divisions benefit from shared operational infrastructure, compliance frameworks, and professional support systems.',
    'divisions.framework.standards.title': 'Consistent Standards',
    'divisions.framework.standards.desc': 'All divisions maintain consistent quality, compliance, and service standards aligned with our corporate values.',
    'divisions.current.title': 'Current Divisions',
    'divisions.current.subtitle': 'Our active divisions delivering specialised services.',
    'divisions.jadomainhub.role': 'Domain Services Division',
    'divisions.jadomainhub.desc': 'JA DOMAIN HUB is our domain services division, providing professional domain registration, management, and related services to businesses and organisations.',
    'divisions.jadomainhub.services.title': 'Services',
    'divisions.jadomainhub.services.item1': 'Domain registration and renewal services',
    'divisions.jadomainhub.services.item2': 'Domain portfolio management',
    'divisions.jadomainhub.services.item3': 'DNS management and configuration',
    'divisions.jadomainhub.services.item4': 'Domain transfer and migration support',
    'divisions.jadomainhub.partnerships.title': 'Strategic Partnerships',
    'divisions.jadomainhub.partnerships.desc': 'JA DOMAIN HUB operates through strategic partnerships with leading domain registries and service providers, enabling us to offer comprehensive domain services with enterprise-grade reliability and support.',
    'divisions.jadomainhub.button.portal': 'Access Division Portal',
    'divisions.jadomainhub.button.visit': 'Visit JA DOMAIN HUB',
    'divisions.jadomainhub.button.contact': 'Contact Division',
    'divisions.future.title': 'Future Growth',
    'divisions.future.subtitle': 'Our division framework enables disciplined expansion into new service areas.',
    'divisions.future.p1': 'JA Group Services Ltd\'s division structure is designed to support controlled growth. New divisions may be established when opportunities align with our governance standards, operational capabilities, and strategic objectives.',
    'divisions.future.p2': 'Each potential division undergoes rigorous evaluation to ensure it can maintain our standards for accountability, compliance, and professional service delivery before integration into our operating framework.',
    
    // Recommended Services Page - Body Content
    'recommended.title': 'Recommended Services',
    'recommended.hero.badge': 'Trusted Services',
    'recommended.hero.subtitle': 'Carefully selected service providers that meet our standards for quality, reliability, and professional service delivery.',
    'recommended.tabs.business': 'Business Services',
    'recommended.tabs.activities': 'Activities & Tours',
    'recommended.business.badge': 'Professional Services',
    'recommended.business.title': 'Business Solutions',
    'recommended.business.subtitle': 'Trusted providers for company formation, compliance, and professional business services',
    'recommended.business.section1': 'Company Formation & Business Services',
    
    // Header Navigation
    'header.divisions': 'Our Divisions',
    'header.divisions.about': 'About Our Divisions',
    'header.contact': 'Contact Us',
    'header.company': 'Company',
    'header.company.about': 'About Us',
    'header.company.structure': 'Our Group Structure',
    'header.company.corporate': 'Corporate',
    
    // Footer
    'footer.company': 'Company',
    'footer.company.about': 'About Us',
    'footer.company.contact': 'Contact Us',
    'footer.company.team': 'Meet the Team',
    'footer.company.parent': 'Parent Company',
    'footer.legal': 'Legal & Resources',
    'footer.legal.terms': 'Terms',
    'footer.legal.privacy': 'Privacy Policy',
    'footer.legal.cookies': 'Cookies Policy',
  },
  
  pt: {
    // Navigation - ADD YOUR PORTUGUESE TRANSLATIONS HERE
    'nav.home': 'Início',
    'nav.about': 'Sobre Nós',
    'nav.divisions': 'Nossas Divisões',
    'nav.structure': 'Estrutura do Grupo',
    'nav.services': 'Serviços',
    'nav.activities': 'Atividades e Passeios',
    'nav.contact': 'Contacte-nos',
    'nav.corporate': 'Corporativo',
    
    // Homepage Hero
    'hero.badge': 'Grupo Empresarial no Reino Unido',
    'hero.title': 'JA Group Services Ltd',
    'hero.subtitle': 'Um nome em crescimento em soluções empresariais. Divisões especializadas criadas para apoiar e crescer consigo.',
    'hero.cta.divisions': 'Explorar as Nossas Divisões',
    'hero.cta.contact': 'Entre em Contacto',
    
    // Stats Cards
    'stats.ukbased.label': 'Sediado no Reino Unido',
    'stats.ukbased.value': 'Londres',
    'stats.trusted.label': 'Qualidade',
    'stats.trusted.value': 'Serviços',
    'stats.customer.label': 'Focado no',
    'stats.customer.value': 'Cliente',
    'stats.professional.label': 'Múltiplas',
    'stats.professional.value': 'Divisões',
    
    // Why Choose Us
    'why.badge': 'Por Que Nos Escolher',
    'why.title': 'Construído para a Excelência',
    'why.subtitle': 'Experiência profissional apoiada por suporte britânico e compromisso com a qualidade',
    'why.ukbased.title': 'Excelência Britânica',
    'why.ukbased.desc': 'Orgulhosamente sediados em Londres, fornecendo experiência local e suporte dedicado.',
    'why.customer.title': 'Focado no Cliente',
    'why.customer.desc': 'Compreendendo e atendendo às suas necessidades com soluções personalizadas.',
    'why.trusted.title': 'Serviço de Qualidade',
    'why.trusted.desc': 'Colaborando com fornecedores líderes para oferecer soluções de qualidade.',
    'why.professional.title': 'Padrões Profissionais',
    'why.professional.desc': 'Comprometidos com excelência, transparência e satisfação do cliente.',
    
    // Contact CTA
    'contact.title': 'Pronto para Começar?',
    'contact.subtitle': 'Tem perguntas sobre JA Group Services ou nossas divisões? Estamos aqui para ajudar.',
    'contact.phone': '020 3834 2790',
    'contact.email': 'hello@jagroupservices.co.uk',
    'contact.cta.primary': 'Contacte-nos Hoje',
    'contact.cta.secondary': 'Saiba Mais Sobre Nós',
    
    // Contact Page
    'contactPage.title': 'Contacte-nos',
    'contactPage.subtitle': 'Entre em contacto com a nossa equipa',
    'contactPage.badge': 'ENTRE EM CONTACTO',
    'contactPage.form.name': 'O Seu Nome',
    'contactPage.form.email': 'Endereço de Email',
    'contactPage.form.subject': 'Assunto',
    'contactPage.form.message': 'A Sua Mensagem',
    'contactPage.form.submit': 'Enviar Mensagem',
    'contactPage.info.title': 'Informações de Contacto',
    'contactPage.info.phone': 'Telefone',
    'contactPage.info.email': 'Email',
    'contactPage.info.address': 'Morada',
    
    // About Us Page
    'aboutPage.title': 'Sobre Nós',
    'aboutPage.subtitle': 'Saiba mais sobre JA Group Services',
    'aboutPage.badge': 'QUEM SOMOS',
    'aboutPage.mission.title': 'A Nossa Missão',
    'aboutPage.mission.desc': 'Oferecer excelência através das nossas divisões especializadas',
    'aboutPage.vision.title': 'A Nossa Visão',
    'aboutPage.vision.desc': 'Ser o parceiro de confiança para empresas em todo o Reino Unido',
    'aboutPage.values.title': 'Os Nossos Valores',
    'aboutPage.values.desc': 'Integridade, Excelência e Foco no Cliente',
    
    // Corporate Page
    'corporatePage.title': 'Informações Corporativas',
    'corporatePage.subtitle': 'Conheça a nossa estrutura empresarial e governança',
    'corporatePage.badge': 'CORPORATIVO',
    'corporatePage.company.title': 'Detalhes da Empresa',
    'corporatePage.company.desc': 'JA Group Services Ltd está registada em Inglaterra e País de Gales',
    'corporatePage.governance.title': 'Governança',
    'corporatePage.governance.desc': 'Comprometidos com transparência e melhores práticas',
    
    // Divisions Page
    'divisionsPage.title': 'As Nossas Divisões',
    'divisionsPage.subtitle': 'Serviços especializados em múltiplos sectores',
    'divisionsPage.badge': 'AS NOSSAS DIVISÕES',
    'divisionsPage.intro': 'Explore a nossa gama de divisões especializadas',
    'divisionsPage.cta': 'Saiba Mais',
    
    // Structure Page
    'structurePage.title': 'A Nossa Estrutura de Grupo',
    'structurePage.subtitle': 'Compreender a nossa organização corporativa',
    'structurePage.badge': 'ESTRUTURA DO GRUPO',
    
    // Services Page
    'servicesPage.title': 'Serviços Recomendados',
    'servicesPage.subtitle': 'Parceiros e fornecedores de serviços de confiança',
    'servicesPage.badge': 'SERVIÇOS RECOMENDADOS',
    
    // Activities Page
    'activitiesPage.title': 'Encontrar Actividades e Tours',
    'activitiesPage.subtitle': 'Descubra experiências em todo o mundo',
    'activitiesPage.badge': 'ACTIVIDADES E TOURS',
    'activitiesPage.search': 'Pesquisar actividades...',
    'activitiesPage.viewAll': 'Ver Todas as Actividades',
    
    // Announcements Page
    'announcementsPage.title': 'Anúncios',
    'announcementsPage.subtitle': 'Últimas actualizações da JA Group Services',
    'announcementsPage.badge': 'ANÚNCIOS',
    
    // Sitemap Page
    'sitemapPage.title': 'Mapa do Site',
    'sitemapPage.subtitle': 'Navegue no nosso website',
    'sitemapPage.badge': 'MAPA DO SITE',
    
    // Homepage - Featured Division Content
    'featured.badge': 'A Nossa Divisão em Destaque',
    'featured.sectionTitle': 'Apresentamos o JA Domain Hub',
    'featured.description': 'Serviços profissionais de domínio e alojamento concebidos para empresas de todos os tamanhos.',
    'featured.features.domain': 'Registo de Domínio',
    'featured.features.email': 'Email Profissional',
    'featured.features.hosting': 'Alojamento Web',
    'featured.keyFeatures': 'Características Principais',
    'featured.feature1.title': 'Registo de Domínio',
    'featured.feature1.desc': 'Proteja o seu nome de domínio perfeito',
    'featured.feature2.title': 'Email Profissional',
    'featured.feature2.desc': 'Soluções de alojamento de email empresarial',
    'featured.feature3.title': 'Alojamento Seguro',
    'featured.feature3.desc': 'Alojamento web fiável e protegido',
    'featured.feature4.title': 'Suporte Especializado',
    'featured.feature4.desc': 'Assistência ao cliente baseada no Reino Unido',
    'featured.cta': 'Visitar JA Domain Hub',
    'featured.viewall': 'Ver Todos os Serviços Recomendados',
    
    // About Us - Body Content
    'about.whoWeAre.title': 'Quem Somos',
    'about.whoWeAre.p1': 'A JA Group Services Ltd é uma empresa operacional registada no Reino Unido que fornece governação profissional, infraestrutura operacional e estruturas de conformidade para divisões empresariais.',
    'about.whoWeAre.p2': 'Operamos com foco na responsabilidade, supervisão estruturada e sustentabilidade a longo prazo. A nossa abordagem prioriza o crescimento disciplinado sobre a expansão rápida, garantindo que cada divisão opera dentro de uma estrutura de governação robusta.',
    'about.ourPurpose.title': 'O Nosso Propósito',
    'about.ourPurpose.p1': 'Existimos para fornecer a espinha dorsal operacional que permite às divisões empresariais concentrarem-se nos seus serviços principais, beneficiando de governação partilhada, infraestrutura de conformidade e padrões profissionais.',
    'about.ourPurpose.p2': 'O nosso modelo separa a supervisão operacional das actividades diárias das divisões, criando estruturas de responsabilidade claras e práticas empresariais sustentáveis.',
    'about.coreValues.title': 'Valores Fundamentais',
    'about.coreValues.subtitle': 'Os princípios que orientam as nossas operações e tomada de decisões.',
    'about.governance.title': 'Governação e Responsabilidade',
    'about.governance.desc': 'Mantemos estruturas de supervisão estruturadas, linhas de reporte claras e medidas de responsabilidade transparentes em todas as divisões e operações.',
    'about.growth.title': 'Crescimento Disciplinado',
    'about.growth.desc': 'O crescimento é medido e deliberado. Priorizamos a prontidão operacional e a sustentabilidade sobre a expansão rápida, garantindo que cada divisão tem a infraestrutura de que necessita.',
    'about.professional.title': 'Padrões Profissionais',
    'about.professional.desc': 'Mantemos elevados padrões de profissionalismo, conformidade e conduta ética em todas as actividades empresariais e parcerias.',
    'about.partnerships.title': 'Parcerias Colaborativas',
    'about.partnerships.desc': 'Construímos relações a longo prazo com parceiros que partilham o nosso compromisso com a qualidade, transparência e prestação de serviços profissionais.',
    
    // Group Structure - Body Content
    'structure.overview.title': 'Visão Geral da Estrutura Corporativa',
    'structure.overview.p1': 'A JA Group Services Ltd opera como uma subsidiária totalmente detida da JSDS Group Ltd, criando uma relação clara entre empresa-mãe e subsidiária que proporciona tanto independência operacional como supervisão estratégica.',
    'structure.overview.p2': 'Esta estrutura permite uma gestão operacional focada, mantendo os benefícios de governação, conformidade e direcção estratégica de uma relação com a empresa-mãe.',
    'structure.jsds.title': 'JSDS Group Ltd',
    'structure.jsds.role': 'Empresa-Mãe',
    'structure.jsds.desc': 'A JSDS Group Ltd serve como empresa-mãe, fornecendo supervisão estratégica, estruturas de governação e direcção a longo prazo. A empresa-mãe garante que os padrões de conformidade são mantidos e apoia o crescimento sustentável em toda a estrutura do grupo.',
    'structure.ja.title': 'JA Group Services Ltd',
    'structure.ja.role': 'Subsidiária Operacional',
    'structure.ja.desc': 'A JA Group Services Ltd opera como subsidiária activa, gerindo operações diárias, estruturas de divisão e prestação de serviços. Como empresa operacional, mantém independência operacional enquanto beneficia da supervisão e apoio da empresa-mãe.',
    'structure.relationship.title': 'A Relação Empresa-Mãe-Subsidiária',
    'structure.relationship.p1': 'Esta estrutura cria uma separação clara entre governação estratégica (empresa-mãe) e gestão operacional (subsidiária), permitindo execução focada mantendo responsabilidade e supervisão.',
    'structure.relationship.p2': 'A relação garante que as decisões operacionais podem ser tomadas eficientemente enquanto a direcção estratégica, estruturas de conformidade e padrões de governação permanecem consistentes e geridos profissionalmente.',
    'structure.why.title': 'Porquê Esta Estrutura?',
    'structure.why.subtitle': 'Os benefícios da nossa organização corporativa',
    'structure.why.governance.title': 'Governação Clara',
    'structure.why.governance.desc': 'A separação da supervisão estratégica e gestão operacional cria estruturas claras de responsabilidade e tomada de decisões.',
    'structure.why.clarity.title': 'Clareza Operacional',
    'structure.why.clarity.desc': 'Papéis e responsabilidades definidos permitem operações eficientes mantendo padrões profissionais e conformidade.',
    'structure.why.sustainability.title': 'Sustentabilidade a Longo Prazo',
    'structure.why.sustainability.desc': 'A supervisão da empresa-mãe garante estratégias de crescimento sustentável e governação consistente em todas as operações.',
    'structure.why.compliance.title': 'Conformidade e Padrões',
    'structure.why.compliance.desc': 'Estruturas estruturadas garantem que todas as operações cumprem os requisitos regulamentares e mantêm padrões profissionais.',
    'structure.learn.title': 'Saiba Mais',
    'structure.learn.about': 'Sobre a JA Group Services',
    'structure.learn.divisions': 'As Nossas Divisões',
    'structure.learn.corporate': 'Corporativo e Parcerias',
    
    // Corporate Page - Body Content
    'corporate.partnership.badge': 'OPORTUNIDADES DE PARCERIA',
    'corporate.partnership.title': 'Seja Nosso Parceiro',
    'corporate.partnership.subtitle': 'Estamos sempre interessados em colaborar com prestadores de serviços e empresas que partilham o nosso compromisso com a qualidade e profissionalismo',
    'corporate.collab.title': 'Parcerias Colaborativas',
    'corporate.collab.p1': 'Acreditamos na construção de parcerias fortes e mutuamente benéficas com prestadores de serviços, parceiros tecnológicos e empresas que possam melhorar as nossas ofertas de serviços aos clientes do Reino Unido.',
    'corporate.collab.p2': 'Quer ofereça serviços complementares, soluções inovadoras ou tenha experiência que se alinhe com a nossa missão, adoraríamos explorar oportunidades de parceria.',
    'corporate.areas.title': 'Áreas de Parceria',
    'corporate.areas.service.title': 'Prestadores de Serviços',
    'corporate.areas.service.desc': 'Serviços digitais, alojamento, desenvolvimento, marketing',
    'corporate.areas.tech.title': 'Parceiros Tecnológicos',
    'corporate.areas.tech.desc': 'Soluções de software, plataformas, integrações',
    'corporate.areas.reseller.title': 'Oportunidades de Revenda',
    'corporate.areas.reseller.desc': 'Serviços de marca branca, programas de afiliados',
    'corporate.areas.strategic.title': 'Alianças Estratégicas',
    'corporate.areas.strategic.desc': 'Joint ventures, co-marketing, parcerias de referência',
    'corporate.why.title': 'Porquê Ser Nosso Parceiro',
    'corporate.why.uk.title': 'Operações no Reino Unido',
    'corporate.why.uk.desc': 'Empresa profissional do Reino Unido com estruturas de governação e conformidade estabelecidas',
    'corporate.why.professional.title': 'Padrões Profissionais',
    'corporate.why.professional.desc': 'Compromisso com qualidade, transparência e práticas empresariais éticas',
    'corporate.why.support.title': 'Suporte Dedicado',
    'corporate.why.support.desc': 'Abordagem colaborativa com comunicação clara e gestão de parceria fiável',
    'corporate.why.growth.title': 'Oportunidades de Crescimento',
    'corporate.why.growth.desc': 'Acesso à nossa base de clientes e potencial para desenvolvimento empresarial a longo prazo',
    'corporate.info.badge': 'INFORMAÇÃO DA EMPRESA',
    'corporate.info.title': 'Detalhes da Empresa',
    'corporate.info.name.label': 'Nome Registado',
    'corporate.info.name.value': 'JA Group Services Ltd',
    'corporate.info.number.label': 'Número da Empresa',
    'corporate.info.number.value': '16024881',
    'corporate.info.registered.label': 'Escritório Registado',
    'corporate.info.registered.value': '124 City Road, Londres, Inglaterra, EC1V 2NX',
    'corporate.info.vat.label': 'Número de IVA',
    'corporate.info.vat.value': 'Não Registado para IVA',
    'corporate.info.ico.label': 'Registo ICO',
    'corporate.info.ico.value': 'ZB877370',
    'corporate.governance.badge': 'GOVERNAÇÃO',
    'corporate.governance.title': 'Governação Corporativa',
    'corporate.governance.subtitle': 'O nosso compromisso com padrões profissionais e responsabilidade',
    'corporate.governance.framework.title': 'Estrutura de Governação',
    'corporate.governance.framework.desc': 'Processos de supervisão e tomada de decisão estruturados garantem responsabilidade em todas as operações e divisões.',
    'corporate.governance.compliance.title': 'Conformidade Regulamentar',
    'corporate.governance.compliance.desc': 'Conformidade total com a lei das empresas do Reino Unido, regulamentos de protecção de dados e padrões da indústria.',
    'corporate.governance.accountability.title': 'Responsabilidade Clara',
    'corporate.governance.accountability.desc': 'Papéis, responsabilidades e estruturas de reporte definidos mantêm transparência e padrões profissionais.',
    'corporate.governance.transparency.title': 'Transparência Operacional',
    'corporate.governance.transparency.desc': 'Comunicação aberta com partes interessadas, parceiros e clientes sobre as nossas operações e práticas.',
    'corporate.contact.title': 'Entre em Contacto',
    'corporate.contact.subtitle': 'Interessado em oportunidades de parceria ou tem questões sobre a nossa empresa?',
    'corporate.contact.button': 'Contacte-nos',
    
    // Divisions Page - Body Content
    'divisions.framework.title': 'Estrutura Operacional',
    'divisions.framework.subtitle': 'A nossa estrutura de divisões permite a prestação de serviços especializados mantendo governação, conformidade e padrões profissionais consistentes em todas as operações.',
    'divisions.framework.governance.title': 'Governação e Responsabilidade',
    'divisions.framework.governance.desc': 'Cada divisão opera sob a estrutura de governação da JA Group Services Ltd, garantindo responsabilidade e padrões profissionais.',
    'divisions.framework.infrastructure.title': 'Infraestrutura Profissional',
    'divisions.framework.infrastructure.desc': 'As divisões beneficiam de infraestrutura operacional partilhada, estruturas de conformidade e sistemas de suporte profissional.',
    'divisions.framework.standards.title': 'Padrões Consistentes',
    'divisions.framework.standards.desc': 'Todas as divisões mantêm qualidade, conformidade e padrões de serviço consistentes alinhados com os nossos valores corporativos.',
    'divisions.current.title': 'Divisões Atuais',
    'divisions.current.subtitle': 'As nossas divisões ativas a prestar serviços especializados.',
    'divisions.jadomainhub.role': 'Divisão de Serviços de Domínio',
    'divisions.jadomainhub.desc': 'JA DOMAIN HUB é a nossa divisão de serviços de domínio, fornecendo registo profissional de domínios, gestão e serviços relacionados a empresas e organizações.',
    'divisions.jadomainhub.services.title': 'Serviços',
    'divisions.jadomainhub.services.item1': 'Serviços de registo e renovação de domínios',
    'divisions.jadomainhub.services.item2': 'Gestão de portfólio de domínios',
    'divisions.jadomainhub.services.item3': 'Gestão e configuração de DNS',
    'divisions.jadomainhub.services.item4': 'Suporte de transferência e migração de domínios',
    'divisions.jadomainhub.partnerships.title': 'Parcerias Estratégicas',
    'divisions.jadomainhub.partnerships.desc': 'JA DOMAIN HUB opera através de parcerias estratégicas com registos de domínios líderes e prestadores de serviços, permitindo-nos oferecer serviços de domínio abrangentes com fiabilidade e suporte de nível empresarial.',
    'divisions.jadomainhub.button.portal': 'Aceder ao Portal da Divisão',
    'divisions.jadomainhub.button.visit': 'Visitar JA DOMAIN HUB',
    'divisions.jadomainhub.button.contact': 'Contactar Divisão',
    'divisions.future.title': 'Crescimento Futuro',
    'divisions.future.subtitle': 'A nossa estrutura de divisões permite expansão disciplinada em novas áreas de serviço.',
    'divisions.future.p1': 'A estrutura de divisões da JA Group Services Ltd foi concebida para apoiar crescimento controlado. Novas divisões podem ser estabelecidas quando as oportunidades se alinham com os nossos padrões de governação, capacidades operacionais e objetivos estratégicos.',
    'divisions.future.p2': 'Cada divisão potencial passa por avaliação rigorosa para garantir que pode manter os nossos padrões de responsabilidade, conformidade e prestação de serviço profissional antes da integração na nossa estrutura operacional.',
    
    // Recommended Services Page - Body Content
    'recommended.title': 'Serviços Recomendados',
    'recommended.hero.badge': 'Serviços de Confiança',
    'recommended.hero.subtitle': 'Prestadores de serviços cuidadosamente selecionados que cumprem os nossos padrões de qualidade, fiabilidade e prestação de serviço profissional.',
    'recommended.tabs.business': 'Serviços Empresariais',
    'recommended.tabs.activities': 'Atividades e Passeios',
    'recommended.business.badge': 'Serviços Profissionais',
    'recommended.business.title': 'Soluções Empresariais',
    'recommended.business.subtitle': 'Prestadores de confiança para formação de empresas, conformidade e serviços empresariais profissionais',
    'recommended.business.section1': 'Formação de Empresas e Serviços Empresariais',
    
    // Header Navigation
    'header.divisions': 'As Nossas Divisões',
    'header.divisions.about': 'Sobre as Nossas Divisões',
    'header.contact': 'Contacte-nos',
    'header.company': 'Empresa',
    'header.company.about': 'Sobre Nós',
    'header.company.structure': 'A Nossa Estrutura de Grupo',
    'header.company.corporate': 'Corporativo',
    
    // Footer
    'footer.company': 'Empresa',
    'footer.company.about': 'Sobre Nós',
    'footer.company.contact': 'Contacte-nos',
    'footer.company.team': 'Conheça a Equipa',
    'footer.company.parent': 'Empresa-Mãe',
    'footer.legal': 'Legal e Recursos',
    'footer.legal.terms': 'Termos',
    'footer.legal.privacy': 'Política de Privacidade',
    'footer.legal.cookies': 'Política de Cookies',
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.about': 'Sobre Nosotros',
    'nav.divisions': 'Nuestras Divisiones',
    'nav.structure': 'Estructura del Grupo',
    'nav.services': 'Servicios',
    'nav.activities': 'Actividades y Tours',
    'nav.contact': 'Contáctenos',
    'nav.corporate': 'Corporativo',
    
    // Homepage Hero
    'hero.badge': 'Grupo Empresarial en el Reino Unido',
    'hero.title': 'JA Group Services Ltd',
    'hero.subtitle': 'Un nombre en crecimiento en soluciones empresariales. Divisiones especializadas creadas para apoyarle y crecer con usted.',
    'hero.cta.divisions': 'Explorar Nuestras Divisiones',
    'hero.cta.contact': 'Póngase en Contacto',
    
    // Stats Cards
    'stats.ukbased.label': 'Con Sede en el Reino Unido',
    'stats.ukbased.value': 'Londres',
    'stats.trusted.label': 'Calidad',
    'stats.trusted.value': 'Servicios',
    'stats.customer.label': 'Enfocado en el',
    'stats.customer.value': 'Cliente',
    'stats.professional.label': 'Múltiples',
    'stats.professional.value': 'Divisiones',
    
    // Why Choose Us
    'why.badge': 'Por Qué Elegirnos',
    'why.title': 'Construido para la Excelencia',
    'why.subtitle': 'Experiencia profesional respaldada por soporte británico y compromiso con la calidad',
    'why.ukbased.title': 'Excelencia Británica',
    'why.ukbased.desc': 'Orgullosamente con sede en Londres, brindando experiencia local y soporte dedicado.',
    'why.customer.title': 'Enfocado en el Cliente',
    'why.customer.desc': 'Comprendiendo y satisfaciendo sus necesidades con soluciones personalizadas.',
    'why.trusted.title': 'Servicio de Calidad',
    'why.trusted.desc': 'Colaborando con proveedores líderes para ofrecer soluciones de calidad.',
    'why.professional.title': 'Estándares Profesionales',
    'why.professional.desc': 'Comprometidos con la excelencia, transparencia y satisfacción del cliente.',
    
    // Contact CTA
    'contact.title': '¿Listo para Comenzar?',
    'contact.subtitle': '¿Tiene preguntas sobre JA Group Services o nuestras divisiones? Estamos aquí para ayudar.',
    'contact.phone': '020 3834 2790',
    'contact.email': 'hello@jagroupservices.co.uk',
    'contact.cta.primary': 'Contáctenos Hoy',
    'contact.cta.secondary': 'Conozca Más Sobre Nosotros',
    
    // Contact Page
    'contactPage.title': 'Contáctenos',
    'contactPage.subtitle': 'Póngase en contacto con nuestro equipo',
    'contactPage.badge': 'PÓNGASE EN CONTACTO',
    'contactPage.form.name': 'Su Nombre',
    'contactPage.form.email': 'Dirección de Correo Electrónico',
    'contactPage.form.subject': 'Asunto',
    'contactPage.form.message': 'Su Mensaje',
    'contactPage.form.submit': 'Enviar Mensaje',
    'contactPage.info.title': 'Información de Contacto',
    'contactPage.info.phone': 'Teléfono',
    'contactPage.info.email': 'Correo Electrónico',
    'contactPage.info.address': 'Dirección',
    
    // About Us Page
    'aboutPage.title': 'Sobre Nosotros',
    'aboutPage.subtitle': 'Conozca más sobre JA Group Services',
    'aboutPage.badge': 'QUIÉNES SOMOS',
    'aboutPage.mission.title': 'Nuestra Misión',
    'aboutPage.mission.desc': 'Ofrecer excelencia a través de nuestras divisiones especializadas',
    'aboutPage.vision.title': 'Nuestra Visión',
    'aboutPage.vision.desc': 'Ser el socio de confianza para empresas en todo el Reino Unido',
    'aboutPage.values.title': 'Nuestros Valores',
    'aboutPage.values.desc': 'Integridad, Excelencia y Enfoque en el Cliente',
    
    // Corporate Page
    'corporatePage.title': 'Información Corporativa',
    'corporatePage.subtitle': 'Conozca nuestra estructura empresarial y gobernanza',
    'corporatePage.badge': 'CORPORATIVO',
    'corporatePage.company.title': 'Detalles de la Empresa',
    'corporatePage.company.desc': 'JA Group Services Ltd está registrada en Inglaterra y Gales',
    'corporatePage.governance.title': 'Gobernanza',
    'corporatePage.governance.desc': 'Comprometidos con la transparencia y las mejores prácticas',
    
    // Divisions Page
    'divisionsPage.title': 'Nuestras Divisiones',
    'divisionsPage.subtitle': 'Servicios especializados en múltiples sectores',
    'divisionsPage.badge': 'NUESTRAS DIVISIONES',
    'divisionsPage.intro': 'Explore nuestra gama de divisiones especializadas',
    'divisionsPage.cta': 'Conozca Más',
    
    // Structure Page
    'structurePage.title': 'Nuestra Estructura de Grupo',
    'structurePage.subtitle': 'Comprender nuestra organización corporativa',
    'structurePage.badge': 'ESTRUCTURA DEL GRUPO',
    
    // Services Page
    'servicesPage.title': 'Servicios Recomendados',
    'servicesPage.subtitle': 'Socios y proveedores de servicios de confianza',
    'servicesPage.badge': 'SERVICIOS RECOMENDADOS',
    
    // Activities Page
    'activitiesPage.title': 'Encontrar Actividades y Tours',
    'activitiesPage.subtitle': 'Descubra experiencias en todo el mundo',
    'activitiesPage.badge': 'ACTIVIDADES Y TOURS',
    'activitiesPage.search': 'Buscar actividades...',
    'activitiesPage.viewAll': 'Ver Todas las Actividades',
    
    // Announcements Page
    'announcementsPage.title': 'Anuncios',
    'announcementsPage.subtitle': 'Últimas actualizaciones de JA Group Services',
    'announcementsPage.badge': 'ANUNCIOS',
    
    // Sitemap Page
    'sitemapPage.title': 'Mapa del Sitio',
    'sitemapPage.subtitle': 'Navegue por nuestro sitio web',
    'sitemapPage.badge': 'MAPA DEL SITIO',
    
    // Homepage - Featured Division Content
    'featured.badge': 'Nuestra División Destacada',
    'featured.sectionTitle': 'Presentamos JA Domain Hub',
    'featured.description': 'Servicios profesionales de dominio y alojamiento diseñados para empresas de todos los tamaños.',
    'featured.features.domain': 'Registro de Dominio',
    'featured.features.email': 'Correo Electrónico Profesional',
    'featured.features.hosting': 'Alojamiento Web',
    'featured.keyFeatures': 'Características Clave',
    'featured.feature1.title': 'Registro de Dominio',
    'featured.feature1.desc': 'Asegure su nombre de dominio perfecto',
    'featured.feature2.title': 'Correo Electrónico Profesional',
    'featured.feature2.desc': 'Soluciones de alojamiento de correo empresarial',
    'featured.feature3.title': 'Alojamiento Seguro',
    'featured.feature3.desc': 'Alojamiento web fiable y protegido',
    'featured.feature4.title': 'Soporte Experto',
    'featured.feature4.desc': 'Asistencia al cliente con sede en el Reino Unido',
    'featured.cta': 'Visitar JA Domain Hub',
    'featured.viewall': 'Ver Todos los Servicios Recomendados',
    
    // About Us - Body Content
    'about.whoWeAre.title': 'Quiénes Somos',
    'about.whoWeAre.p1': 'JA Group Services Ltd es una empresa operativa registrada en el Reino Unido que proporciona gobernanza profesional, infraestructura operativa y marcos de cumplimiento para divisiones empresariales.',
    'about.whoWeAre.p2': 'Operamos con un enfoque en la responsabilidad, supervisión estructurada y sostenibilidad a largo plazo. Nuestro enfoque prioriza el crecimiento disciplinado sobre la expansión rápida, asegurando que cada división opere dentro de un marco de gobernanza robusto.',
    'about.ourPurpose.title': 'Nuestro Propósito',
    'about.ourPurpose.p1': 'Existimos para proporcionar la columna vertebral operativa que permite a las divisiones empresariales centrarse en sus servicios principales mientras se benefician de gobernanza compartida, infraestructura de cumplimiento y estándares profesionales.',
    'about.ourPurpose.p2': 'Nuestro modelo separa la supervisión operativa de las actividades diarias de las divisiones, creando estructuras de responsabilidad claras y prácticas empresariales sostenibles.',
    'about.coreValues.title': 'Valores Fundamentales',
    'about.coreValues.subtitle': 'Los principios que guían nuestras operaciones y toma de decisiones.',
    'about.governance.title': 'Gobernanza y Responsabilidad',
    'about.governance.desc': 'Mantenemos marcos de supervisión estructurados, líneas de reporte claras y medidas de responsabilidad transparentes en todas las divisiones y operaciones.',
    'about.growth.title': 'Crecimiento Disciplinado',
    'about.growth.desc': 'El crecimiento es medido y deliberado. Priorizamos la preparación operativa y la sostenibilidad sobre la expansión rápida, asegurando que cada división tenga la infraestructura que necesita.',
    'about.professional.title': 'Estándares Profesionales',
    'about.professional.desc': 'Mantenemos altos estándares de profesionalismo, cumplimiento y conducta ética en todas las actividades empresariales y asociaciones.',
    'about.partnerships.title': 'Asociaciones Colaborativas',
    'about.partnerships.desc': 'Construimos relaciones a largo plazo con socios que comparten nuestro compromiso con la calidad, transparencia y prestación de servicios profesionales.',
    
    // Group Structure - Body Content
    'structure.overview.title': 'Visión General de la Estructura Corporativa',
    'structure.overview.p1': 'JA Group Services Ltd opera como una subsidiaria de propiedad total de JSDS Group Ltd, creando una relación clara entre empresa matriz y subsidiaria que proporciona tanto independencia operativa como supervisión estratégica.',
    'structure.overview.p2': 'Esta estructura permite una gestión operativa enfocada mientras mantiene los beneficios de gobernanza, cumplimiento y dirección estratégica de una relación con la empresa matriz.',
    'structure.jsds.title': 'JSDS Group Ltd',
    'structure.jsds.role': 'Empresa Matriz',
    'structure.jsds.desc': 'JSDS Group Ltd sirve como empresa matriz, proporcionando supervisión estratégica, marcos de gobernanza y dirección a largo plazo. La empresa matriz garantiza que se mantengan los estándares de cumplimiento y apoya el crecimiento sostenible en toda la estructura del grupo.',
    'structure.ja.title': 'JA Group Services Ltd',
    'structure.ja.role': 'Subsidiaria Operativa',
    'structure.ja.desc': 'JA Group Services Ltd opera como subsidiaria activa, gestionando operaciones diarias, marcos de división y prestación de servicios. Como empresa operativa, mantiene independencia operativa mientras se beneficia de la supervisión y apoyo de la empresa matriz.',
    'structure.relationship.title': 'La Relación Empresa Matriz-Subsidiaria',
    'structure.relationship.p1': 'Esta estructura crea una separación clara entre gobernanza estratégica (empresa matriz) y gestión operativa (subsidiaria), permitiendo ejecución enfocada mientras mantiene responsabilidad y supervisión.',
    'structure.relationship.p2': 'La relación garantiza que las decisiones operativas puedan tomarse eficientemente mientras la dirección estratégica, marcos de cumplimiento y estándares de gobernanza permanecen consistentes y gestionados profesionalmente.',
    'structure.why.title': '¿Por Qué Esta Estructura?',
    'structure.why.subtitle': 'Los beneficios de nuestra organización corporativa',
    'structure.why.governance.title': 'Gobernanza Clara',
    'structure.why.governance.desc': 'La separación de supervisión estratégica y gestión operativa crea marcos claros de responsabilidad y toma de decisiones.',
    'structure.why.clarity.title': 'Claridad Operativa',
    'structure.why.clarity.desc': 'Roles y responsabilidades definidos permiten operaciones eficientes mientras mantienen estándares profesionales y cumplimiento.',
    'structure.why.sustainability.title': 'Sostenibilidad a Largo Plazo',
    'structure.why.sustainability.desc': 'La supervisión de la empresa matriz garantiza estrategias de crecimiento sostenible y gobernanza consistente en todas las operaciones.',
    'structure.why.compliance.title': 'Cumplimiento y Estándares',
    'structure.why.compliance.desc': 'Marcos estructurados garantizan que todas las operaciones cumplan con los requisitos regulatorios y mantengan estándares profesionales.',
    'structure.learn.title': 'Conozca Más',
    'structure.learn.about': 'Sobre JA Group Services',
    'structure.learn.divisions': 'Nuestras Divisiones',
    'structure.learn.corporate': 'Corporativo y Asociaciones',
    
    // Corporate Page - Body Content
    'corporate.partnership.badge': 'OPORTUNIDADES DE ASOCIACIÓN',
    'corporate.partnership.title': 'Asóciese Con Nosotros',
    'corporate.partnership.subtitle': 'Siempre estamos interesados en colaborar con proveedores de servicios y empresas que compartan nuestro compromiso con la calidad y el profesionalismo',
    'corporate.collab.title': 'Asociaciones Colaborativas',
    'corporate.collab.p1': 'Creemos en construir asociaciones sólidas y mutuamente beneficiosas con proveedores de servicios, socios tecnológicos y empresas que puedan mejorar nuestras ofertas de servicios a clientes del Reino Unido.',
    'corporate.collab.p2': 'Ya sea que ofrezca servicios complementarios, soluciones innovadoras o tenga experiencia que se alinee con nuestra misión, nos encantaría explorar oportunidades de asociación.',
    'corporate.areas.title': 'Áreas de Asociación',
    'corporate.areas.service.title': 'Proveedores de Servicios',
    'corporate.areas.service.desc': 'Servicios digitales, alojamiento, desarrollo, marketing',
    'corporate.areas.tech.title': 'Socios Tecnológicos',
    'corporate.areas.tech.desc': 'Soluciones de software, plataformas, integraciones',
    'corporate.areas.reseller.title': 'Oportunidades de Reventa',
    'corporate.areas.reseller.desc': 'Servicios de marca blanca, programas de afiliados',
    'corporate.areas.strategic.title': 'Alianzas Estratégicas',
    'corporate.areas.strategic.desc': 'Joint ventures, co-marketing, asociaciones de referencia',
    'corporate.why.title': 'Por Qué Asociarse Con Nosotros',
    'corporate.why.uk.title': 'Operaciones en el Reino Unido',
    'corporate.why.uk.desc': 'Empresa profesional del Reino Unido con marcos de gobernanza y cumplimiento establecidos',
    'corporate.why.professional.title': 'Estándares Profesionales',
    'corporate.why.professional.desc': 'Compromiso con la calidad, transparencia y prácticas empresariales éticas',
    'corporate.why.support.title': 'Soporte Dedicado',
    'corporate.why.support.desc': 'Enfoque colaborativo con comunicación clara y gestión de asociación confiable',
    'corporate.why.growth.title': 'Oportunidades de Crecimiento',
    'corporate.why.growth.desc': 'Acceso a nuestra base de clientes y potencial para desarrollo empresarial a largo plazo',
    'corporate.info.badge': 'INFORMACIÓN DE LA EMPRESA',
    'corporate.info.title': 'Detalles de la Empresa',
    'corporate.info.name.label': 'Nombre Registrado',
    'corporate.info.name.value': 'JA Group Services Ltd',
    'corporate.info.number.label': 'Número de Empresa',
    'corporate.info.number.value': '16024881',
    'corporate.info.registered.label': 'Oficina Registrada',
    'corporate.info.registered.value': '124 City Road, Londres, Inglaterra, EC1V 2NX',
    'corporate.info.vat.label': 'Número de IVA',
    'corporate.info.vat.value': 'No Registrado para IVA',
    'corporate.info.ico.label': 'Registro ICO',
    'corporate.info.ico.value': 'ZB877370',
    'corporate.governance.badge': 'GOBERNANZA',
    'corporate.governance.title': 'Gobernanza Corporativa',
    'corporate.governance.subtitle': 'Nuestro compromiso con estándares profesionales y responsabilidad',
    'corporate.governance.framework.title': 'Marco de Gobernanza',
    'corporate.governance.framework.desc': 'Procesos de supervisión y toma de decisiones estructurados garantizan responsabilidad en todas las operaciones y divisiones.',
    'corporate.governance.compliance.title': 'Cumplimiento Regulatorio',
    'corporate.governance.compliance.desc': 'Cumplimiento total con la ley de empresas del Reino Unido, regulaciones de protección de datos y estándares de la industria.',
    'corporate.governance.accountability.title': 'Responsabilidad Clara',
    'corporate.governance.accountability.desc': 'Roles, responsabilidades y estructuras de reporte definidos mantienen transparencia y estándares profesionales.',
    'corporate.governance.transparency.title': 'Transparencia Operativa',
    'corporate.governance.transparency.desc': 'Comunicación abierta con partes interesadas, socios y clientes sobre nuestras operaciones y prácticas.',
    'corporate.contact.title': 'Póngase en Contacto',
    'corporate.contact.subtitle': '¿Interesado en oportunidades de asociación o tiene preguntas sobre nuestra empresa?',
    'corporate.contact.button': 'Contáctenos',
    
    // Divisions Page - Body Content
    'divisions.framework.title': 'Marco Operativo',
    'divisions.framework.subtitle': 'Nuestra estructura de divisiones permite la prestación de servicios especializados manteniendo gobernanza, cumplimiento y estándares profesionales consistentes en todas las operaciones.',
    'divisions.framework.governance.title': 'Gobernanza y Responsabilidad',
    'divisions.framework.governance.desc': 'Cada división opera bajo el marco de gobernanza de JA Group Services Ltd, garantizando responsabilidad y estándares profesionales.',
    'divisions.framework.infrastructure.title': 'Infraestructura Profesional',
    'divisions.framework.infrastructure.desc': 'Las divisiones se benefician de infraestructura operativa compartida, marcos de cumplimiento y sistemas de soporte profesional.',
    'divisions.framework.standards.title': 'Estándares Consistentes',
    'divisions.framework.standards.desc': 'Todas las divisiones mantienen calidad, cumplimiento y estándares de servicio consistentes alineados con nuestros valores corporativos.',
    'divisions.current.title': 'Divisiones Actuales',
    'divisions.current.subtitle': 'Nuestras divisiones activas prestando servicios especializados.',
    'divisions.jadomainhub.role': 'División de Servicios de Dominio',
    'divisions.jadomainhub.desc': 'JA DOMAIN HUB es nuestra división de servicios de dominio, proporcionando registro profesional de dominios, gestión y servicios relacionados a empresas y organizaciones.',
    'divisions.jadomainhub.services.title': 'Servicios',
    'divisions.jadomainhub.services.item1': 'Servicios de registro y renovación de dominios',
    'divisions.jadomainhub.services.item2': 'Gestión de cartera de dominios',
    'divisions.jadomainhub.services.item3': 'Gestión y configuración de DNS',
    'divisions.jadomainhub.services.item4': 'Soporte de transferencia y migración de dominios',
    'divisions.jadomainhub.partnerships.title': 'Asociaciones Estratégicas',
    'divisions.jadomainhub.partnerships.desc': 'JA DOMAIN HUB opera a través de asociaciones estratégicas con registros de dominios líderes y proveedores de servicios, permitiéndonos ofrecer servicios de dominio integrales con fiabilidad y soporte de nivel empresarial.',
    'divisions.jadomainhub.button.portal': 'Acceder al Portal de la División',
    'divisions.jadomainhub.button.visit': 'Visitar JA DOMAIN HUB',
    'divisions.jadomainhub.button.contact': 'Contactar División',
    'divisions.future.title': 'Crecimiento Futuro',
    'divisions.future.subtitle': 'Nuestro marco de divisiones permite expansión disciplinada en nuevas áreas de servicio.',
    'divisions.future.p1': 'La estructura de divisiones de JA Group Services Ltd está diseñada para apoyar crecimiento controlado. Nuevas divisiones pueden establecerse cuando las oportunidades se alinean con nuestros estándares de gobernanza, capacidades operativas y objetivos estratégicos.',
    'divisions.future.p2': 'Cada división potencial pasa por evaluación rigurosa para garantizar que puede mantener nuestros estándares de responsabilidad, cumplimiento y prestación de servicio profesional antes de la integración en nuestro marco operativo.',
    
    // Recommended Services Page - Body Content
    'recommended.title': 'Servicios Recomendados',
    'recommended.hero.badge': 'Servicios de Confianza',
    'recommended.hero.subtitle': 'Proveedores de servicios cuidadosamente seleccionados que cumplen nuestros estándares de calidad, fiabilidad y prestación de servicio profesional.',
    'recommended.tabs.business': 'Servicios Empresariales',
    'recommended.tabs.activities': 'Actividades y Tours',
    'recommended.business.badge': 'Servicios Profesionales',
    'recommended.business.title': 'Soluciones Empresariales',
    'recommended.business.subtitle': 'Proveedores de confianza para formación de empresas, cumplimiento y servicios empresariales profesionales',
    'recommended.business.section1': 'Formación de Empresas y Servicios Empresariales',
    
    // Header Navigation
    'header.divisions': 'Nuestras Divisiones',
    'header.divisions.about': 'Sobre Nuestras Divisiones',
    'header.contact': 'Contáctenos',
    'header.company': 'Empresa',
    'header.company.about': 'Sobre Nosotros',
    'header.company.structure': 'Nuestra Estructura de Grupo',
    'header.company.corporate': 'Corporativo',
    
    // Footer
    'footer.company': 'Empresa',
    'footer.company.about': 'Sobre Nosotros',
    'footer.company.contact': 'Contáctenos',
    'footer.company.team': 'Conoce al Equipo',
    'footer.company.parent': 'Empresa Matriz',
    'footer.legal': 'Legal y Recursos',
    'footer.legal.terms': 'Términos',
    'footer.legal.privacy': 'Política de Privacidad',
    'footer.legal.cookies': 'Política de Cookies',
  },
  
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.about': 'À Propos',
    'nav.divisions': 'Nos Divisions',
    'nav.structure': 'Structure du Groupe',
    'nav.services': 'Services',
    'nav.activities': 'Activités et Visites',
    'nav.contact': 'Nous Contacter',
    'nav.corporate': 'Entreprise',
    
    // Homepage Hero
    'hero.badge': 'Groupe d\'Entreprises au Royaume-Uni',
    'hero.title': 'JA Group Services Ltd',
    'hero.subtitle': 'Un nom en pleine croissance en solutions d\'entreprise. Des divisions spécialisées conçues pour vous accompagner et grandir avec vous.',
    'hero.cta.divisions': 'Découvrir Nos Divisions',
    'hero.cta.contact': 'Nous Contacter',
    
    // Stats Cards
    'stats.ukbased.label': 'Basé au Royaume-Uni',
    'stats.ukbased.value': 'Londres',
    'stats.trusted.label': 'Qualité',
    'stats.trusted.value': 'Services',
    'stats.customer.label': 'Axé sur le',
    'stats.customer.value': 'Client',
    'stats.professional.label': 'Plusieurs',
    'stats.professional.value': 'Divisions',
    
    // Why Choose Us
    'why.badge': 'Pourquoi Nous Choisir',
    'why.title': 'Fondé sur l\'Excellence',
    'why.subtitle': 'Expertise professionnelle soutenue par un support britannique et un engagement envers la qualité',
    'why.ukbased.title': 'Excellence Britannique',
    'why.ukbased.desc': 'Fièrement basé à Londres, offrant une expertise locale et un support dédié.',
    'why.customer.title': 'Axé sur le Client',
    'why.customer.desc': 'Comprendre et répondre à vos besoins avec des solutions sur mesure.',
    'why.trusted.title': 'Service de Qualité',
    'why.trusted.desc': 'Collaborer avec des fournisseurs de premier plan pour offrir des solutions de qualité.',
    'why.professional.title': 'Normes Professionnelles',
    'why.professional.desc': 'Engagés envers l\'excellence, la transparence et la satisfaction du client.',
    
    // Contact CTA
    'contact.title': 'Prêt à Commencer?',
    'contact.subtitle': 'Vous avez des questions sur JA Group Services ou nos divisions? Nous sommes là pour vous aider.',
    'contact.phone': '020 3834 2790',
    'contact.email': 'hello@jagroupservices.co.uk',
    'contact.cta.primary': 'Contactez-nous Aujourd\'hui',
    'contact.cta.secondary': 'En Savoir Plus Sur Nous',
    
    // Contact Page
    'contactPage.title': 'Nous Contacter',
    'contactPage.subtitle': 'Contactez notre équipe',
    'contactPage.badge': 'NOUS CONTACTER',
    'contactPage.form.name': 'Votre Nom',
    'contactPage.form.email': 'Adresse Email',
    'contactPage.form.subject': 'Sujet',
    'contactPage.form.message': 'Votre Message',
    'contactPage.form.submit': 'Envoyer le Message',
    'contactPage.info.title': 'Informations de Contact',
    'contactPage.info.phone': 'Téléphone',
    'contactPage.info.email': 'Email',
    'contactPage.info.address': 'Adresse',
    
    // About Us Page
    'aboutPage.title': 'À Propos de Nous',
    'aboutPage.subtitle': 'En savoir plus sur JA Group Services',
    'aboutPage.badge': 'QUI NOUS SOMMES',
    'aboutPage.mission.title': 'Notre Mission',
    'aboutPage.mission.desc': 'Offrir l\'excellence à travers nos divisions spécialisées',
    'aboutPage.vision.title': 'Notre Vision',
    'aboutPage.vision.desc': 'Être le partenaire de confiance pour les entreprises à travers le Royaume-Uni',
    'aboutPage.values.title': 'Nos Valeurs',
    'aboutPage.values.desc': 'Intégrité, Excellence et Orientation Client',
    
    // Corporate Page
    'corporatePage.title': 'Informations Corporatives',
    'corporatePage.subtitle': 'Découvrez notre structure d\'entreprise et notre gouvernance',
    'corporatePage.badge': 'ENTREPRISE',
    'corporatePage.company.title': 'Détails de l\'Entreprise',
    'corporatePage.company.desc': 'JA Group Services Ltd est enregistrée en Angleterre et au Pays de Galles',
    'corporatePage.governance.title': 'Gouvernance',
    'corporatePage.governance.desc': 'Engagés envers la transparence et les meilleures pratiques',
    
    // Divisions Page
    'divisionsPage.title': 'Nos Divisions',
    'divisionsPage.subtitle': 'Services spécialisés dans plusieurs secteurs',
    'divisionsPage.badge': 'NOS DIVISIONS',
    'divisionsPage.intro': 'Découvrez notre gamme de divisions spécialisées',
    'divisionsPage.cta': 'En Savoir Plus',
    
    // Structure Page
    'structurePage.title': 'Notre Structure de Groupe',
    'structurePage.subtitle': 'Comprendre notre organisation d\'entreprise',
    'structurePage.badge': 'STRUCTURE DU GROUPE',
    
    // Services Page
    'servicesPage.title': 'Services Recommandés',
    'servicesPage.subtitle': 'Partenaires et fournisseurs de services de confiance',
    'servicesPage.badge': 'SERVICES RECOMMANDÉS',
    
    // Activities Page
    'activitiesPage.title': 'Trouver Activités et Visites',
    'activitiesPage.subtitle': 'Découvrez des expériences dans le monde entier',
    'activitiesPage.badge': 'ACTIVITÉS ET VISITES',
    'activitiesPage.search': 'Rechercher des activités...',
    'activitiesPage.viewAll': 'Voir Toutes les Activités',
    
    // Announcements Page
    'announcementsPage.title': 'Annonces',
    'announcementsPage.subtitle': 'Dernières mises à jour de JA Group Services',
    'announcementsPage.badge': 'ANNONCES',
    
    // Sitemap Page
    'sitemapPage.title': 'Plan du Site',
    'sitemapPage.subtitle': 'Naviguez sur notre site web',
    'sitemapPage.badge': 'PLAN DU SITE',
    
    // Homepage - Featured Division Content
    'featured.badge': 'Notre Division Vedette',
    'featured.sectionTitle': 'Présentation de JA Domain Hub',
    'featured.description': 'Services professionnels de domaine et d\'hébergement conçus pour les entreprises de toutes tailles.',
    'featured.features.domain': 'Enregistrement de Domaine',
    'featured.features.email': 'Email Professionnel',
    'featured.features.hosting': 'Hébergement Web',
    'featured.keyFeatures': 'Caractéristiques Clés',
    'featured.feature1.title': 'Enregistrement de Domaine',
    'featured.feature1.desc': 'Sécurisez votre nom de domaine parfait',
    'featured.feature2.title': 'Email Professionnel',
    'featured.feature2.desc': 'Solutions d\'hébergement d\'email professionnel',
    'featured.feature3.title': 'Hébergement Sécurisé',
    'featured.feature3.desc': 'Hébergement web fiable et protégé',
    'featured.feature4.title': 'Support Expert',
    'featured.feature4.desc': 'Assistance client basée au Royaume-Uni',
    'featured.cta': 'Visiter JA Domain Hub',
    'featured.viewall': 'Voir Tous les Services Recommandés',
    
    // About Us - Body Content
    'about.whoWeAre.title': 'Qui Nous Sommes',
    'about.whoWeAre.p1': 'JA Group Services Ltd est une société d\'exploitation enregistrée au Royaume-Uni qui fournit une gouvernance professionnelle, une infrastructure opérationnelle et des cadres de conformité pour les divisions commerciales.',
    'about.whoWeAre.p2': 'Nous opérons en mettant l\'accent sur la responsabilité, la supervision structurée et la durabilité à long terme. Notre approche privilégie la croissance disciplinée plutôt que l\'expansion rapide, garantissant que chaque division fonctionne dans un cadre de gouvernance robuste.',
    'about.ourPurpose.title': 'Notre Objectif',
    'about.ourPurpose.p1': 'Nous existons pour fournir l\'épine dorsale opérationnelle qui permet aux divisions commerciales de se concentrer sur leurs services principaux tout en bénéficiant d\'une gouvernance partagée, d\'une infrastructure de conformité et de normes professionnelles.',
    'about.ourPurpose.p2': 'Notre modèle sépare la supervision opérationnelle des activités quotidiennes des divisions, créant des structures de responsabilité claires et des pratiques commerciales durables.',
    'about.coreValues.title': 'Valeurs Fondamentales',
    'about.coreValues.subtitle': 'Les principes qui guident nos opérations et notre prise de décision.',
    'about.governance.title': 'Gouvernance et Responsabilité',
    'about.governance.desc': 'Nous maintenons des cadres de supervision structurés, des lignes de rapport claires et des mesures de responsabilité transparentes dans toutes les divisions et opérations.',
    'about.growth.title': 'Croissance Disciplinée',
    'about.growth.desc': 'La croissance est mesurée et délibérée. Nous privilégions la préparation opérationnelle et la durabilité plutôt que l\'expansion rapide, garantissant que chaque division dispose de l\'infrastructure dont elle a besoin.',
    'about.professional.title': 'Normes Professionnelles',
    'about.professional.desc': 'Nous maintenons des normes élevées de professionnalisme, de conformité et de conduite éthique dans toutes les activités commerciales et partenariats.',
    'about.partnerships.title': 'Partenariats Collaboratifs',
    'about.partnerships.desc': 'Nous construisons des relations à long terme avec des partenaires qui partagent notre engagement envers la qualité, la transparence et la prestation de services professionnels.',
    
    // Group Structure - Body Content
    'structure.overview.title': 'Aperçu de la Structure d\'Entreprise',
    'structure.overview.p1': 'JA Group Services Ltd fonctionne comme une filiale entièrement détenue de JSDS Group Ltd, créant une relation claire entre société mère et filiale qui offre à la fois indépendance opérationnelle et supervision stratégique.',
    'structure.overview.p2': 'Cette structure permet une gestion opérationnelle ciblée tout en maintenant les avantages de gouvernance, de conformité et de direction stratégique d\'une relation avec la société mère.',
    'structure.jsds.title': 'JSDS Group Ltd',
    'structure.jsds.role': 'Société Mère',
    'structure.jsds.desc': 'JSDS Group Ltd sert de société mère, fournissant une supervision stratégique, des cadres de gouvernance et une direction à long terme. La société mère garantit le maintien des normes de conformité et soutient la croissance durable dans toute la structure du groupe.',
    'structure.ja.title': 'JA Group Services Ltd',
    'structure.ja.role': 'Filiale Opérationnelle',
    'structure.ja.desc': 'JA Group Services Ltd fonctionne comme filiale active, gérant les opérations quotidiennes, les cadres de division et la prestation de services. En tant que société d\'exploitation, elle maintient son indépendance opérationnelle tout en bénéficiant de la supervision et du soutien de la société mère.',
    'structure.relationship.title': 'La Relation Société Mère-Filiale',
    'structure.relationship.p1': 'Cette structure crée une séparation claire entre gouvernance stratégique (société mère) et gestion opérationnelle (filiale), permettant une exécution ciblée tout en maintenant responsabilité et supervision.',
    'structure.relationship.p2': 'La relation garantit que les décisions opérationnelles peuvent être prises efficacement tandis que la direction stratégique, les cadres de conformité et les normes de gouvernance restent cohérents et gérés professionnellement.',
    'structure.why.title': 'Pourquoi Cette Structure?',
    'structure.why.subtitle': 'Les avantages de notre organisation d\'entreprise',
    'structure.why.governance.title': 'Gouvernance Claire',
    'structure.why.governance.desc': 'La séparation de la supervision stratégique et de la gestion opérationnelle crée des cadres clairs de responsabilité et de prise de décision.',
    'structure.why.clarity.title': 'Clarté Opérationnelle',
    'structure.why.clarity.desc': 'Des rôles et responsabilités définis permettent des opérations efficaces tout en maintenant des normes professionnelles et la conformité.',
    'structure.why.sustainability.title': 'Durabilité à Long Terme',
    'structure.why.sustainability.desc': 'La supervision de la société mère garantit des stratégies de croissance durable et une gouvernance cohérente dans toutes les opérations.',
    'structure.why.compliance.title': 'Conformité et Normes',
    'structure.why.compliance.desc': 'Des cadres structurés garantissent que toutes les opérations respectent les exigences réglementaires et maintiennent des normes professionnelles.',
    'structure.learn.title': 'En Savoir Plus',
    'structure.learn.about': 'À Propos de JA Group Services',
    'structure.learn.divisions': 'Nos Divisions',
    'structure.learn.corporate': 'Entreprise et Partenariats',
    
    // Corporate Page - Body Content
    'corporate.partnership.badge': 'OPPORTUNITÉS DE PARTENARIAT',
    'corporate.partnership.title': 'Devenez Partenaire',
    'corporate.partnership.subtitle': 'Nous sommes toujours intéressés à collaborer avec des prestataires de services et des entreprises qui partagent notre engagement envers la qualité et le professionnalisme',
    'corporate.collab.title': 'Partenariats Collaboratifs',
    'corporate.collab.p1': 'Nous croyons en la construction de partenariats solides et mutuellement bénéfiques avec des prestataires de services, des partenaires technologiques et des entreprises qui peuvent améliorer nos offres de services aux clients britanniques.',
    'corporate.collab.p2': 'Que vous offriez des services complémentaires, des solutions innovantes ou que vous ayez une expertise qui s\'aligne avec notre mission, nous serions ravis d\'explorer des opportunités de partenariat.',
    'corporate.areas.title': 'Domaines de Partenariat',
    'corporate.areas.service.title': 'Prestataires de Services',
    'corporate.areas.service.desc': 'Services numériques, hébergement, développement, marketing',
    'corporate.areas.tech.title': 'Partenaires Technologiques',
    'corporate.areas.tech.desc': 'Solutions logicielles, plateformes, intégrations',
    'corporate.areas.reseller.title': 'Opportunités de Revente',
    'corporate.areas.reseller.desc': 'Services en marque blanche, programmes d\'affiliation',
    'corporate.areas.strategic.title': 'Alliances Stratégiques',
    'corporate.areas.strategic.desc': 'Coentreprises, co-marketing, partenariats de référence',
    'corporate.why.title': 'Pourquoi Devenir Partenaire',
    'corporate.why.uk.title': 'Opérations au Royaume-Uni',
    'corporate.why.uk.desc': 'Entreprise professionnelle britannique avec des cadres de gouvernance et de conformité établis',
    'corporate.why.professional.title': 'Normes Professionnelles',
    'corporate.why.professional.desc': 'Engagement envers la qualité, la transparence et les pratiques commerciales éthiques',
    'corporate.why.support.title': 'Support Dédié',
    'corporate.why.support.desc': 'Approche collaborative avec communication claire et gestion de partenariat fiable',
    'corporate.why.growth.title': 'Opportunités de Croissance',
    'corporate.why.growth.desc': 'Accès à notre base de clients et potentiel de développement commercial à long terme',
    'corporate.info.badge': 'INFORMATIONS SUR L\'ENTREPRISE',
    'corporate.info.title': 'Détails de l\'Entreprise',
    'corporate.info.name.label': 'Nom Enregistré',
    'corporate.info.name.value': 'JA Group Services Ltd',
    'corporate.info.number.label': 'Numéro d\'Entreprise',
    'corporate.info.number.value': '16024881',
    'corporate.info.registered.label': 'Bureau Enregistré',
    'corporate.info.registered.value': '124 City Road, Londres, Angleterre, EC1V 2NX',
    'corporate.info.vat.label': 'Numéro de TVA',
    'corporate.info.vat.value': 'Non Enregistré pour la TVA',
    'corporate.info.ico.label': 'Enregistrement ICO',
    'corporate.info.ico.value': 'ZB877370',
    'corporate.governance.badge': 'GOUVERNANCE',
    'corporate.governance.title': 'Gouvernance d\'Entreprise',
    'corporate.governance.subtitle': 'Notre engagement envers les normes professionnelles et la responsabilité',
    'corporate.governance.framework.title': 'Cadre de Gouvernance',
    'corporate.governance.framework.desc': 'Des processus de supervision et de prise de décision structurés garantissent la responsabilité dans toutes les opérations et divisions.',
    'corporate.governance.compliance.title': 'Conformité Réglementaire',
    'corporate.governance.compliance.desc': 'Conformité totale avec le droit des sociétés britannique, les réglementations sur la protection des données et les normes de l\'industrie.',
    'corporate.governance.accountability.title': 'Responsabilité Claire',
    'corporate.governance.accountability.desc': 'Des rôles, responsabilités et structures de rapport définis maintiennent la transparence et les normes professionnelles.',
    'corporate.governance.transparency.title': 'Transparence Opérationnelle',
    'corporate.governance.transparency.desc': 'Communication ouverte avec les parties prenantes, les partenaires et les clients sur nos opérations et pratiques.',
    'corporate.contact.title': 'Contactez-Nous',
    'corporate.contact.subtitle': 'Intéressé par des opportunités de partenariat ou avez des questions sur notre entreprise?',
    'corporate.contact.button': 'Nous Contacter',
    
    // Divisions Page - Body Content
    'divisions.framework.title': 'Cadre Opérationnel',
    'divisions.framework.subtitle': 'Notre structure de divisions permet la prestation de services spécialisés tout en maintenant une gouvernance, une conformité et des normes professionnelles cohérentes dans toutes les opérations.',
    'divisions.framework.governance.title': 'Gouvernance et Responsabilité',
    'divisions.framework.governance.desc': 'Chaque division opère sous le cadre de gouvernance de JA Group Services Ltd, garantissant responsabilité et normes professionnelles.',
    'divisions.framework.infrastructure.title': 'Infrastructure Professionnelle',
    'divisions.framework.infrastructure.desc': 'Les divisions bénéficient d\'une infrastructure opérationnelle partagée, de cadres de conformité et de systèmes de support professionnel.',
    'divisions.framework.standards.title': 'Normes Cohérentes',
    'divisions.framework.standards.desc': 'Toutes les divisions maintiennent une qualité, une conformité et des normes de service cohérentes alignées avec nos valeurs d\'entreprise.',
    'divisions.current.title': 'Divisions Actuelles',
    'divisions.current.subtitle': 'Nos divisions actives fournissant des services spécialisés.',
    'divisions.jadomainhub.role': 'Division des Services de Domaine',
    'divisions.jadomainhub.desc': 'JA DOMAIN HUB est notre division de services de domaine, fournissant enregistrement professionnel de domaines, gestion et services connexes aux entreprises et organisations.',
    'divisions.jadomainhub.services.title': 'Services',
    'divisions.jadomainhub.services.item1': 'Services d\'enregistrement et de renouvellement de domaines',
    'divisions.jadomainhub.services.item2': 'Gestion de portefeuille de domaines',
    'divisions.jadomainhub.services.item3': 'Gestion et configuration DNS',
    'divisions.jadomainhub.services.item4': 'Support de transfert et migration de domaines',
    'divisions.jadomainhub.partnerships.title': 'Partenariats Stratégiques',
    'divisions.jadomainhub.partnerships.desc': 'JA DOMAIN HUB opère à travers des partenariats stratégiques avec des registres de domaines leaders et des fournisseurs de services, nous permettant d\'offrir des services de domaine complets avec fiabilité et support de niveau entreprise.',
    'divisions.jadomainhub.button.portal': 'Accéder au Portail de la Division',
    'divisions.jadomainhub.button.visit': 'Visiter JA DOMAIN HUB',
    'divisions.jadomainhub.button.contact': 'Contacter la Division',
    'divisions.future.title': 'Croissance Future',
    'divisions.future.subtitle': 'Notre cadre de divisions permet une expansion disciplinée dans de nouveaux domaines de service.',
    'divisions.future.p1': 'La structure de divisions de JA Group Services Ltd est conçue pour soutenir une croissance contrôlée. De nouvelles divisions peuvent être établies lorsque les opportunités s\'alignent avec nos normes de gouvernance, capacités opérationnelles et objectifs stratégiques.',
    'divisions.future.p2': 'Chaque division potentielle fait l\'objet d\'une évaluation rigoureuse pour garantir qu\'elle peut maintenir nos normes de responsabilité, conformité et prestation de service professionnel avant l\'intégration dans notre cadre opérationnel.',
    
    // Recommended Services Page - Body Content
    'recommended.title': 'Services Recommandés',
    'recommended.hero.badge': 'Services de Confiance',
    'recommended.hero.subtitle': 'Fournisseurs de services soigneusement sélectionnés qui répondent à nos normes de qualité, fiabilité et prestation de service professionnel.',
    'recommended.tabs.business': 'Services aux Entreprises',
    'recommended.tabs.activities': 'Activités et Visites',
    'recommended.business.badge': 'Services Professionnels',
    'recommended.business.title': 'Solutions d\'Entreprise',
    'recommended.business.subtitle': 'Fournisseurs de confiance pour la création d\'entreprise, la conformité et les services professionnels aux entreprises',
    'recommended.business.section1': 'Création d\'Entreprise et Services aux Entreprises',
    
    // Header Navigation
    'header.divisions': 'Nos Divisions',
    'header.divisions.about': 'À Propos de Nos Divisions',
    'header.contact': 'Nous Contacter',
    'header.company': 'Entreprise',
    'header.company.about': 'À Propos de Nous',
    'header.company.structure': 'Notre Structure de Groupe',
    'header.company.corporate': 'Entreprise',
    
    // Footer
    'footer.company': 'Entreprise',
    'footer.company.about': 'À Propos de Nous',
    'footer.company.contact': 'Nous Contacter',
    'footer.company.team': 'Rencontrez l\'Équipe',
    'footer.company.parent': 'Société Mère',
    'footer.legal': 'Légal et Ressources',
    'footer.legal.terms': 'Conditions',
    'footer.legal.privacy': 'Politique de Confidentialité',
    'footer.legal.cookies': 'Politique des Cookies',
  },
  
  cy: {
    // Navigation
    'nav.home': 'Hafan',
    'nav.about': 'Amdanom Ni',
    'nav.divisions': 'Ein Hadrannau',
    'nav.structure': 'Strwythur y Grŵp',
    'nav.services': 'Gwasanaethau',
    'nav.activities': 'Gweithgareddau a Theithiau',
    'nav.contact': 'Cysylltwch â Ni',
    'nav.corporate': 'Corfforaethol',
    
    // Homepage Hero
    'hero.badge': 'Grŵp Busnes yn y DU',
    'hero.title': 'JA Group Services Ltd',
    'hero.subtitle': 'Enw sy\'n tyfu mewn atebion busnes. Adrannau arbenigol wedi\'u hadeiladu i\'ch cefnogi a thyfu gyda chi.',
    'hero.cta.divisions': 'Archwilio Ein Hadrannau',
    'hero.cta.contact': 'Cysylltwch â Ni',
    
    // Stats Cards
    'stats.ukbased.label': 'Wedi\'i Leoli yn y DU',
    'stats.ukbased.value': 'Llundain',
    'stats.trusted.label': 'Ansawdd',
    'stats.trusted.value': 'Gwasanaethau',
    'stats.customer.label': 'Canolbwyntio ar',
    'stats.customer.value': 'Gwsmeriaid',
    'stats.professional.label': 'Sawl',
    'stats.professional.value': 'Adran',
    
    // Why Choose Us
    'why.badge': 'Pam Dewis Ni',
    'why.title': 'Wedi\'i Adeiladu ar gyfer Rhagoriaeth',
    'why.subtitle': 'Arbenigedd proffesiynol gyda chefnogaeth yn y DU ac ymrwymiad i ansawdd',
    'why.ukbased.title': 'Rhagoriaeth y DU',
    'why.ukbased.desc': 'Yn falch o fod wedi\'i leoli yn Llundain, yn darparu arbenigedd lleol a chefnogaeth ymroddedig.',
    'why.customer.title': 'Canolbwyntio ar Gwsmeriaid',
    'why.customer.desc': 'Deall a diwallu eich anghenion gyda datrysiadau wedi\'u teilwra.',
    'why.trusted.title': 'Gwasanaeth o Ansawdd',
    'why.trusted.desc': 'Cydweithio â darparwyr blaenllaw i ddarparu datrysiadau o ansawdd.',
    'why.professional.title': 'Safonau Proffesiynol',
    'why.professional.desc': 'Ymrwymedig i ragoriaeth, tryloywder a boddhad cwsmeriaid.',
    
    // Contact CTA
    'contact.title': 'Yn Barod i Ddechrau?',
    'contact.subtitle': 'Oes gennych gwestiynau am JA Group Services neu ein hadrannau? Rydym yma i helpu.',
    'contact.phone': '020 3834 2790',
    'contact.email': 'hello@jagroupservices.co.uk',
    'contact.cta.primary': 'Cysylltwch â Ni Heddiw',
    'contact.cta.secondary': 'Dysgu Mwy Amdanom',
    
    // Contact Page
    'contactPage.title': 'Cysylltwch â Ni',
    'contactPage.subtitle': 'Cysylltwch â\'n tîm',
    'contactPage.badge': 'CYSYLLTWCH Â NI',
    'contactPage.form.name': 'Eich Enw',
    'contactPage.form.email': 'Cyfeiriad Ebost',
    'contactPage.form.subject': 'Pwnc',
    'contactPage.form.message': 'Eich Neges',
    'contactPage.form.submit': 'Anfon Neges',
    'contactPage.info.title': 'Gwybodaeth Gyswllt',
    'contactPage.info.phone': 'Ffôn',
    'contactPage.info.email': 'Ebost',
    'contactPage.info.address': 'Cyfeiriad',
    
    // About Us Page
    'aboutPage.title': 'Amdanom Ni',
    'aboutPage.subtitle': 'Dysgwch fwy am JA Group Services',
    'aboutPage.badge': 'PWY YDYM NI',
    'aboutPage.mission.title': 'Ein Cenhadaeth',
    'aboutPage.mission.desc': 'Darparu rhagoriaeth trwy ein hadrannau arbenigol',
    'aboutPage.vision.title': 'Ein Gweledigaeth',
    'aboutPage.vision.desc': 'Bod yn bartner dibynadwy i fusnesau ledled y DU',
    'aboutPage.values.title': 'Ein Gwerthoedd',
    'aboutPage.values.desc': 'Uniondeb, Rhagoriaeth a Ffocws ar Gwsmeriaid',
    
    // Corporate Page
    'corporatePage.title': 'Gwybodaeth Gorfforaethol',
    'corporatePage.subtitle': 'Dysgwch am ein strwythur cwmni a llywodraethu',
    'corporatePage.badge': 'CORFFORAETHOL',
    'corporatePage.company.title': 'Manylion y Cwmni',
    'corporatePage.company.desc': 'Mae JA Group Services Ltd wedi\'i gofrestru yng Nghymru a Lloegr',
    'corporatePage.governance.title': 'Llywodraethu',
    'corporatePage.governance.desc': 'Ymrwymedig i dryloywder ac arferion gorau',
    
    // Divisions Page
    'divisionsPage.title': 'Ein Hadrannau',
    'divisionsPage.subtitle': 'Gwasanaethau arbenigol ar draws sawl sector',
    'divisionsPage.badge': 'EIN HADRANNAU',
    'divisionsPage.intro': 'Archwilio ein hamrywiaeth o adrannau arbenigol',
    'divisionsPage.cta': 'Dysgu Mwy',
    
    // Structure Page
    'structurePage.title': 'Ein Strwythur Grŵp',
    'structurePage.subtitle': 'Deall ein sefydliad corfforaethol',
    'structurePage.badge': 'STRWYTHUR Y GRŴP',
    
    // Services Page
    'servicesPage.title': 'Gwasanaethau a Argymhellir',
    'servicesPage.subtitle': 'Partneriaid a darparwyr gwasanaeth dibynadwy',
    'servicesPage.badge': 'GWASANAETHAU A ARGYMHELLIR',
    
    // Activities Page
    'activitiesPage.title': 'Dod o Hyd i Weithgareddau a Theithiau',
    'activitiesPage.subtitle': 'Darganfod profiadau ledled y byd',
    'activitiesPage.badge': 'GWEITHGAREDDAU A THEITHIAU',
    'activitiesPage.search': 'Chwilio gweithgareddau...',
    'activitiesPage.viewAll': 'Gweld Pob Gweithgaredd',
    
    // Announcements Page
    'announcementsPage.title': 'Cyhoeddiadau',
    'announcementsPage.subtitle': 'Diweddariadau diweddaraf gan JA Group Services',
    'announcementsPage.badge': 'CYHOEDDIADAU',
    
    // Sitemap Page
    'sitemapPage.title': 'Map Safle',
    'sitemapPage.subtitle': 'Llywio ein gwefan',
    'sitemapPage.badge': 'MAP SAFLE',
    
    // Homepage - Featured Division Content
    'featured.badge': 'Ein Hadran Nodedig',
    'featured.sectionTitle': 'Cyflwyno JA Domain Hub',
    'featured.description': 'Gwasanaethau parth a chynnal proffesiynol wedi\'u cynllunio ar gyfer busnesau o bob maint.',
    'featured.features.domain': 'Cofrestru Parth',
    'featured.features.email': 'E-bost Proffesiynol',
    'featured.features.hosting': 'Cynnal Gwe',
    'featured.keyFeatures': 'Nodweddion Allweddol',
    'featured.feature1.title': 'Cofrestru Parth',
    'featured.feature1.desc': 'Sicrhewch eich enw parth perffaith',
    'featured.feature2.title': 'E-bost Proffesiynol',
    'featured.feature2.desc': 'Atebion cynnal e-bost busnes',
    'featured.feature3.title': 'Cynnal Diogel',
    'featured.feature3.desc': 'Cynnal gwe dibynadwy a diogeledig',
    'featured.feature4.title': 'Cymorth Arbenigol',
    'featured.feature4.desc': 'Cymorth cwsmeriaid wedi\'i leoli yn y DU',
    'featured.cta': 'Ymweld â JA Domain Hub',
    'featured.viewall': 'Gweld Pob Gwasanaeth a Argymhellir',
    
    // About Us - Body Content
    'about.whoWeAre.title': 'Pwy Ydym Ni',
    'about.whoWeAre.p1': 'Mae JA Group Services Ltd yn gwmni gweithredu cofrestredig yn y DU sy\'n darparu llywodraethu proffesiynol, seilwaith gweithredol a fframweithiau cydymffurfio ar gyfer adrannau busnes.',
    'about.whoWeAre.p2': 'Rydym yn gweithredu gyda ffocws ar atebolrwydd, goruchwyliaeth strwythuredig a chynaliadwyedd hirdymor. Mae ein dull yn blaenoriaethu twf disgybliedig dros ehangu cyflym, gan sicrhau bod pob adran yn gweithredu o fewn fframwaith llywodraethu cadarn.',
    'about.ourPurpose.title': 'Ein Pwrpas',
    'about.ourPurpose.p1': 'Rydym yn bodoli i ddarparu\'r asgwrn cefn gweithredol sy\'n galluogi adrannau busnes i ganolbwyntio ar eu gwasanaethau craidd tra\'n elwa o lywodraethu a rennir, seilwaith cydymffurfio a safonau proffesiynol.',
    'about.ourPurpose.p2': 'Mae ein model yn gwahanu goruchwyliaeth weithredol o weithgareddau dyddiol adrannau, gan greu strwythurau atebolrwydd clir ac arferion busnes cynaliadwy.',
    'about.coreValues.title': 'Gwerthoedd Craidd',
    'about.coreValues.subtitle': 'Yr egwyddorion sy\'n arwain ein gweithrediadau a\'n penderfyniadau.',
    'about.governance.title': 'Llywodraethu ac Atebolrwydd',
    'about.governance.desc': 'Rydym yn cynnal fframweithiau goruchwylio strwythuredig, llinellau adrodd clir a mesurau atebolrwydd tryloyw ar draws pob adran a gweithrediad.',
    'about.growth.title': 'Twf Disgybliedig',
    'about.growth.desc': 'Mae twf yn fesuredig ac yn fwriadol. Rydym yn blaenoriaethu parodrwydd gweithredol a chynaliadwyedd dros ehangu cyflym, gan sicrhau bod gan bob adran y seilwaith sydd ei angen arni.',
    'about.professional.title': 'Safonau Proffesiynol',
    'about.professional.desc': 'Rydym yn cynnal safonau uchel o broffesiynoldeb, cydymffurfio ac ymddygiad moesegol ar draws pob gweithgaredd busnes a phartneriaeth.',
    'about.partnerships.title': 'Partneriaethau Cydweithredol',
    'about.partnerships.desc': 'Rydym yn adeiladu perthnasoedd hirdymor gyda phartneriaid sy\'n rhannu ein hymrwymiad i ansawdd, tryloywder a darparu gwasanaethau proffesiynol.',
    
    // Group Structure - Body Content
    'structure.overview.title': 'Trosolwg o Strwythur Corfforaethol',
    'structure.overview.p1': 'Mae JA Group Services Ltd yn gweithredu fel is-gwmni sy\'n eiddo llwyr i JSDS Group Ltd, gan greu perthynas glir rhwng cwmni rhiant ac is-gwmni sy\'n darparu annibyniaeth weithredol a goruchwyliaeth strategol.',
    'structure.overview.p2': 'Mae\'r strwythur hwn yn galluogi rheolaeth weithredol ffocws tra\'n cynnal manteision llywodraethu, cydymffurfio a chyfeiriad strategol perthynas cwmni rhiant.',
    'structure.jsds.title': 'JSDS Group Ltd',
    'structure.jsds.role': 'Cwmni Rhiant',
    'structure.jsds.desc': 'Mae JSDS Group Ltd yn gwasanaethu fel cwmni rhiant, gan ddarparu goruchwyliaeth strategol, fframweithiau llywodraethu a chyfeiriad hirdymor. Mae\'r cwmni rhiant yn sicrhau bod safonau cydymffurfio yn cael eu cynnal ac yn cefnogi twf cynaliadwy ar draws strwythur y grŵp.',
    'structure.ja.title': 'JA Group Services Ltd',
    'structure.ja.role': 'Is-gwmni Gweithredol',
    'structure.ja.desc': 'Mae JA Group Services Ltd yn gweithredu fel is-gwmni gweithredol, yn rheoli gweithrediadau dyddiol, fframweithiau adran a darparu gwasanaethau. Fel cwmni gweithredu, mae\'n cynnal annibyniaeth weithredol tra\'n elwa o oruchwyliaeth a chefnogaeth y cwmni rhiant.',
    'structure.relationship.title': 'Y Berthynas Cwmni Rhiant-Is-gwmni',
    'structure.relationship.p1': 'Mae\'r strwythur hwn yn creu gwahaniaeth clir rhwng llywodraethu strategol (cwmni rhiant) a rheolaeth weithredol (is-gwmni), gan alluogi gweithrediad ffocws tra\'n cynnal atebolrwydd a goruchwyliaeth.',
    'structure.relationship.p2': 'Mae\'r berthynas yn sicrhau y gellir gwneud penderfyniadau gweithredol yn effeithlon tra bod cyfeiriad strategol, fframweithiau cydymffurfio a safonau llywodraethu yn parhau\'n gyson ac yn cael eu rheoli\'n broffesiynol.',
    'structure.why.title': 'Pam y Strwythur Hwn?',
    'structure.why.subtitle': 'Manteision ein trefniadaeth gorfforaethol',
    'structure.why.governance.title': 'Llywodraethu Clir',
    'structure.why.governance.desc': 'Mae gwahanu goruchwyliaeth strategol a rheolaeth weithredol yn creu fframweithiau clir o atebolrwydd a gwneud penderfyniadau.',
    'structure.why.clarity.title': 'Eglurder Gweithredol',
    'structure.why.clarity.desc': 'Mae rolau a chyfrifoldebau diffiniedig yn galluogi gweithrediadau effeithlon tra\'n cynnal safonau proffesiynol a chydymffurfio.',
    'structure.why.sustainability.title': 'Cynaliadwyedd Hirdymor',
    'structure.why.sustainability.desc': 'Mae goruchwyliaeth y cwmni rhiant yn sicrhau strategaethau twf cynaliadwy a llywodraethu cyson ar draws pob gweithrediad.',
    'structure.why.compliance.title': 'Cydymffurfio a Safonau',
    'structure.why.compliance.desc': 'Mae fframweithiau strwythuredig yn sicrhau bod pob gweithrediad yn bodloni gofynion rheoleiddiol ac yn cynnal safonau proffesiynol.',
    'structure.learn.title': 'Dysgu Mwy',
    'structure.learn.about': 'Ynghylch JA Group Services',
    'structure.learn.divisions': 'Ein Hadrannau',
    'structure.learn.corporate': 'Corfforaethol a Phartneriaethau',
    
    // Corporate Page - Body Content
    'corporate.partnership.badge': 'CYFLEOEDD PARTNERIAETH',
    'corporate.partnership.title': 'Partnerwch Gyda Ni',
    'corporate.partnership.subtitle': 'Rydym bob amser yn ddiddordeb mewn cydweithio â darparwyr gwasanaethau a busnesau sy\'n rhannu ein hymrwymiad i ansawdd a phroffesiynoldeb',
    'corporate.collab.title': 'Partneriaethau Cydweithredol',
    'corporate.collab.p1': 'Rydym yn credu mewn adeiladu partneriaethau cryf a buddiol i\'r ddwy ochr gyda darparwyr gwasanaethau, partneriaid technolegol a busnesau a all wella ein cynigion gwasanaethau i gwsmeriaid y DU.',
    'corporate.collab.p2': 'P\'un a ydych yn cynnig gwasanaethau cyflenwol, atebion arloesol, neu fod gennych arbenigedd sy\'n cyd-fynd â\'n cenhadaeth, byddem wrth ein bodd yn archwilio cyfleoedd partneriaeth.',
    'corporate.areas.title': 'Meysydd Partneriaeth',
    'corporate.areas.service.title': 'Darparwyr Gwasanaethau',
    'corporate.areas.service.desc': 'Gwasanaethau digidol, cynnal, datblygu, marchnata',
    'corporate.areas.tech.title': 'Partneriaid Technolegol',
    'corporate.areas.tech.desc': 'Atebion meddalwedd, llwyfannau, integreiddiadau',
    'corporate.areas.reseller.title': 'Cyfleoedd Ailwerthu',
    'corporate.areas.reseller.desc': 'Gwasanaethau label gwyn, rhaglenni cyswllt',
    'corporate.areas.strategic.title': 'Cynghreiriau Strategol',
    'corporate.areas.strategic.desc': 'Mentrau ar y cyd, cyd-farchnata, partneriaethau atgyfeirio',
    'corporate.why.title': 'Pam Partneru Gyda Ni',
    'corporate.why.uk.title': 'Gweithrediadau yn y DU',
    'corporate.why.uk.desc': 'Cwmni proffesiynol y DU gyda fframweithiau llywodraethu a chydymffurfio sefydledig',
    'corporate.why.professional.title': 'Safonau Proffesiynol',
    'corporate.why.professional.desc': 'Ymrwymiad i ansawdd, tryloywder ac arferion busnes moesegol',
    'corporate.why.support.title': 'Cymorth Ymroddedig',
    'corporate.why.support.desc': 'Dull cydweithredol gyda chyfathrebu clir a rheolaeth partneriaeth ddibynadwy',
    'corporate.why.growth.title': 'Cyfleoedd Twf',
    'corporate.why.growth.desc': 'Mynediad i\'n sylfaen cwsmeriaid a photensial ar gyfer datblygiad busnes hirdymor',
    'corporate.info.badge': 'GWYBODAETH Y CWMNI',
    'corporate.info.title': 'Manylion y Cwmni',
    'corporate.info.name.label': 'Enw Cofrestredig',
    'corporate.info.name.value': 'JA Group Services Ltd',
    'corporate.info.number.label': 'Rhif y Cwmni',
    'corporate.info.number.value': '16024881',
    'corporate.info.registered.label': 'Swyddfa Gofrestredig',
    'corporate.info.registered.value': '124 City Road, Llundain, Lloegr, EC1V 2NX',
    'corporate.info.vat.label': 'Rhif TAW',
    'corporate.info.vat.value': 'Heb ei Gofrestru ar gyfer TAW',
    'corporate.info.ico.label': 'Cofrestriad ICO',
    'corporate.info.ico.value': 'ZB877370',
    'corporate.governance.badge': 'LLYWODRAETHU',
    'corporate.governance.title': 'Llywodraethu Corfforaethol',
    'corporate.governance.subtitle': 'Ein hymrwymiad i safonau proffesiynol ac atebolrwydd',
    'corporate.governance.framework.title': 'Fframwaith Llywodraethu',
    'corporate.governance.framework.desc': 'Mae prosesau goruchwylio a gwneud penderfyniadau strwythuredig yn sicrhau atebolrwydd ar draws pob gweithrediad ac adran.',
    'corporate.governance.compliance.title': 'Cydymffurfio Rheoleiddiol',
    'corporate.governance.compliance.desc': 'Cydymffurfio llawn â chyfraith cwmnïau\'r DU, rheoliadau diogelu data a safonau\'r diwydiant.',
    'corporate.governance.accountability.title': 'Atebolrwydd Clir',
    'corporate.governance.accountability.desc': 'Mae rolau, cyfrifoldebau a strwythurau adrodd diffiniedig yn cynnal tryloywder a safonau proffesiynol.',
    'corporate.governance.transparency.title': 'Tryloywder Gweithredol',
    'corporate.governance.transparency.desc': 'Cyfathrebu agored gyda rhanddeiliaid, partneriaid a chwsmeriaid am ein gweithrediadau ac arferion.',
    'corporate.contact.title': 'Cysylltwch',
    'corporate.contact.subtitle': 'Diddordeb mewn cyfleoedd partneriaeth neu gwestiynau am ein cwmni?',
    'corporate.contact.button': 'Cysylltwch â Ni',
    
    // Divisions Page - Body Content
    'divisions.framework.title': 'Fframwaith Gweithredol',
    'divisions.framework.subtitle': 'Mae ein strwythur adrannau yn galluogi darparu gwasanaethau arbenigol tra\'n cynnal llywodraethu, cydymffurfio a safonau proffesiynol cyson ar draws pob gweithrediad.',
    'divisions.framework.governance.title': 'Llywodraethu ac Atebolrwydd',
    'divisions.framework.governance.desc': 'Mae pob adran yn gweithredu o dan fframwaith llywodraethu JA Group Services Ltd, gan sicrhau atebolrwydd a safonau proffesiynol.',
    'divisions.framework.infrastructure.title': 'Seilwaith Proffesiynol',
    'divisions.framework.infrastructure.desc': 'Mae adrannau yn elwa o seilwaith gweithredol a rennir, fframweithiau cydymffurfio a systemau cymorth proffesiynol.',
    'divisions.framework.standards.title': 'Safonau Cyson',
    'divisions.framework.standards.desc': 'Mae pob adran yn cynnal ansawdd, cydymffurfio a safonau gwasanaeth cyson sy\'n cyd-fynd â\'n gwerthoedd corfforaethol.',
    'divisions.current.title': 'Adrannau Cyfredol',
    'divisions.current.subtitle': 'Ein hadrannau gweithredol yn darparu gwasanaethau arbenigol.',
    'divisions.jadomainhub.role': 'Adran Gwasanaethau Parth',
    'divisions.jadomainhub.desc': 'JA DOMAIN HUB yw ein hadran gwasanaethau parth, yn darparu cofrestru parth proffesiynol, rheolaeth a gwasanaethau cysylltiedig i fusnesau a sefydliadau.',
    'divisions.jadomainhub.services.title': 'Gwasanaethau',
    'divisions.jadomainhub.services.item1': 'Gwasanaethau cofrestru ac adnewyddu parthau',
    'divisions.jadomainhub.services.item2': 'Rheoli portffolio parthau',
    'divisions.jadomainhub.services.item3': 'Rheoli a ffurfweddu DNS',
    'divisions.jadomainhub.services.item4': 'Cymorth trosglwyddo a mudo parthau',
    'divisions.jadomainhub.partnerships.title': 'Partneriaethau Strategol',
    'divisions.jadomainhub.partnerships.desc': 'Mae JA DOMAIN HUB yn gweithredu trwy bartneriaethau strategol gyda chofrestrfeydd parthau blaenllaw a darparwyr gwasanaethau, gan ein galluogi i gynnig gwasanaethau parth cynhwysfawr gyda dibynadwyedd a chymorth lefel menter.',
    'divisions.jadomainhub.button.portal': 'Mynediad i Borth yr Adran',
    'divisions.jadomainhub.button.visit': 'Ymweld â JA DOMAIN HUB',
    'divisions.jadomainhub.button.contact': 'Cysylltu â\'r Adran',
    'divisions.future.title': 'Twf yn y Dyfodol',
    'divisions.future.subtitle': 'Mae ein fframwaith adrannau yn galluogi ehangu disgybliedig i feysydd gwasanaeth newydd.',
    'divisions.future.p1': 'Mae strwythur adrannau JA Group Services Ltd wedi\'i gynllunio i gefnogi twf rheoledig. Gall adrannau newydd gael eu sefydlu pan fydd cyfleoedd yn cyd-fynd â\'n safonau llywodraethu, galluoedd gweithredol ac amcanion strategol.',
    'divisions.future.p2': 'Mae pob adran bosibl yn mynd trwy werthusiad trylwyr i sicrhau y gall gynnal ein safonau ar gyfer atebolrwydd, cydymffurfio a darparu gwasanaeth proffesiynol cyn integreiddio i\'n fframwaith gweithredol.',
    
    // Recommended Services Page - Body Content
    'recommended.title': 'Gwasanaethau a Argymhellir',
    'recommended.hero.badge': 'Gwasanaethau Dibynadwy',
    'recommended.hero.subtitle': 'Darparwyr gwasanaethau wedi\'u dewis yn ofalus sy\'n cwrdd â\'n safonau ar gyfer ansawdd, dibynadwyedd a darparu gwasanaeth proffesiynol.',
    'recommended.tabs.business': 'Gwasanaethau Busnes',
    'recommended.tabs.activities': 'Gweithgareddau a Theithiau',
    'recommended.business.badge': 'Gwasanaethau Proffesiynol',
    'recommended.business.title': 'Atebion Busnes',
    'recommended.business.subtitle': 'Darparwyr dibynadwy ar gyfer ffurfio cwmnïau, cydymffurfio a gwasanaethau busnes proffesiynol',
    'recommended.business.section1': 'Ffurfio Cwmnïau a Gwasanaethau Busnes',
    
    // Header Navigation
    'header.divisions': 'Ein Hadrannau',
    'header.divisions.about': 'Ynghylch Ein Hadrannau',
    'header.contact': 'Cysylltwch â Ni',
    'header.company': 'Cwmni',
    'header.company.about': 'Amdanom Ni',
    'header.company.structure': 'Ein Strwythur Grŵp',
    'header.company.corporate': 'Corfforaethol',
    
    // Footer
    'footer.company': 'Cwmni',
    'footer.company.about': 'Amdanom Ni',
    'footer.company.contact': 'Cysylltwch â Ni',
    'footer.company.team': 'Cwrdd â\'r Tîm',
    'footer.company.parent': 'Cwmni Rhiant',
    'footer.legal': 'Cyfreithiol ac Adnoddau',
    'footer.legal.terms': 'Telerau',
    'footer.legal.privacy': 'Polisi Preifatrwydd',
    'footer.legal.cookies': 'Polisi Cwcis',
  },
};

// Translation helper function
export function t(key: TranslationKey, language: SupportedLanguage = 'en'): string {
  return translations[language]?.[key] || translations.en[key] || key;
}
