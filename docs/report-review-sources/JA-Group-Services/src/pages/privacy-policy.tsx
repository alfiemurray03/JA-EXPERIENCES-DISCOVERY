import { motion } from 'motion/react';
import { useState } from 'react';
import { Shield, AlignLeft, ChevronDown, ChevronUp, Download, FileText } from 'lucide-react';
import PageWithTranslationNotice from '@/components/PageWithTranslationNotice';

type ViewMode = 'standard' | 'plain' | 'collapsible' | 'simple';

interface Section {
  number: string;
  title: string;
  content: string[];
}

// Helper function to convert URLs and emails to clickable links
function linkifyText(text: string) {
  // URL pattern
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  // Email pattern
  const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g;
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  
  // Find all URLs
  const urlMatches: Array<{ index: number; text: string; type: 'url' | 'email' }> = [];
  
  while ((match = urlPattern.exec(text)) !== null) {
    urlMatches.push({ index: match.index, text: match[0], type: 'url' });
  }
  
  // Find all emails
  while ((match = emailPattern.exec(text)) !== null) {
    urlMatches.push({ index: match.index, text: match[0], type: 'email' });
  }
  
  // Sort by index
  urlMatches.sort((a, b) => a.index - b.index);
  
  // Build parts array
  urlMatches.forEach((match, idx) => {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the link
    if (match.type === 'url') {
      parts.push(
        <a
          key={`link-${idx}`}
          href={match.text}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-medium break-all"
        >
          {match.text}
        </a>
      );
    } else {
      parts.push(
        <a
          key={`link-${idx}`}
          href={`mailto:${match.text}`}
          className="text-primary hover:underline font-medium"
        >
          {match.text}
        </a>
      );
    }
    
    lastIndex = match.index + match.text.length;
  });
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
}

