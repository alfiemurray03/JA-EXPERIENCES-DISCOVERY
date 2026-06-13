/**
 * Policies batch:
 * Data Protection, Cookie, Retention, Info Security, Acceptable Use,
 * Refund, Shipping, T&Cs, Website Terms, Accessibility Statement,
 * Equality & Diversity, Safeguarding, H&S, Lone Working, Fire Safety,
 * Remote Working, Anti-Bullying, Anti-Harassment, Whistleblowing,
 * Social Media, Modern Slavery, Environmental, Code of Conduct
 */
import type { DocumentTemplate } from '../document-types';
import { section, infoTable, dataTable, or, nl2br, clause } from './html-helpers';
import { DISCLAIMER } from './template-factory';

function policyHeader(data: Record<string, string>, policyName: string): string {
  return section('Policy Information', infoTable([
    ['Organisation', or(data.orgName, '[Organisation]')],
    ['Policy Name', policyName],
    ['Effective Date', or(data.effectiveDate, '[Date]')],
    ['Next Review Date', data.reviewDate],
    ['Policy Owner', data.policyOwner],
    ['Version', data.version || 'v1.0'],
  ]));
}

const policyBaseFields = [
  { id: 'orgName', label: 'Organisation Name', type: 'text' as const, required: true },
  { id: 'effectiveDate', label: 'Effective Date', type: 'date' as const, required: true },
  { id: 'reviewDate', label: 'Next Review Date', type: 'date' as const, required: false },
  { id: 'policyOwner', label: 'Policy Owner', type: 'text' as const, required: false },
  { id: 'version', label: 'Version', type: 'text' as const, required: false, placeholder: 'e.g. v1.0' },
];

// ─── Data Protection Policy ───────────────────────────────────────────────────
export const dataProtectionPolicy: DocumentTemplate = {
  id: 'data-protection-policy',
  name: 'Data Protection Policy',
  category: 'policies',
  description: 'An internal data protection policy covering GDPR obligations, data handling, and staff responsibilities.',
  icon: 'Lock',
  planRequired: 'free',
  tags: ['data protection', 'GDPR', 'policy', 'compliance'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'dpoName', label: 'Data Protection Officer (if applicable)', type: 'text' as const, required: false },
        { id: 'contactEmail', label: 'Data Protection Contact Email', type: 'email' as const, required: false },
        { id: 'dataTypes', label: 'Types of Personal Data Processed', type: 'textarea' as const, required: false },
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Data Protection Policy'),
    section('1. Purpose & Scope',
      `<p>${or(data.orgName, '[Organisation]')} is committed to processing personal data in accordance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018. This policy applies to all staff, contractors, and volunteers who handle personal data on behalf of the organisation.</p>`
    ),
    section('2. Principles',
      clause('2.1', 'Personal data shall be processed lawfully, fairly, and transparently.') +
      clause('2.2', 'Data shall be collected for specified, explicit, and legitimate purposes.') +
      clause('2.3', 'Data shall be adequate, relevant, and limited to what is necessary.') +
      clause('2.4', 'Data shall be accurate and kept up to date.') +
      clause('2.5', 'Data shall not be kept longer than necessary.') +
      clause('2.6', 'Data shall be processed securely.')
    ),
    data.dataTypes ? section('3. Types of Data Processed', `<p>${nl2br(data.dataTypes)}</p>`) : '',
    section('4. Responsibilities',
      clause('4.1', `${data.dpoName ? `The Data Protection Officer (${data.dpoName})` : 'The designated data protection lead'} is responsible for overseeing compliance with this policy.`) +
      clause('4.2', 'All staff must complete data protection training and report any data breaches immediately.')
    ),
    section('5. Data Subject Rights',
      `<p>Individuals have the right to access, rectify, erase, restrict, and port their personal data. Requests should be directed to ${data.contactEmail || '[contact email]'} and will be responded to within one calendar month.</p>`
    ),
    data.additionalContent ? section('6. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Cookie Policy ────────────────────────────────────────────────────────────
export const cookiePolicy: DocumentTemplate = {
  id: 'cookie-policy',
  name: 'Cookie Policy',
  category: 'policies',
  description: 'A cookie policy explaining how cookies are used on a website.',
  icon: 'Cookie',
  planRequired: 'free',
  tags: ['cookies', 'policy', 'website', 'GDPR'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'websiteUrl', label: 'Website URL', type: 'text' as const, required: false },
        { id: 'contactEmail', label: 'Contact Email', type: 'email' as const, required: false },
        { id: 'cookieTypes', label: 'Types of Cookies Used', type: 'textarea' as const, required: false, placeholder: 'Essential cookies: Required for the website to function\nAnalytics cookies: Help us understand how visitors use the site\nMarketing cookies: Used to deliver relevant advertisements' },
        { id: 'thirdPartyCookies', label: 'Third-Party Cookies', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Cookie Policy'),
    section('1. What Are Cookies?',
      `<p>Cookies are small text files placed on your device when you visit a website. They help the website function, improve your experience, and provide information to the website owner.</p>`
    ),
    section('2. How We Use Cookies',
      `<p>${data.cookieTypes ? nl2br(data.cookieTypes) : 'We use essential cookies to make our website work, and may use analytics and preference cookies to improve your experience.'}</p>`
    ),
    data.thirdPartyCookies ? section('3. Third-Party Cookies', `<p>${nl2br(data.thirdPartyCookies)}</p>`) : '',
    section('4. Managing Cookies',
      `<p>You can control and delete cookies through your browser settings. Please note that disabling certain cookies may affect the functionality of our website. For more information, visit <strong>aboutcookies.org</strong>.</p>`
    ),
    section('5. Contact',
      `<p>If you have questions about our use of cookies, please contact us at <strong>${data.contactEmail || '[contact email]'}</strong>.</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Retention Policy ─────────────────────────────────────────────────────────
export const retentionPolicy: DocumentTemplate = {
  id: 'retention-policy',
  name: 'Retention Policy',
  category: 'policies',
  description: 'A document and data retention policy specifying how long different types of records are kept.',
  icon: 'Archive',
  planRequired: 'free',
  tags: ['retention', 'records', 'policy', 'GDPR', 'compliance'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'retentionSchedule', label: 'Retention Schedule (Record Type | Retention Period | Disposal Method)', type: 'textarea' as const, required: true, placeholder: 'Employee records | 6 years after employment ends | Secure deletion\nFinancial records | 7 years | Secure shredding\nCustomer data | 3 years after last contact | Secure deletion' },
        { id: 'additionalContent', label: 'Additional Notes', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => {
    const rows = (data.retentionSchedule || '').split('\n').filter(Boolean).map(l => {
      const parts = l.split('|').map(s => s.trim());
      return [parts[0] || '', parts[1] || '', parts[2] || ''];
    });
    return [
      policyHeader(data, 'Retention Policy'),
      section('1. Purpose',
        `<p>This policy sets out how long ${or(data.orgName, '[Organisation]')} retains different types of records and how they are disposed of securely at the end of their retention period.</p>`
      ),
      section('2. Retention Schedule', dataTable(['Record Type', 'Retention Period', 'Disposal Method'], rows)),
      section('3. Disposal',
        `<p>Records must be disposed of securely at the end of their retention period. Physical records should be shredded; electronic records should be permanently deleted.</p>`
      ),
      data.additionalContent ? section('4. Additional Notes', `<p>${nl2br(data.additionalContent)}</p>`) : '',
      DISCLAIMER,
    ].filter(Boolean).join('');
  },
};

// ─── Information Security Policy ─────────────────────────────────────────────
export const infoSecurityPolicy: DocumentTemplate = {
  id: 'information-security-policy',
  name: 'Information Security Policy',
  category: 'policies',
  description: 'A policy covering the protection of information assets, systems, and data.',
  icon: 'ShieldCheck',
  planRequired: 'free',
  tags: ['information security', 'cybersecurity', 'policy', 'IT'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'scope', label: 'Scope', type: 'textarea' as const, required: false },
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Information Security Policy'),
    section('1. Purpose & Scope',
      `<p>This policy establishes the framework for protecting the information assets of ${or(data.orgName, '[Organisation]')}. It applies to all staff, contractors, and third parties with access to our systems and data.</p>` +
      (data.scope ? `<p>${nl2br(data.scope)}</p>` : '')
    ),
    section('2. Key Principles',
      clause('2.1', 'All information assets must be classified and protected appropriately.') +
      clause('2.2', 'Access to systems and data must be controlled on a need-to-know basis.') +
      clause('2.3', 'All staff must use strong, unique passwords and enable multi-factor authentication where available.') +
      clause('2.4', 'Devices must be kept up to date with security patches and antivirus software.') +
      clause('2.5', 'Any suspected security incident or breach must be reported immediately.')
    ),
    section('3. Responsibilities',
      `<p>All staff are responsible for complying with this policy. The ${data.policyOwner || 'IT Manager / designated security lead'} is responsible for maintaining and enforcing this policy.</p>`
    ),
    data.additionalContent ? section('4. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Acceptable Use Policy ────────────────────────────────────────────────────
export const acceptableUsePolicy: DocumentTemplate = {
  id: 'acceptable-use-policy',
  name: 'Acceptable Use Policy',
  category: 'policies',
  description: 'A policy governing acceptable use of IT systems, internet, and company equipment.',
  icon: 'Monitor',
  planRequired: 'free',
  tags: ['acceptable use', 'IT', 'internet', 'policy'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'additionalRules', label: 'Additional Rules or Restrictions', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Acceptable Use Policy'),
    section('1. Purpose',
      `<p>This policy governs the acceptable use of IT systems, internet access, email, and company equipment provided by ${or(data.orgName, '[Organisation]')}. It applies to all staff, contractors, and volunteers.</p>`
    ),
    section('2. Acceptable Use',
      clause('2.1', 'Systems and equipment must be used primarily for legitimate business purposes.') +
      clause('2.2', 'Users must not access, store, or distribute illegal, offensive, or inappropriate content.') +
      clause('2.3', 'Confidential information must not be shared without authorisation.') +
      clause('2.4', 'Users must not install unauthorised software on company devices.')
    ),
    section('3. Prohibited Activities',
      `<ul>
        <li>Accessing or distributing illegal content</li>
        <li>Harassment or bullying via electronic communications</li>
        <li>Circumventing security controls</li>
        <li>Using company systems for personal commercial gain</li>
        <li>Sharing login credentials</li>
      </ul>`
    ),
    data.additionalRules ? section('4. Additional Rules', `<p>${nl2br(data.additionalRules)}</p>`) : '',
    section('5. Consequences',
      `<p>Breach of this policy may result in disciplinary action up to and including dismissal, and may be referred to law enforcement where appropriate.</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Refund Policy ────────────────────────────────────────────────────────────
export const refundPolicy: DocumentTemplate = {
  id: 'refund-policy',
  name: 'Refund Policy',
  category: 'policies',
  description: 'A customer-facing refund policy setting out eligibility, process, and timescales.',
  icon: 'RotateCcw',
  planRequired: 'free',
  tags: ['refund', 'returns', 'policy', 'customer'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'refundWindow', label: 'Refund Window', type: 'text' as const, required: false, placeholder: 'e.g. 30 days from purchase' },
        { id: 'eligibility', label: 'Refund Eligibility', type: 'textarea' as const, required: false },
        { id: 'process', label: 'How to Request a Refund', type: 'textarea' as const, required: false },
        { id: 'exclusions', label: 'Exclusions', type: 'textarea' as const, required: false },
        { id: 'contactEmail', label: 'Contact Email', type: 'email' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Refund Policy'),
    section('1. Our Commitment',
      `<p>${or(data.orgName, '[Organisation]')} is committed to customer satisfaction. This policy sets out when and how you can request a refund.</p>`
    ),
    section('2. Refund Window',
      `<p>${data.refundWindow || 'You may request a refund within 30 days of purchase.'}</p>`
    ),
    data.eligibility ? section('3. Eligibility', `<p>${nl2br(data.eligibility)}</p>`) : '',
    section('4. How to Request a Refund',
      `<p>${data.process || `To request a refund, please contact us at ${data.contactEmail || '[contact email]'} with your order details and reason for the request.`}</p>`
    ),
    data.exclusions ? section('5. Exclusions', `<p>${nl2br(data.exclusions)}</p>`) : '',
    section('6. Statutory Rights',
      `<p>This policy does not affect your statutory rights under the Consumer Rights Act 2015 or other applicable legislation.</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Shipping Policy ──────────────────────────────────────────────────────────
export const shippingPolicy: DocumentTemplate = {
  id: 'shipping-policy',
  name: 'Shipping Policy',
  category: 'policies',
  description: 'A shipping and delivery policy for online or physical businesses.',
  icon: 'Truck',
  planRequired: 'free',
  tags: ['shipping', 'delivery', 'policy', 'ecommerce'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'deliveryTimes', label: 'Delivery Times', type: 'textarea' as const, required: false },
        { id: 'shippingCosts', label: 'Shipping Costs', type: 'textarea' as const, required: false },
        { id: 'internationalShipping', label: 'International Shipping', type: 'textarea' as const, required: false },
        { id: 'lostDamaged', label: 'Lost or Damaged Items', type: 'textarea' as const, required: false },
        { id: 'contactEmail', label: 'Contact Email', type: 'email' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Shipping Policy'),
    section('1. Delivery Times',
      `<p>${data.deliveryTimes || 'We aim to dispatch orders within 1–3 business days. Delivery times vary by location and shipping method selected at checkout.'}</p>`
    ),
    section('2. Shipping Costs',
      `<p>${data.shippingCosts || 'Shipping costs are calculated at checkout based on order weight and destination.'}</p>`
    ),
    data.internationalShipping ? section('3. International Shipping', `<p>${nl2br(data.internationalShipping)}</p>`) : '',
    section('4. Lost or Damaged Items',
      `<p>${data.lostDamaged || `If your order arrives damaged or does not arrive, please contact us at ${data.contactEmail || '[contact email]'} within 14 days of the expected delivery date.`}</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Terms and Conditions ─────────────────────────────────────────────────────
export const termsAndConditions: DocumentTemplate = {
  id: 'terms-and-conditions',
  name: 'Terms and Conditions',
  category: 'policies',
  description: 'General terms and conditions for the supply of goods or services.',
  icon: 'FileText',
  planRequired: 'free',
  tags: ['terms', 'conditions', 'T&Cs', 'contract', 'legal'],
  sections: [
    {
      id: 'details',
      title: 'Details',
      fields: [
        ...policyBaseFields,
        { id: 'businessType', label: 'Business Type', type: 'select' as const, required: false, options: ['Goods supplier', 'Service provider', 'Both goods and services', 'Digital products / software'] },
        { id: 'paymentTerms', label: 'Payment Terms', type: 'textarea' as const, required: false },
        { id: 'liabilityLimit', label: 'Limitation of Liability', type: 'textarea' as const, required: false },
        { id: 'governingLaw', label: 'Governing Law', type: 'text' as const, required: false, defaultValue: 'England and Wales' },
        { id: 'contactEmail', label: 'Contact Email', type: 'email' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Terms and Conditions'),
    section('1. Introduction',
      `<p>These Terms and Conditions govern your use of our services and any purchase made from ${or(data.orgName, '[Organisation]')}. By placing an order or using our services, you agree to these terms.</p>`
    ),
    section('2. Orders & Acceptance',
      clause('2.1', 'All orders are subject to acceptance by us.') +
      clause('2.2', 'We reserve the right to refuse or cancel any order.')
    ),
    section('3. Payment',
      `<p>${data.paymentTerms || 'Payment is due at the time of order unless otherwise agreed in writing.'}</p>`
    ),
    section('4. Liability',
      `<p>${data.liabilityLimit || 'Our liability to you shall not exceed the value of the order placed. We are not liable for indirect or consequential losses.'}</p>`
    ),
    section('5. Governing Law',
      `<p>These terms are governed by the laws of ${or(data.governingLaw, 'England and Wales')}.</p>`
    ),
    section('6. Contact',
      `<p>For queries, contact us at ${data.contactEmail || '[contact email]'}.</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Website Terms of Use ─────────────────────────────────────────────────────
export const websiteTermsOfUse: DocumentTemplate = {
  id: 'website-terms-of-use',
  name: 'Website Terms of Use',
  category: 'policies',
  description: 'Terms governing use of a website, including intellectual property, disclaimers, and user conduct.',
  icon: 'Globe',
  planRequired: 'free',
  tags: ['website', 'terms of use', 'policy', 'legal'],
  sections: [
    {
      id: 'details',
      title: 'Details',
      fields: [
        ...policyBaseFields,
        { id: 'websiteUrl', label: 'Website URL', type: 'text' as const, required: false },
        { id: 'contactEmail', label: 'Contact Email', type: 'email' as const, required: false },
        { id: 'additionalContent', label: 'Additional Terms', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Website Terms of Use'),
    section('1. Acceptance',
      `<p>By accessing ${data.websiteUrl || 'our website'}, you agree to these Terms of Use. If you do not agree, please do not use the website.</p>`
    ),
    section('2. Intellectual Property',
      `<p>All content on this website, including text, images, and design, is the property of ${or(data.orgName, '[Organisation]')} and is protected by copyright. You may not reproduce or distribute content without our written permission.</p>`
    ),
    section('3. Acceptable Use',
      `<p>You must not use this website for any unlawful purpose, to transmit harmful content, or to attempt to gain unauthorised access to any part of the website or its systems.</p>`
    ),
    section('4. Disclaimer',
      `<p>Information on this website is provided for general purposes only. We make no warranties about the accuracy or completeness of the content.</p>`
    ),
    data.additionalContent ? section('5. Additional Terms', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Accessibility Statement ──────────────────────────────────────────────────
export const accessibilityStatement: DocumentTemplate = {
  id: 'accessibility-statement',
  name: 'Accessibility Statement',
  category: 'policies',
  description: 'An accessibility statement for a website or digital service.',
  icon: 'Accessibility',
  planRequired: 'free',
  tags: ['accessibility', 'WCAG', 'statement', 'website'],
  sections: [
    {
      id: 'details',
      title: 'Details',
      fields: [
        ...policyBaseFields,
        { id: 'websiteUrl', label: 'Website / Service URL', type: 'text' as const, required: false },
        { id: 'complianceLevel', label: 'Compliance Level', type: 'select' as const, required: false, options: ['Fully compliant with WCAG 2.1 AA', 'Partially compliant with WCAG 2.1 AA', 'Not yet assessed'] },
        { id: 'knownIssues', label: 'Known Accessibility Issues', type: 'textarea' as const, required: false },
        { id: 'contactEmail', label: 'Accessibility Contact Email', type: 'email' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Accessibility Statement'),
    section('1. Our Commitment',
      `<p>${or(data.orgName, '[Organisation]')} is committed to making ${data.websiteUrl || 'our website'} accessible to as many people as possible. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.</p>`
    ),
    section('2. Compliance Status',
      `<p>${data.complianceLevel || 'We are working towards full compliance with WCAG 2.1 AA.'}</p>`
    ),
    data.knownIssues ? section('3. Known Issues', `<p>${nl2br(data.knownIssues)}</p>`) : '',
    section('4. Feedback & Contact',
      `<p>If you experience any accessibility barriers or need content in an alternative format, please contact us at <strong>${data.contactEmail || '[contact email]'}</strong>. We aim to respond within 5 working days.</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Equality & Diversity Policy ──────────────────────────────────────────────
export const equalityDiversityPolicy: DocumentTemplate = {
  id: 'equality-diversity-policy',
  name: 'Equality and Diversity Policy',
  category: 'policies',
  description: 'A policy promoting equality, diversity, and inclusion in the workplace.',
  icon: 'Users',
  planRequired: 'free',
  tags: ['equality', 'diversity', 'inclusion', 'EDI', 'policy'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Equality and Diversity Policy'),
    section('1. Statement of Intent',
      `<p>${or(data.orgName, '[Organisation]')} is committed to promoting equality, diversity, and inclusion. We will not tolerate discrimination, harassment, or victimisation on the grounds of any protected characteristic as defined by the Equality Act 2010.</p>`
    ),
    section('2. Protected Characteristics',
      `<p>The protected characteristics under the Equality Act 2010 are: age, disability, gender reassignment, marriage and civil partnership, pregnancy and maternity, race, religion or belief, sex, and sexual orientation.</p>`
    ),
    section('3. Our Commitments',
      clause('3.1', 'To treat all people with dignity and respect.') +
      clause('3.2', 'To provide equal opportunities in recruitment, promotion, and development.') +
      clause('3.3', 'To take all complaints of discrimination or harassment seriously and investigate them promptly.') +
      clause('3.4', 'To make reasonable adjustments for disabled people.')
    ),
    data.additionalContent ? section('4. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Safeguarding Policy ──────────────────────────────────────────────────────
export const safeguardingPolicy: DocumentTemplate = {
  id: 'safeguarding-policy',
  name: 'Safeguarding Policy',
  category: 'policies',
  description: 'A safeguarding policy for organisations working with children or vulnerable adults.',
  icon: 'ShieldAlert',
  planRequired: 'free',
  tags: ['safeguarding', 'children', 'vulnerable adults', 'policy'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'dslName', label: 'Designated Safeguarding Lead (DSL)', type: 'text' as const, required: false },
        { id: 'dslContact', label: 'DSL Contact', type: 'text' as const, required: false },
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Safeguarding Policy'),
    section('1. Statement of Intent',
      `<p>${or(data.orgName, '[Organisation]')} is committed to safeguarding and promoting the welfare of children and vulnerable adults. We believe that all people have the right to be protected from harm.</p>`
    ),
    section('2. Designated Safeguarding Lead',
      `<p>The Designated Safeguarding Lead (DSL) is <strong>${data.dslName || '[DSL Name]'}</strong>${data.dslContact ? `, contactable at ${data.dslContact}` : ''}. All safeguarding concerns must be reported to the DSL immediately.</p>`
    ),
    section('3. Key Principles',
      clause('3.1', 'The welfare of the child or vulnerable adult is paramount.') +
      clause('3.2', 'All staff and volunteers have a responsibility to report concerns.') +
      clause('3.3', 'Concerns will be taken seriously and acted upon promptly.') +
      clause('3.4', 'Confidentiality will be maintained appropriately, but will not override the need to protect individuals from harm.')
    ),
    section('4. Reporting Concerns',
      `<p>Any concerns about the welfare of a child or vulnerable adult must be reported to the DSL immediately. In an emergency, contact the police (999) or local authority children's/adult services.</p>`
    ),
    data.additionalContent ? section('5. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Health & Safety Policy ───────────────────────────────────────────────────
export const healthSafetyPolicy: DocumentTemplate = {
  id: 'health-safety-policy',
  name: 'Health and Safety Policy',
  category: 'policies',
  description: 'A health and safety policy statement for businesses with 5 or more employees.',
  icon: 'HardHat',
  planRequired: 'free',
  tags: ['health and safety', 'H&S', 'policy', 'workplace'],
  signatories: [{ label: 'Director / Senior Manager' }],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'responsiblePerson', label: 'Person Responsible for H&S', type: 'text' as const, required: false },
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Health and Safety Policy'),
    section('1. Statement of Intent',
      `<p>${or(data.orgName, '[Organisation]')} is committed to ensuring the health, safety, and welfare of all employees, contractors, visitors, and others who may be affected by our activities, so far as is reasonably practicable.</p>`
    ),
    section('2. Responsibilities',
      clause('2.1', `The overall responsibility for health and safety rests with ${data.responsiblePerson || 'the senior management team'}.`) +
      clause('2.2', 'All employees have a duty to take reasonable care of their own health and safety and that of others.') +
      clause('2.3', 'Employees must report all accidents, near-misses, and hazards to their manager immediately.')
    ),
    section('3. Key Arrangements',
      `<ul>
        <li>Risk assessments will be carried out for all significant activities</li>
        <li>All accidents and near-misses will be recorded and investigated</li>
        <li>Staff will receive appropriate health and safety training</li>
        <li>Emergency procedures will be maintained and communicated</li>
        <li>This policy will be reviewed annually or following any significant change</li>
      </ul>`
    ),
    data.additionalContent ? section('4. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Lone Working Policy ──────────────────────────────────────────────────────
export const loneWorkingPolicy: DocumentTemplate = {
  id: 'lone-working-policy',
  name: 'Lone Working Policy',
  category: 'policies',
  description: 'A policy for managing the risks associated with lone working.',
  icon: 'User',
  planRequired: 'free',
  tags: ['lone working', 'safety', 'policy', 'H&S'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Lone Working Policy'),
    section('1. Purpose',
      `<p>This policy sets out how ${or(data.orgName, '[Organisation]')} manages the risks associated with lone working to protect the health, safety, and welfare of employees who work alone.</p>`
    ),
    section('2. Definition',
      `<p>Lone working occurs when an employee works without close or direct supervision, or when they are physically separated from other workers.</p>`
    ),
    section('3. Risk Assessment',
      `<p>A risk assessment must be completed before any lone working activity. Risks to be considered include: personal safety, medical emergencies, access to help, and the nature of the work being carried out.</p>`
    ),
    section('4. Arrangements',
      clause('4.1', 'Lone workers must check in with a designated contact at agreed intervals.') +
      clause('4.2', 'Lone workers must have access to a means of communication at all times.') +
      clause('4.3', 'Emergency procedures must be established and communicated to lone workers.') +
      clause('4.4', 'Lone workers must not undertake tasks that cannot be done safely alone.')
    ),
    data.additionalContent ? section('5. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Remote Working Policy ────────────────────────────────────────────────────
export const remoteWorkingPolicy: DocumentTemplate = {
  id: 'remote-working-policy',
  name: 'Remote Working Policy',
  category: 'policies',
  description: 'A policy governing remote and home working arrangements.',
  icon: 'Laptop',
  planRequired: 'free',
  tags: ['remote working', 'home working', 'hybrid', 'policy'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'eligibility', label: 'Eligibility for Remote Working', type: 'textarea' as const, required: false },
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Remote Working Policy'),
    section('1. Purpose',
      `<p>This policy sets out the arrangements for remote and home working at ${or(data.orgName, '[Organisation]')}.</p>`
    ),
    data.eligibility ? section('2. Eligibility', `<p>${nl2br(data.eligibility)}</p>`) : '',
    section('3. Expectations',
      clause('3.1', 'Remote workers must be available during agreed core hours.') +
      clause('3.2', 'Remote workers must maintain a safe and suitable working environment.') +
      clause('3.3', 'Company data must be handled securely in accordance with our data protection policy.') +
      clause('3.4', 'Equipment provided by the company must be used for business purposes.')
    ),
    section('4. Health & Safety',
      `<p>Employees working from home are responsible for ensuring their workspace is safe. A home working risk assessment should be completed.</p>`
    ),
    data.additionalContent ? section('5. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Anti-Bullying Policy ─────────────────────────────────────────────────────
export const antiBullyingPolicy: DocumentTemplate = {
  id: 'anti-bullying-policy',
  name: 'Anti-Bullying Policy',
  category: 'policies',
  description: 'A policy setting out the organisation\'s commitment to preventing and addressing bullying.',
  icon: 'ShieldOff',
  planRequired: 'free',
  tags: ['bullying', 'anti-bullying', 'policy', 'workplace'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Anti-Bullying Policy'),
    section('1. Statement',
      `<p>${or(data.orgName, '[Organisation]')} is committed to providing a safe, respectful environment for all. Bullying of any kind will not be tolerated.</p>`
    ),
    section('2. Definition',
      `<p>Bullying is defined as repeated, unreasonable behaviour directed towards an individual or group that creates a risk to health and safety. It may be physical, verbal, psychological, or online.</p>`
    ),
    section('3. Reporting',
      `<p>Anyone who experiences or witnesses bullying should report it to their line manager or HR. All reports will be taken seriously and investigated promptly and confidentially.</p>`
    ),
    section('4. Consequences',
      `<p>Bullying behaviour may result in disciplinary action up to and including dismissal.</p>`
    ),
    data.additionalContent ? section('5. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Anti-Harassment Policy ───────────────────────────────────────────────────
export const antiHarassmentPolicy: DocumentTemplate = {
  id: 'anti-harassment-policy',
  name: 'Anti-Harassment Policy',
  category: 'policies',
  description: 'A policy preventing harassment in the workplace, including sexual harassment.',
  icon: 'Ban',
  planRequired: 'free',
  tags: ['harassment', 'anti-harassment', 'policy', 'workplace'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Anti-Harassment Policy'),
    section('1. Statement',
      `<p>${or(data.orgName, '[Organisation]')} is committed to maintaining a workplace free from harassment. Harassment on any grounds, including sex, race, disability, religion, age, or sexual orientation, will not be tolerated.</p>`
    ),
    section('2. Definition',
      `<p>Harassment is unwanted conduct related to a protected characteristic that has the purpose or effect of violating a person's dignity or creating an intimidating, hostile, degrading, humiliating, or offensive environment.</p>`
    ),
    section('3. Reporting & Investigation',
      `<p>All complaints of harassment will be treated seriously, investigated promptly, and handled confidentially. Complainants will be protected from victimisation.</p>`
    ),
    section('4. Consequences',
      `<p>Harassment may result in disciplinary action up to and including dismissal, and may be referred to external authorities where appropriate.</p>`
    ),
    data.additionalContent ? section('5. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Whistleblowing Policy ────────────────────────────────────────────────────
export const whistleblowingPolicy: DocumentTemplate = {
  id: 'whistleblowing-policy',
  name: 'Whistleblowing Policy',
  category: 'policies',
  description: 'A policy enabling staff to raise concerns about wrongdoing without fear of retaliation.',
  icon: 'Bell',
  planRequired: 'free',
  tags: ['whistleblowing', 'speak up', 'policy', 'compliance'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'reportingContact', label: 'Reporting Contact / Channel', type: 'text' as const, required: false },
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Whistleblowing Policy'),
    section('1. Purpose',
      `<p>${or(data.orgName, '[Organisation]')} encourages all staff to speak up if they have concerns about wrongdoing, illegal activity, or serious risks. This policy provides a safe channel for raising such concerns.</p>`
    ),
    section('2. What to Report',
      `<p>Concerns may include: fraud or financial irregularities, health and safety risks, criminal activity, breach of legal obligations, cover-ups of any of the above.</p>`
    ),
    section('3. How to Report',
      `<p>Concerns should be reported to ${data.reportingContact || 'your line manager, HR, or a senior director'}. Reports can be made anonymously if preferred.</p>`
    ),
    section('4. Protection',
      `<p>Anyone who raises a concern in good faith will be protected from retaliation. Victimisation of a whistleblower will be treated as a serious disciplinary matter.</p>`
    ),
    data.additionalContent ? section('5. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Social Media Policy ──────────────────────────────────────────────────────
export const socialMediaPolicy: DocumentTemplate = {
  id: 'social-media-policy',
  name: 'Social Media Policy',
  category: 'policies',
  description: 'A policy governing staff use of social media, both professionally and personally.',
  icon: 'Share2',
  planRequired: 'free',
  tags: ['social media', 'policy', 'digital', 'communications'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Social Media Policy'),
    section('1. Purpose',
      `<p>This policy sets out how staff at ${or(data.orgName, '[Organisation]')} should use social media, both in a professional capacity and in personal use that may affect the organisation.</p>`
    ),
    section('2. Professional Use',
      clause('2.1', 'Only authorised staff may post on behalf of the organisation.') +
      clause('2.2', 'All official communications must be accurate, professional, and consistent with our brand.') +
      clause('2.3', 'Confidential information must never be shared on social media.')
    ),
    section('3. Personal Use',
      clause('3.1', 'Staff must not post content that could damage the reputation of the organisation.') +
      clause('3.2', 'Staff must not disclose confidential information or make defamatory statements.') +
      clause('3.3', 'Staff should make clear that personal views are their own and not those of the organisation.')
    ),
    section('4. Consequences',
      `<p>Breach of this policy may result in disciplinary action.</p>`
    ),
    data.additionalContent ? section('5. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Modern Slavery Statement ─────────────────────────────────────────────────
export const modernSlaveryStatement: DocumentTemplate = {
  id: 'modern-slavery-statement',
  name: 'Modern Slavery Statement',
  category: 'policies',
  description: 'An annual modern slavery and human trafficking statement for businesses.',
  icon: 'Scale',
  planRequired: 'free',
  tags: ['modern slavery', 'human trafficking', 'statement', 'compliance'],
  signatories: [{ label: 'Director / Senior Manager' }],
  sections: [
    {
      id: 'details',
      title: 'Statement Details',
      fields: [
        ...policyBaseFields,
        { id: 'financialYear', label: 'Financial Year', type: 'text' as const, required: false, placeholder: 'e.g. Year ending 31 March 2026' },
        { id: 'businessDescription', label: 'Business Description', type: 'textarea' as const, required: false },
        { id: 'supplyChain', label: 'Supply Chain Description', type: 'textarea' as const, required: false },
        { id: 'dueDiligence', label: 'Due Diligence Steps Taken', type: 'textarea' as const, required: false },
        { id: 'training', label: 'Training Provided', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Modern Slavery and Human Trafficking Statement'),
    section('1. Introduction',
      `<p>This statement is made pursuant to section 54 of the Modern Slavery Act 2015 and sets out the steps taken by ${or(data.orgName, '[Organisation]')} to prevent modern slavery and human trafficking in our business and supply chains${data.financialYear ? ` for the ${data.financialYear}` : ''}.</p>`
    ),
    data.businessDescription ? section('2. Our Business', `<p>${nl2br(data.businessDescription)}</p>`) : '',
    data.supplyChain ? section('3. Our Supply Chains', `<p>${nl2br(data.supplyChain)}</p>`) : '',
    section('4. Our Policies',
      `<p>We are committed to acting ethically and with integrity in all our business relationships. We have a zero-tolerance approach to modern slavery.</p>`
    ),
    data.dueDiligence ? section('5. Due Diligence', `<p>${nl2br(data.dueDiligence)}</p>`) : '',
    data.training ? section('6. Training', `<p>${nl2br(data.training)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Environmental Policy ─────────────────────────────────────────────────────
export const environmentalPolicy: DocumentTemplate = {
  id: 'environmental-policy',
  name: 'Environmental Policy',
  category: 'policies',
  description: 'A policy setting out the organisation\'s commitment to environmental responsibility.',
  icon: 'Leaf',
  planRequired: 'free',
  tags: ['environmental', 'sustainability', 'green', 'policy'],
  signatories: [{ label: 'Director / Senior Manager' }],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'commitments', label: 'Environmental Commitments', type: 'textarea' as const, required: false },
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Environmental Policy'),
    section('1. Statement of Intent',
      `<p>${or(data.orgName, '[Organisation]')} is committed to minimising our environmental impact and operating in a sustainable manner. We recognise our responsibility to protect the environment for future generations.</p>`
    ),
    section('2. Our Commitments',
      data.commitments
        ? `<p>${nl2br(data.commitments)}</p>`
        : `<ul>
            <li>Reduce energy consumption and carbon emissions</li>
            <li>Minimise waste and promote recycling</li>
            <li>Use sustainable materials and suppliers where possible</li>
            <li>Comply with all relevant environmental legislation</li>
            <li>Continually improve our environmental performance</li>
          </ul>`
    ),
    section('3. Responsibilities',
      `<p>All staff are responsible for implementing this policy in their day-to-day activities. ${data.policyOwner || 'Senior management'} is responsible for reviewing and updating this policy.</p>`
    ),
    data.additionalContent ? section('4. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Code of Conduct ──────────────────────────────────────────────────────────
export const codeOfConduct: DocumentTemplate = {
  id: 'code-of-conduct',
  name: 'Code of Conduct',
  category: 'policies',
  description: 'A code of conduct setting out the standards of behaviour expected of staff and representatives.',
  icon: 'BookOpen',
  planRequired: 'free',
  tags: ['code of conduct', 'behaviour', 'standards', 'policy'],
  sections: [
    {
      id: 'details',
      title: 'Details',
      fields: [
        ...policyBaseFields,
        { id: 'additionalContent', label: 'Additional Standards or Rules', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Code of Conduct'),
    section('1. Purpose',
      `<p>This Code of Conduct sets out the standards of behaviour expected of all staff, volunteers, and representatives of ${or(data.orgName, '[Organisation]')}.</p>`
    ),
    section('2. Core Standards',
      clause('2.1', 'Act with integrity, honesty, and transparency at all times.') +
      clause('2.2', 'Treat all colleagues, clients, and stakeholders with respect and dignity.') +
      clause('2.3', 'Comply with all applicable laws, regulations, and company policies.') +
      clause('2.4', 'Protect confidential information and avoid conflicts of interest.') +
      clause('2.5', 'Report any concerns about unethical behaviour or wrongdoing.')
    ),
    section('3. Professional Conduct',
      `<p>All representatives of the organisation are expected to maintain professional standards in their conduct, communications, and appearance when acting on behalf of the organisation.</p>`
    ),
    data.additionalContent ? section('4. Additional Standards', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    section('5. Consequences',
      `<p>Breach of this Code of Conduct may result in disciplinary action.</p>`
    ),
    DISCLAIMER,
  ].filter(Boolean).join(''),
};

// ─── Fire Safety Policy ───────────────────────────────────────────────────────
export const fireSafetyPolicy: DocumentTemplate = {
  id: 'fire-safety-policy',
  name: 'Fire Safety Policy',
  category: 'policies',
  description: 'A fire safety policy and emergency evacuation procedure.',
  icon: 'Flame',
  planRequired: 'free',
  tags: ['fire safety', 'evacuation', 'H&S', 'policy'],
  sections: [
    {
      id: 'details',
      title: 'Policy Details',
      fields: [
        ...policyBaseFields,
        { id: 'fireWarden', label: 'Fire Warden(s)', type: 'text' as const, required: false },
        { id: 'assemblyPoint', label: 'Assembly Point', type: 'text' as const, required: false },
        { id: 'additionalContent', label: 'Additional Policy Content', type: 'textarea' as const, required: false },
      ],
    },
  ],
  generateDocument: (data) => [
    policyHeader(data, 'Fire Safety Policy'),
    section('1. Statement',
      `<p>${or(data.orgName, '[Organisation]')} is committed to ensuring the safety of all persons on our premises in the event of a fire.</p>`
    ),
    section('2. Fire Wardens',
      `<p>The designated Fire Warden(s) are: <strong>${data.fireWarden || '[Fire Warden Names]'}</strong>. Fire wardens are responsible for ensuring evacuation procedures are followed.</p>`
    ),
    section('3. Evacuation Procedure',
      clause('3.1', 'On hearing the fire alarm, evacuate the building immediately via the nearest safe exit.') +
      clause('3.2', 'Do not use lifts.') +
      clause('3.3', `Proceed to the assembly point: <strong>${data.assemblyPoint || '[Assembly Point]'}</strong>.`) +
      clause('3.4', 'Do not re-enter the building until authorised by the fire service or fire warden.')
    ),
    section('4. Prevention',
      `<p>All staff must: keep fire exits clear, report fire hazards immediately, not tamper with fire safety equipment, and participate in fire drills.</p>`
    ),
    data.additionalContent ? section('5. Additional Provisions', `<p>${nl2br(data.additionalContent)}</p>`) : '',
    DISCLAIMER,
  ].filter(Boolean).join(''),
};