const sections: Section[] = [
  {
    number: '1',
    title: 'Who We Are',
    content: [
      'JA GROUP SERVICES LTD',
      'Company Number: 16314179',
      '167–169 Great Portland Street',
      '5th Floor',
      'London',
      'W1W 5PF',
      'United Kingdom',
      '',
      'ICO Registration Number: ZB877370',
      'Email: dataprotection@jagroupservices.co.uk',
      '',
      'For the purposes of data protection law, JA Group Services Ltd acts as Data Controller for personal data collected directly through:',
      '• jagroupservices.co.uk',
      '• jadomainhub.co.uk',
      '• shop.jadomainhub.co.uk (see Section 9 regarding Storefront transactions)',
      '• Associated branded digital environments operated by or on behalf of JA Group Services Ltd',
      '',
      'We collect only personal data that is necessary for the purposes set out in this Policy.'
    ]
  },
  {
    number: '2',
    title: 'Information We Collect',
    content: [
      '2.1 Personal Information You Provide',
      '',
      'We may collect:',
      '• Name',
      '• Email address',
      '• Telephone number',
      '• Postal address',
      '• Company name and job title',
      '• Account login details (passwords are encrypted)',
      '• Information submitted via contact forms',
      '• Support correspondence and communications',
      '',
      '2.2 Payment Information (Direct Services Only)',
      '',
      'Where you purchase Direct Services directly from us:',
      '• Billing information',
      '• Transaction confirmation details',
      '• Limited payment reference data',
      '',
      'Payments may be processed via Square or other authorised payment providers.',
      '',
      'JA Group Services Ltd does not store full card numbers or full payment authentication data. Card details are processed securely by Square in accordance with their own privacy and security policies.',
      '',
      'Square acts as an independent data controller in relation to payment processing.',
      '',
      '2.3 Information Collected Automatically',
      '',
      'When you use our websites, we may collect:',
      '• IP address',
      '• Browser type and version',
      '• Device information',
      '• Operating system',
      '• Pages visited',
      '• Time and date of access',
      '• Navigation behaviour',
      '• Referral sources',
      '• Cookie and tracking information',
      '',
      'Please refer to our Cookie Policy for further details.'
    ]
  },
  {
    number: '3',
    title: 'How We Use Your Information',
    content: [
      'We use personal data to:',
      '',
      'Provide Services',
      'To deliver Direct Services, process payments, manage accounts and provide customer support.',
      '',
      'Communicate',
      'To respond to enquiries, send service updates and provide important notices.',
      '',
      'Legal Compliance',
      'To comply with legal obligations, enforce our Terms of Service, protect our rights and prevent fraud.',
      '',
      'Improve Our Services',
      'To analyse website usage and improve functionality and user experience (where consent is required).'
    ]
  },
  {
    number: '4',
    title: 'Legal Basis for Processing',
    content: [
      'Under UK GDPR, we rely on the following lawful bases:',
      '• Contractual Necessity – Where processing is required to provide services to you, including payment processing.',
      '• Legitimate Interests – To operate, protect and improve our business and prevent fraud.',
      '• Legal Obligation – To comply with applicable laws and financial regulations.',
      '• Consent – For marketing communications and certain cookies (where applicable).'
    ]
  },
  {
    number: '5',
    title: 'Marketing Communications',
    content: [
      'We may send marketing communications where:',
      '• You have requested information from us; or',
      '• You have provided consent.',
      '',
      'You may withdraw consent at any time using the unsubscribe option in communications or by contacting dataprotection@jagroupservices.co.uk.',
      '',
      'We do not sell personal data.'
    ]
  },
  {
    number: '6',
    title: 'Data Security',
    content: [
      'We implement appropriate technical and organisational measures to protect personal data.',
      '',
      'Encryption',
      'Data transmitted over the internet is encrypted using industry-standard TLS/SSL protocols.',
      '',
      'Access Controls',
      'Access to personal data is restricted to authorised personnel only.',
      '',
      'Secure Infrastructure',
      'Data is stored on secure systems with monitoring and backup processes.',
      '',
      'Incident Response',
      'We maintain procedures to detect, investigate and respond to data security incidents.',
      '',
      'No online system can be guaranteed completely secure.'
    ]
  },
  {
    number: '7',
    title: 'Data Retention',
    content: [
      'We retain personal data only for as long as necessary to:',
      '• Fulfil the purposes outlined in this Policy',
      '• Comply with legal, tax and accounting obligations',
      '• Protect legitimate business interests',
      '• Resolve disputes or enforce agreements',
      '',
      'Retention periods vary depending on the type of data and legal requirements.'
    ]
  },
  {
    number: '8',
    title: 'Sharing of Personal Data',
    content: [
      'We do not sell personal data.',
      '',
      'We may share personal data with:',
      '• Payment processors (e.g., Square)',
      '• Trusted service providers (hosting, IT support, analytics providers)',
      '• Professional advisers',
      '• Legal or regulatory authorities where required',
      '• In connection with mergers, acquisitions or business restructuring',
      '',
      'All service providers are contractually required to safeguard personal data.'
    ]
  },
  {
    number: '9',
    title: 'Storefront Transactions (Important)',
    content: [
      'When you use shop.jadomainhub.co.uk:',
      '• Authentication, checkout, billing, domain registration and account management systems are operated by a Third Party Provider (such as Wild West Domains, LLC).',
      '• The relevant Third Party Provider acts as an independent Data Controller for personal data processed within its systems.',
      '• JA Group Services Ltd does not determine the purposes or means of processing personal data collected within the Third Party Provider\'s systems.',
      '• JA Group Services Ltd does not receive or store full payment card details for Storefront transactions.',
      '',
      'Personal data collected during Storefront transactions is processed in accordance with the Third Party Provider\'s Privacy Policy:',
      '',
      'https://shop.jadomainhub.co.uk/legal-agreement?id=privacy',
      '',
      'You should review that policy before completing a transaction.',
      '',
      'JA Group Services Ltd is not responsible for the data handling practices of Third Party Providers.'
    ]
  },
  {
    number: '10',
    title: 'International Transfers',
    content: [
      'Where personal data is transferred outside the United Kingdom, appropriate safeguards are implemented, including:',
      '• Adequacy decisions',
      '• Standard contractual clauses',
      '• Other lawful transfer mechanisms'
    ]
  },
  {
    number: '11',
    title: 'Automated Decision-Making',
    content: [
      'We do not carry out automated decision-making or profiling that produces legal or similarly significant effects.'
    ]
  },
  {
    number: '12',
    title: 'Your Data Protection Rights',
    content: [
      'Under UK GDPR, you have the right to:',
      '• Access your personal data',
      '• Request rectification of inaccurate data',
      '• Request erasure (where applicable)',
      '• Restrict processing',
      '• Object to processing',
      '• Request data portability',
      '• Withdraw consent (where applicable)',
      '',
      'To exercise your rights, contact:',
      'dataprotection@jagroupservices.co.uk',
      '',
      'We will respond within the statutory timeframe.'
    ]
  },
  {
    number: '13',
    title: 'Right to Complain',
    content: [
      'You have the right to lodge a complaint with the Information Commissioner\'s Office (ICO) if you believe your personal data has been processed unlawfully.',
      '',
      'Information Commissioner\'s Office (ICO)',
      'Website: https://ico.org.uk',
      'Helpline: 0303 123 1113'
    ]
  },
  {
    number: '14',
    title: 'Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time. The latest version will always be published on our website with the updated date.'
    ]
  }
];

function CollapsibleSection({ section, index }: { section: Section; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border border-border rounded-lg overflow-hidden bg-card"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {section.number}
          </span>
          <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="px-6 pb-6 border-t border-border"
        >
          <div className="pt-4 space-y-3">
            {section.content.map((paragraph, idx) => (
              <p key={idx} className="text-muted-foreground leading-relaxed">
                {linkifyText(paragraph)}
              </p>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function PrivacyPolicy() {
  const [viewMode, setViewMode] = useState<ViewMode>('standard');

  const downloadAsPDF = () => {
    window.print();
  };

  return (
    <PageWithTranslationNotice>
      <title>Privacy Policy - JA Group Services</title>
      <meta
        name="description"
        content="Privacy Policy for JA Group Services Ltd. Learn how we collect, use, and protect your personal data in compliance with UK GDPR."
      />

      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
              >
                <Shield className="w-10 h-10 text-primary" />
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Privacy Policy
              </h1>
              
              <p className="text-xl text-muted-foreground mb-4">
                JA Group Services Ltd
              </p>
              
              <p className="text-sm text-muted-foreground">
                Last Updated: February 2026
              </p>
              
              <p className="text-base text-muted-foreground mt-6 max-w-2xl mx-auto">
                Your privacy matters to us. This Privacy Policy explains how JA Group Services Ltd collects, uses, stores and protects your personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
              </p>
            </motion.div>
          </div>
        </section>

        {/* View Mode Selector */}
        <section className="py-8 border-y border-border bg-card/50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <p className="text-sm text-muted-foreground text-center md:text-left">
                  Choose your preferred viewing format:
                </p>
                
                <button
                  onClick={downloadAsPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  title="Save as PDF (opens print dialog)"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => setViewMode('standard')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    viewMode === 'standard'
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Standard View
                </button>
                
                <button
                  onClick={() => setViewMode('plain')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    viewMode === 'plain'
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                  Plain Text
                </button>
                
                <button
                  onClick={() => setViewMode('collapsible')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    viewMode === 'collapsible'
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                  Collapsible Sections
                </button>
                
                <button
                  onClick={() => setViewMode('simple')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    viewMode === 'simple'
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Simple Text
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Standard View */}
              {viewMode === 'standard' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-12"
                >
                  {sections.map((section, index) => (
                    <motion.div
                      key={section.number}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-card border border-border rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {section.number}
                        </span>
                        <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                      </div>
                      
                      <div className="space-y-4">
                        {section.content.map((paragraph, idx) => (
                          <p key={idx} className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {linkifyText(paragraph)}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Plain Text View */}
              {viewMode === 'plain' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card border border-border rounded-lg p-8 shadow-sm"
                >
                  <div className="font-mono text-sm space-y-6">
                    {sections.map((section) => (
                      <div key={section.number} className="space-y-3">
                        <h2 className="font-bold text-foreground text-base">
                          {section.number}. {section.title}
                        </h2>
                        {section.content.map((paragraph, idx) => (
                          <p key={idx} className="text-muted-foreground leading-relaxed pl-4 whitespace-pre-wrap">
                            {linkifyText(paragraph)}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Collapsible View */}
              {viewMode === 'collapsible' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-3"
                >
                  {sections.map((section, index) => (
                    <CollapsibleSection key={section.number} section={section} index={index} />
                  ))}
                </motion.div>
              )}

              {/* Simple Text View */}
              {viewMode === 'simple' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-card border border-border rounded-lg p-12 shadow-sm max-w-3xl mx-auto"
                >
                  <div className="prose prose-slate max-w-none">
                    {sections.map((section, index) => (
                      <div key={section.number} className="mb-8">
                        <h2 className="text-xl font-bold text-foreground mb-4 border-b border-border pb-2">
                          {section.number}. {section.title}
                        </h2>
                        <div className="space-y-3">
                          {section.content.map((paragraph, idx) => (
                            <p key={idx} className="text-muted-foreground leading-relaxed text-base whitespace-pre-wrap">
                              {linkifyText(paragraph)}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </section>

        {/* Footer Note */}
        <section className="py-12 border-t border-border bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-muted-foreground">
                If you have any questions about this Privacy Policy, please{' '}
                <a href="/contactus" className="text-primary hover:underline font-medium">
                  contact us
                </a>
                .
              </p>
            </div>
          </div>
        </section>
      </div>
    </PageWithTranslationNotice>
  );
}
