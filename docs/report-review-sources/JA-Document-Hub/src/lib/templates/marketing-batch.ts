import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate, divider } from './html-helpers';

function mk(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'marketing', icon: 'Megaphone', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

// ── Marketing Plan ────────────────────────────────────────────────────────────
export const marketingPlan = mk('marketing-plan', 'Marketing Plan', 'A structured marketing plan covering objectives, target audience, channels and budget.', ['marketing', 'plan', 'strategy'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'businessName', label: 'Business / Brand Name', type: 'text', required: true },
    { id: 'period', label: 'Plan Period', type: 'text', required: false, placeholder: 'e.g. Q1 2026 / Jan–Dec 2026' },
    { id: 'objectives', label: 'Marketing Objectives', type: 'textarea', required: false, placeholder: 'e.g. Increase brand awareness, generate 200 leads/month' },
    { id: 'targetAudience', label: 'Target Audience', type: 'textarea', required: false },
    { id: 'channels', label: 'Marketing Channels', type: 'textarea', required: false, placeholder: 'e.g. Social media, email, SEO, paid ads' },
    { id: 'budget', label: 'Total Marketing Budget', type: 'text', required: false },
    { id: 'kpis', label: 'Key Performance Indicators (KPIs)', type: 'textarea', required: false },
    { id: 'notes', label: 'Additional Notes', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Marketing Plan Overview', infoTable([['Business', or(d.businessName,'[Business]')],['Period', d.period],['Budget', d.budget]])),
    section('Objectives', `<p>${nl2br(or(d.objectives,'[Objectives]'))}</p>`),
    section('Target Audience', `<p>${nl2br(or(d.targetAudience,'[Target Audience]'))}</p>`),
    section('Channels & Tactics', `<p>${nl2br(or(d.channels,'[Channels]'))}</p>`),
    section('KPIs', `<p>${nl2br(or(d.kpis,'[KPIs]'))}</p>`),
    d.notes ? section('Notes', `<p>${nl2br(d.notes)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Campaign Brief ────────────────────────────────────────────────────────────
export const campaignBrief = mk('campaign-brief', 'Campaign Brief', 'A creative/campaign brief for internal teams or agencies.', ['campaign', 'brief', 'marketing'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'campaignName', label: 'Campaign Name', type: 'text', required: true },
    { id: 'brand', label: 'Brand / Product', type: 'text', required: false },
    { id: 'objective', label: 'Campaign Objective', type: 'textarea', required: false },
    { id: 'audience', label: 'Target Audience', type: 'textarea', required: false },
    { id: 'keyMessage', label: 'Key Message', type: 'textarea', required: false },
    { id: 'deliverables', label: 'Deliverables Required', type: 'textarea', required: false },
    { id: 'timeline', label: 'Timeline / Deadlines', type: 'text', required: false },
    { id: 'budget', label: 'Budget', type: 'text', required: false },
    { id: 'approver', label: 'Approver / Sign-off', type: 'text', required: false },
  ]}],
  (d) => [
    section('Campaign Brief', infoTable([['Campaign', or(d.campaignName,'[Campaign]')],['Brand', d.brand],['Timeline', d.timeline],['Budget', d.budget],['Approver', d.approver]])),
    section('Objective', `<p>${nl2br(or(d.objective,'[Objective]'))}</p>`),
    section('Target Audience', `<p>${nl2br(or(d.audience,'[Audience]'))}</p>`),
    section('Key Message', `<p>${nl2br(or(d.keyMessage,'[Key Message]'))}</p>`),
    section('Deliverables', `<p>${nl2br(or(d.deliverables,'[Deliverables]'))}</p>`),
  ].filter(Boolean).join(''),
);

// ── Social Media Content Plan ─────────────────────────────────────────────────
export const socialMediaPlan = mk('social-media-plan', 'Social Media Content Plan', 'A monthly social media content calendar and strategy plan.', ['social media', 'content', 'calendar'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'brand', label: 'Brand Name', type: 'text', required: true },
    { id: 'month', label: 'Month / Period', type: 'text', required: false },
    { id: 'platforms', label: 'Platforms', type: 'text', required: false, placeholder: 'e.g. Instagram, LinkedIn, Facebook, TikTok' },
    { id: 'themes', label: 'Content Themes', type: 'textarea', required: false },
    { id: 'postFrequency', label: 'Posting Frequency', type: 'text', required: false, placeholder: 'e.g. 5x per week' },
    { id: 'contentMix', label: 'Content Mix', type: 'textarea', required: false, placeholder: 'e.g. 40% educational, 30% promotional, 30% engagement' },
    { id: 'hashtags', label: 'Key Hashtags', type: 'textarea', required: false },
    { id: 'goals', label: 'Goals / KPIs', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Social Media Plan', infoTable([['Brand', or(d.brand,'[Brand]')],['Period', d.month],['Platforms', d.platforms],['Frequency', d.postFrequency]])),
    section('Content Themes', `<p>${nl2br(or(d.themes,'[Themes]'))}</p>`),
    section('Content Mix', `<p>${nl2br(or(d.contentMix,'[Content Mix]'))}</p>`),
    d.hashtags ? section('Key Hashtags', `<p>${nl2br(d.hashtags)}</p>`) : '',
    section('Goals & KPIs', `<p>${nl2br(or(d.goals,'[Goals]'))}</p>`),
  ].filter(Boolean).join(''),
);

// ── Press Release ─────────────────────────────────────────────────────────────
export const pressRelease = mk('press-release', 'Press Release', 'A professional press release for announcements, launches or news.', ['press release', 'pr', 'news', 'announcement'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'headline', label: 'Headline', type: 'text', required: true },
    { id: 'subheadline', label: 'Sub-headline (optional)', type: 'text', required: false },
    { id: 'organisation', label: 'Organisation Name', type: 'text', required: true },
    { id: 'location', label: 'Location', type: 'text', required: false },
    { id: 'releaseDate', label: 'Release Date', type: 'date', required: false },
    { id: 'body', label: 'Body / Main Content', type: 'textarea', required: true },
    { id: 'quote', label: 'Quote (optional)', type: 'textarea', required: false },
    { id: 'quotePerson', label: 'Quote Attribution', type: 'text', required: false },
    { id: 'boilerplate', label: 'About the Organisation (boilerplate)', type: 'textarea', required: false },
    { id: 'contactName', label: 'Press Contact Name', type: 'text', required: false },
    { id: 'contactEmail', label: 'Press Contact Email', type: 'text', required: false },
    { id: 'contactPhone', label: 'Press Contact Phone', type: 'text', required: false },
  ]}],
  (d) => [
    `<p style="font-size:8.5pt;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">FOR IMMEDIATE RELEASE${d.releaseDate ? ` — ${fmtDate(d.releaseDate)}` : ''}</p>`,
    `<h2 style="font-size:16pt;font-weight:700;margin:0 0 6px 0;">${or(d.headline,'[Headline]')}</h2>`,
    d.subheadline ? `<h3 style="font-size:12pt;font-weight:400;color:#374151;margin:0 0 16px 0;">${d.subheadline}</h3>` : '',
    `<p style="font-size:9.5pt;color:#374151;margin-bottom:12px;"><strong>${or(d.location,'[Location]')}</strong> — ${nl2br(or(d.body,'[Body]'))}</p>`,
    d.quote ? `<blockquote style="border-left:3px solid #1B4F8A;padding:8px 14px;margin:12px 0;font-style:italic;color:#374151;">"${d.quote}"${d.quotePerson ? `<footer style="font-style:normal;font-size:8.5pt;margin-top:4px;">— ${d.quotePerson}</footer>` : ''}</blockquote>` : '',
    d.boilerplate ? section('About ' + or(d.organisation,'the Organisation'), `<p>${nl2br(d.boilerplate)}</p>`) : '',
    section('Media Contact', infoTable([['Name', d.contactName],['Email', d.contactEmail],['Phone', d.contactPhone]])),
    `<p style="text-align:center;font-size:11pt;font-weight:700;letter-spacing:4px;margin-top:12px;">###</p>`,
  ].filter(Boolean).join(''),
);

// ── Sales Proposal ────────────────────────────────────────────────────────────
export const salesProposal = mk('sales-proposal', 'Sales Proposal', 'A professional sales proposal to present to a prospective client.', ['sales', 'proposal', 'pitch'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'providerName', label: 'Your Company Name', type: 'text', required: true },
    { id: 'clientName', label: 'Prospect / Client Name', type: 'text', required: true },
    { id: 'proposalDate', label: 'Proposal Date', type: 'date', required: false },
    { id: 'validUntil', label: 'Valid Until', type: 'date', required: false },
    { id: 'executiveSummary', label: 'Executive Summary', type: 'textarea', required: false },
    { id: 'problemStatement', label: 'Problem / Challenge', type: 'textarea', required: false },
    { id: 'solution', label: 'Proposed Solution', type: 'textarea', required: false },
    { id: 'deliverables', label: 'Deliverables', type: 'textarea', required: false },
    { id: 'investment', label: 'Investment / Pricing', type: 'textarea', required: false },
    { id: 'timeline', label: 'Timeline', type: 'text', required: false },
    { id: 'whyUs', label: 'Why Choose Us', type: 'textarea', required: false },
    { id: 'nextSteps', label: 'Next Steps', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Proposal Details', infoTable([['Prepared by', or(d.providerName,'[Provider]')],['Prepared for', or(d.clientName,'[Client]')],['Date', fmtDate(d.proposalDate)],['Valid Until', fmtDate(d.validUntil)]])),
    d.executiveSummary ? section('Executive Summary', `<p>${nl2br(d.executiveSummary)}</p>`) : '',
    d.problemStatement ? section('The Challenge', `<p>${nl2br(d.problemStatement)}</p>`) : '',
    d.solution ? section('Our Solution', `<p>${nl2br(d.solution)}</p>`) : '',
    d.deliverables ? section('Deliverables', `<p>${nl2br(d.deliverables)}</p>`) : '',
    d.investment ? section('Investment', `<p>${nl2br(d.investment)}</p>`) : '',
    d.timeline ? section('Timeline', `<p>${nl2br(d.timeline)}</p>`) : '',
    d.whyUs ? section('Why Choose Us', `<p>${nl2br(d.whyUs)}</p>`) : '',
    d.nextSteps ? section('Next Steps', `<p>${nl2br(d.nextSteps)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Brand Guidelines ──────────────────────────────────────────────────────────
export const brandGuidelines = mk('brand-guidelines', 'Brand Guidelines', 'A brand guidelines document covering logo, colours, typography and tone of voice.', ['brand', 'guidelines', 'identity'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'brandName', label: 'Brand Name', type: 'text', required: true },
    { id: 'missionStatement', label: 'Mission Statement', type: 'textarea', required: false },
    { id: 'brandValues', label: 'Brand Values', type: 'textarea', required: false },
    { id: 'toneOfVoice', label: 'Tone of Voice', type: 'textarea', required: false },
    { id: 'primaryColours', label: 'Primary Colours (hex codes)', type: 'text', required: false },
    { id: 'secondaryColours', label: 'Secondary Colours', type: 'text', required: false },
    { id: 'typography', label: 'Typography / Fonts', type: 'text', required: false },
    { id: 'logoUsage', label: 'Logo Usage Guidelines', type: 'textarea', required: false },
    { id: 'dosDonts', label: "Do's and Don'ts", type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Brand Overview', infoTable([['Brand', or(d.brandName,'[Brand]')],['Primary Colours', d.primaryColours],['Secondary Colours', d.secondaryColours],['Typography', d.typography]])),
    d.missionStatement ? section('Mission Statement', `<p>${nl2br(d.missionStatement)}</p>`) : '',
    d.brandValues ? section('Brand Values', `<p>${nl2br(d.brandValues)}</p>`) : '',
    d.toneOfVoice ? section('Tone of Voice', `<p>${nl2br(d.toneOfVoice)}</p>`) : '',
    d.logoUsage ? section('Logo Usage', `<p>${nl2br(d.logoUsage)}</p>`) : '',
    d.dosDonts ? section("Do's and Don'ts", `<p>${nl2br(d.dosDonts)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Email Newsletter Template ─────────────────────────────────────────────────
export const emailNewsletterPlan = mk('email-newsletter-plan', 'Email Newsletter Plan', 'Plan and structure an email newsletter campaign.', ['email', 'newsletter', 'campaign'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'brand', label: 'Brand Name', type: 'text', required: true },
    { id: 'issueTitle', label: 'Newsletter Issue Title', type: 'text', required: false },
    { id: 'sendDate', label: 'Send Date', type: 'date', required: false },
    { id: 'subjectLine', label: 'Subject Line', type: 'text', required: false },
    { id: 'previewText', label: 'Preview Text', type: 'text', required: false },
    { id: 'mainStory', label: 'Main Story / Feature', type: 'textarea', required: false },
    { id: 'secondaryContent', label: 'Secondary Content / Updates', type: 'textarea', required: false },
    { id: 'cta', label: 'Call to Action', type: 'text', required: false },
    { id: 'targetSegment', label: 'Target Segment', type: 'text', required: false },
  ]}],
  (d) => [
    section('Newsletter Details', infoTable([['Brand', or(d.brand,'[Brand]')],['Issue', d.issueTitle],['Send Date', fmtDate(d.sendDate)],['Subject Line', d.subjectLine],['Preview Text', d.previewText],['Target Segment', d.targetSegment]])),
    d.mainStory ? section('Main Story / Feature', `<p>${nl2br(d.mainStory)}</p>`) : '',
    d.secondaryContent ? section('Secondary Content', `<p>${nl2br(d.secondaryContent)}</p>`) : '',
    d.cta ? section('Call to Action', `<p>${nl2br(d.cta)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Competitor Analysis ───────────────────────────────────────────────────────
export const competitorAnalysis = mk('competitor-analysis', 'Competitor Analysis', 'A structured competitor analysis document.', ['competitor', 'analysis', 'research'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'yourBusiness', label: 'Your Business Name', type: 'text', required: true },
    { id: 'analysisDate', label: 'Analysis Date', type: 'date', required: false },
    { id: 'competitor1', label: 'Competitor 1 Name', type: 'text', required: false },
    { id: 'comp1Strengths', label: 'Competitor 1 Strengths', type: 'textarea', required: false },
    { id: 'comp1Weaknesses', label: 'Competitor 1 Weaknesses', type: 'textarea', required: false },
    { id: 'competitor2', label: 'Competitor 2 Name', type: 'text', required: false },
    { id: 'comp2Strengths', label: 'Competitor 2 Strengths', type: 'textarea', required: false },
    { id: 'comp2Weaknesses', label: 'Competitor 2 Weaknesses', type: 'textarea', required: false },
    { id: 'competitor3', label: 'Competitor 3 Name', type: 'text', required: false },
    { id: 'comp3Strengths', label: 'Competitor 3 Strengths', type: 'textarea', required: false },
    { id: 'comp3Weaknesses', label: 'Competitor 3 Weaknesses', type: 'textarea', required: false },
    { id: 'opportunities', label: 'Opportunities Identified', type: 'textarea', required: false },
    { id: 'threats', label: 'Threats Identified', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Competitor Analysis', infoTable([['Business', or(d.yourBusiness,'[Business]')],['Date', fmtDate(d.analysisDate)]])),
    d.competitor1 ? section(`Competitor: ${d.competitor1}`, infoTable([['Strengths', d.comp1Strengths],['Weaknesses', d.comp1Weaknesses]])) : '',
    d.competitor2 ? section(`Competitor: ${d.competitor2}`, infoTable([['Strengths', d.comp2Strengths],['Weaknesses', d.comp2Weaknesses]])) : '',
    d.competitor3 ? section(`Competitor: ${d.competitor3}`, infoTable([['Strengths', d.comp3Strengths],['Weaknesses', d.comp3Weaknesses]])) : '',
    d.opportunities ? section('Opportunities', `<p>${nl2br(d.opportunities)}</p>`) : '',
    d.threats ? section('Threats', `<p>${nl2br(d.threats)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── SWOT Analysis ─────────────────────────────────────────────────────────────
export const swotAnalysis = mk('swot-analysis', 'SWOT Analysis', 'A SWOT analysis for a business, product or project.', ['swot', 'analysis', 'strategy'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'subject', label: 'Business / Product / Project Name', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'strengths', label: 'Strengths', type: 'textarea', required: false },
    { id: 'weaknesses', label: 'Weaknesses', type: 'textarea', required: false },
    { id: 'opportunities', label: 'Opportunities', type: 'textarea', required: false },
    { id: 'threats', label: 'Threats', type: 'textarea', required: false },
    { id: 'actions', label: 'Recommended Actions', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('SWOT Analysis', infoTable([['Subject', or(d.subject,'[Subject]')],['Date', fmtDate(d.date)]])),
    section('Strengths', `<p>${nl2br(or(d.strengths,'[Strengths]'))}</p>`),
    section('Weaknesses', `<p>${nl2br(or(d.weaknesses,'[Weaknesses]'))}</p>`),
    section('Opportunities', `<p>${nl2br(or(d.opportunities,'[Opportunities]'))}</p>`),
    section('Threats', `<p>${nl2br(or(d.threats,'[Threats]'))}</p>`),
    d.actions ? section('Recommended Actions', `<p>${nl2br(d.actions)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Customer Persona ──────────────────────────────────────────────────────────
export const customerPersona = mk('customer-persona', 'Customer Persona', 'A detailed customer persona / buyer profile document.', ['persona', 'customer', 'audience', 'buyer'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'personaName', label: 'Persona Name', type: 'text', required: true, placeholder: 'e.g. "Marketing Mary"' },
    { id: 'age', label: 'Age Range', type: 'text', required: false },
    { id: 'jobTitle', label: 'Job Title / Role', type: 'text', required: false },
    { id: 'location', label: 'Location', type: 'text', required: false },
    { id: 'goals', label: 'Goals & Motivations', type: 'textarea', required: false },
    { id: 'painPoints', label: 'Pain Points & Challenges', type: 'textarea', required: false },
    { id: 'buyingBehaviour', label: 'Buying Behaviour', type: 'textarea', required: false },
    { id: 'preferredChannels', label: 'Preferred Channels', type: 'text', required: false },
    { id: 'quote', label: 'Representative Quote', type: 'textarea', required: false },
    { id: 'howWeHelp', label: 'How We Help This Persona', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Persona Profile', infoTable([['Persona', or(d.personaName,'[Persona]')],['Age', d.age],['Role', d.jobTitle],['Location', d.location],['Channels', d.preferredChannels]])),
    d.quote ? `<blockquote style="border-left:3px solid #1B4F8A;padding:8px 14px;margin:12px 0;font-style:italic;">"${d.quote}"</blockquote>` : '',
    d.goals ? section('Goals & Motivations', `<p>${nl2br(d.goals)}</p>`) : '',
    d.painPoints ? section('Pain Points', `<p>${nl2br(d.painPoints)}</p>`) : '',
    d.buyingBehaviour ? section('Buying Behaviour', `<p>${nl2br(d.buyingBehaviour)}</p>`) : '',
    d.howWeHelp ? section('How We Help', `<p>${nl2br(d.howWeHelp)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Product Launch Plan ───────────────────────────────────────────────────────
export const productLaunchPlan = mk('product-launch-plan', 'Product Launch Plan', 'A go-to-market product launch plan.', ['product', 'launch', 'go-to-market'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'productName', label: 'Product / Service Name', type: 'text', required: true },
    { id: 'launchDate', label: 'Target Launch Date', type: 'date', required: false },
    { id: 'overview', label: 'Product Overview', type: 'textarea', required: false },
    { id: 'targetMarket', label: 'Target Market', type: 'textarea', required: false },
    { id: 'usp', label: 'Unique Selling Points', type: 'textarea', required: false },
    { id: 'pricingStrategy', label: 'Pricing Strategy', type: 'text', required: false },
    { id: 'channels', label: 'Launch Channels', type: 'textarea', required: false },
    { id: 'prActivities', label: 'PR & Marketing Activities', type: 'textarea', required: false },
    { id: 'milestones', label: 'Key Milestones', type: 'textarea', required: false },
    { id: 'successMetrics', label: 'Success Metrics', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Launch Overview', infoTable([['Product', or(d.productName,'[Product]')],['Launch Date', fmtDate(d.launchDate)],['Pricing', d.pricingStrategy]])),
    d.overview ? section('Product Overview', `<p>${nl2br(d.overview)}</p>`) : '',
    d.targetMarket ? section('Target Market', `<p>${nl2br(d.targetMarket)}</p>`) : '',
    d.usp ? section('Unique Selling Points', `<p>${nl2br(d.usp)}</p>`) : '',
    d.channels ? section('Launch Channels', `<p>${nl2br(d.channels)}</p>`) : '',
    d.prActivities ? section('PR & Marketing Activities', `<p>${nl2br(d.prActivities)}</p>`) : '',
    d.milestones ? section('Key Milestones', `<p>${nl2br(d.milestones)}</p>`) : '',
    d.successMetrics ? section('Success Metrics', `<p>${nl2br(d.successMetrics)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Sponsorship Proposal ──────────────────────────────────────────────────────
export const sponsorshipProposal = mk('sponsorship-proposal', 'Sponsorship Proposal', 'A sponsorship proposal to attract sponsors for an event or project.', ['sponsorship', 'proposal', 'event'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'orgName', label: 'Your Organisation Name', type: 'text', required: true },
    { id: 'eventName', label: 'Event / Project Name', type: 'text', required: true },
    { id: 'eventDate', label: 'Event Date', type: 'date', required: false },
    { id: 'overview', label: 'Event / Project Overview', type: 'textarea', required: false },
    { id: 'audience', label: 'Audience Profile', type: 'textarea', required: false },
    { id: 'sponsorBenefits', label: 'Sponsor Benefits', type: 'textarea', required: false },
    { id: 'packages', label: 'Sponsorship Packages', type: 'textarea', required: false },
    { id: 'contactName', label: 'Contact Name', type: 'text', required: false },
    { id: 'contactEmail', label: 'Contact Email', type: 'text', required: false },
  ]}],
  (d) => [
    section('Sponsorship Proposal', infoTable([['Organisation', or(d.orgName,'[Org]')],['Event', or(d.eventName,'[Event]')],['Date', fmtDate(d.eventDate)]])),
    d.overview ? section('Overview', `<p>${nl2br(d.overview)}</p>`) : '',
    d.audience ? section('Audience Profile', `<p>${nl2br(d.audience)}</p>`) : '',
    d.sponsorBenefits ? section('Sponsor Benefits', `<p>${nl2br(d.sponsorBenefits)}</p>`) : '',
    d.packages ? section('Sponsorship Packages', `<p>${nl2br(d.packages)}</p>`) : '',
    section('Contact', infoTable([['Name', d.contactName],['Email', d.contactEmail]])),
  ].filter(Boolean).join(''),
);

// ── Advertising Brief ─────────────────────────────────────────────────────────
export const advertisingBrief = mk('advertising-brief', 'Advertising Brief', 'A brief for an advertising campaign for an agency or internal team.', ['advertising', 'brief', 'campaign'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'brand', label: 'Brand Name', type: 'text', required: true },
    { id: 'campaignName', label: 'Campaign Name', type: 'text', required: false },
    { id: 'objective', label: 'Campaign Objective', type: 'textarea', required: false },
    { id: 'targetAudience', label: 'Target Audience', type: 'textarea', required: false },
    { id: 'keyMessage', label: 'Key Message / Proposition', type: 'textarea', required: false },
    { id: 'mandatories', label: 'Mandatories (must include)', type: 'textarea', required: false },
    { id: 'media', label: 'Media / Channels', type: 'text', required: false },
    { id: 'budget', label: 'Budget', type: 'text', required: false },
    { id: 'timeline', label: 'Timeline', type: 'text', required: false },
    { id: 'successMeasure', label: 'How Success Will Be Measured', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Advertising Brief', infoTable([['Brand', or(d.brand,'[Brand]')],['Campaign', d.campaignName],['Media', d.media],['Budget', d.budget],['Timeline', d.timeline]])),
    d.objective ? section('Objective', `<p>${nl2br(d.objective)}</p>`) : '',
    d.targetAudience ? section('Target Audience', `<p>${nl2br(d.targetAudience)}</p>`) : '',
    d.keyMessage ? section('Key Message', `<p>${nl2br(d.keyMessage)}</p>`) : '',
    d.mandatories ? section('Mandatories', `<p>${nl2br(d.mandatories)}</p>`) : '',
    d.successMeasure ? section('Measuring Success', `<p>${nl2br(d.successMeasure)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Content Strategy ──────────────────────────────────────────────────────────
export const contentStrategy = mk('content-strategy', 'Content Strategy', 'A content strategy document for a brand or website.', ['content', 'strategy', 'seo'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'brand', label: 'Brand Name', type: 'text', required: true },
    { id: 'period', label: 'Strategy Period', type: 'text', required: false },
    { id: 'goals', label: 'Content Goals', type: 'textarea', required: false },
    { id: 'audience', label: 'Target Audience', type: 'textarea', required: false },
    { id: 'contentTypes', label: 'Content Types', type: 'textarea', required: false, placeholder: 'e.g. Blog posts, videos, infographics, case studies' },
    { id: 'channels', label: 'Distribution Channels', type: 'textarea', required: false },
    { id: 'seoKeywords', label: 'Key SEO Topics / Keywords', type: 'textarea', required: false },
    { id: 'frequency', label: 'Publishing Frequency', type: 'text', required: false },
    { id: 'kpis', label: 'KPIs', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Content Strategy', infoTable([['Brand', or(d.brand,'[Brand]')],['Period', d.period],['Frequency', d.frequency]])),
    d.goals ? section('Goals', `<p>${nl2br(d.goals)}</p>`) : '',
    d.audience ? section('Target Audience', `<p>${nl2br(d.audience)}</p>`) : '',
    d.contentTypes ? section('Content Types', `<p>${nl2br(d.contentTypes)}</p>`) : '',
    d.channels ? section('Distribution Channels', `<p>${nl2br(d.channels)}</p>`) : '',
    d.seoKeywords ? section('SEO Topics & Keywords', `<p>${nl2br(d.seoKeywords)}</p>`) : '',
    d.kpis ? section('KPIs', `<p>${nl2br(d.kpis)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Sales Script ──────────────────────────────────────────────────────────────
export const salesScript = mk('sales-script', 'Sales Script', 'A sales call or meeting script for your team.', ['sales', 'script', 'call'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'product', label: 'Product / Service', type: 'text', required: true },
    { id: 'targetCustomer', label: 'Target Customer Type', type: 'text', required: false },
    { id: 'opening', label: 'Opening / Introduction', type: 'textarea', required: false },
    { id: 'discoveryQuestions', label: 'Discovery Questions', type: 'textarea', required: false },
    { id: 'valueProp', label: 'Value Proposition', type: 'textarea', required: false },
    { id: 'objectionHandling', label: 'Common Objections & Responses', type: 'textarea', required: false },
    { id: 'closing', label: 'Closing Statement / CTA', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Sales Script', infoTable([['Product', or(d.product,'[Product]')],['Target Customer', d.targetCustomer]])),
    d.opening ? section('Opening', `<p>${nl2br(d.opening)}</p>`) : '',
    d.discoveryQuestions ? section('Discovery Questions', `<p>${nl2br(d.discoveryQuestions)}</p>`) : '',
    d.valueProp ? section('Value Proposition', `<p>${nl2br(d.valueProp)}</p>`) : '',
    d.objectionHandling ? section('Objection Handling', `<p>${nl2br(d.objectionHandling)}</p>`) : '',
    d.closing ? section('Closing', `<p>${nl2br(d.closing)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Customer Journey Map ──────────────────────────────────────────────────────
export const customerJourneyMap = mk('customer-journey-map', 'Customer Journey Map', 'Map out the customer journey from awareness to purchase and beyond.', ['customer journey', 'map', 'ux'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'brand', label: 'Brand / Product', type: 'text', required: true },
    { id: 'persona', label: 'Customer Persona', type: 'text', required: false },
    { id: 'awareness', label: 'Awareness Stage', type: 'textarea', required: false },
    { id: 'consideration', label: 'Consideration Stage', type: 'textarea', required: false },
    { id: 'purchase', label: 'Purchase Stage', type: 'textarea', required: false },
    { id: 'retention', label: 'Retention Stage', type: 'textarea', required: false },
    { id: 'advocacy', label: 'Advocacy Stage', type: 'textarea', required: false },
    { id: 'painPoints', label: 'Key Pain Points', type: 'textarea', required: false },
    { id: 'opportunities', label: 'Improvement Opportunities', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Customer Journey Map', infoTable([['Brand', or(d.brand,'[Brand]')],['Persona', d.persona]])),
    d.awareness ? section('1. Awareness', `<p>${nl2br(d.awareness)}</p>`) : '',
    d.consideration ? section('2. Consideration', `<p>${nl2br(d.consideration)}</p>`) : '',
    d.purchase ? section('3. Purchase', `<p>${nl2br(d.purchase)}</p>`) : '',
    d.retention ? section('4. Retention', `<p>${nl2br(d.retention)}</p>`) : '',
    d.advocacy ? section('5. Advocacy', `<p>${nl2br(d.advocacy)}</p>`) : '',
    d.painPoints ? section('Key Pain Points', `<p>${nl2br(d.painPoints)}</p>`) : '',
    d.opportunities ? section('Improvement Opportunities', `<p>${nl2br(d.opportunities)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Affiliate Partner Brief ───────────────────────────────────────────────────
export const affiliateBrief = mk('affiliate-brief', 'Affiliate Partner Brief', 'A brief for affiliate or referral partners.', ['affiliate', 'partner', 'referral'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'brand', label: 'Brand Name', type: 'text', required: true },
    { id: 'programName', label: 'Programme Name', type: 'text', required: false },
    { id: 'commission', label: 'Commission Structure', type: 'text', required: false },
    { id: 'productOverview', label: 'Product / Service Overview', type: 'textarea', required: false },
    { id: 'targetAudience', label: 'Target Audience', type: 'textarea', required: false },
    { id: 'keyMessages', label: 'Key Messages', type: 'textarea', required: false },
    { id: 'assets', label: 'Available Assets', type: 'textarea', required: false },
    { id: 'rules', label: 'Programme Rules', type: 'textarea', required: false },
    { id: 'contactEmail', label: 'Affiliate Manager Email', type: 'text', required: false },
  ]}],
  (d) => [
    section('Affiliate Programme', infoTable([['Brand', or(d.brand,'[Brand]')],['Programme', d.programName],['Commission', d.commission],['Contact', d.contactEmail]])),
    d.productOverview ? section('Product Overview', `<p>${nl2br(d.productOverview)}</p>`) : '',
    d.targetAudience ? section('Target Audience', `<p>${nl2br(d.targetAudience)}</p>`) : '',
    d.keyMessages ? section('Key Messages', `<p>${nl2br(d.keyMessages)}</p>`) : '',
    d.assets ? section('Available Assets', `<p>${nl2br(d.assets)}</p>`) : '',
    d.rules ? section('Programme Rules', `<p>${nl2br(d.rules)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Influencer Brief ──────────────────────────────────────────────────────────
export const influencerBrief = mk('influencer-brief', 'Influencer Brief', 'A brief for influencer marketing collaborations.', ['influencer', 'brief', 'social media'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'brand', label: 'Brand Name', type: 'text', required: true },
    { id: 'campaign', label: 'Campaign Name', type: 'text', required: false },
    { id: 'influencerName', label: 'Influencer Name / Handle', type: 'text', required: false },
    { id: 'platform', label: 'Platform(s)', type: 'text', required: false },
    { id: 'deliverables', label: 'Deliverables Required', type: 'textarea', required: false },
    { id: 'keyMessages', label: 'Key Messages', type: 'textarea', required: false },
    { id: 'dosDonts', label: "Do's and Don'ts", type: 'textarea', required: false },
    { id: 'hashtags', label: 'Required Hashtags / Tags', type: 'text', required: false },
    { id: 'deadline', label: 'Content Deadline', type: 'date', required: false },
    { id: 'fee', label: 'Agreed Fee', type: 'text', required: false },
  ]}],
  (d) => [
    section('Influencer Brief', infoTable([['Brand', or(d.brand,'[Brand]')],['Campaign', d.campaign],['Influencer', d.influencerName],['Platform', d.platform],['Deadline', fmtDate(d.deadline)],['Fee', d.fee]])),
    d.deliverables ? section('Deliverables', `<p>${nl2br(d.deliverables)}</p>`) : '',
    d.keyMessages ? section('Key Messages', `<p>${nl2br(d.keyMessages)}</p>`) : '',
    d.dosDonts ? section("Do's and Don'ts", `<p>${nl2br(d.dosDonts)}</p>`) : '',
    d.hashtags ? section('Required Hashtags / Tags', `<p>${nl2br(d.hashtags)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Event Marketing Plan ──────────────────────────────────────────────────────
export const eventMarketingPlan = mk('event-marketing-plan', 'Event Marketing Plan', 'A marketing plan for promoting an event.', ['event', 'marketing', 'promotion'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'eventName', label: 'Event Name', type: 'text', required: true },
    { id: 'eventDate', label: 'Event Date', type: 'date', required: false },
    { id: 'targetAttendees', label: 'Target Number of Attendees', type: 'text', required: false },
    { id: 'audience', label: 'Target Audience', type: 'textarea', required: false },
    { id: 'channels', label: 'Promotion Channels', type: 'textarea', required: false },
    { id: 'timeline', label: 'Promotion Timeline', type: 'textarea', required: false },
    { id: 'budget', label: 'Marketing Budget', type: 'text', required: false },
    { id: 'kpis', label: 'Success Metrics', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Event Marketing Plan', infoTable([['Event', or(d.eventName,'[Event]')],['Date', fmtDate(d.eventDate)],['Target Attendees', d.targetAttendees],['Budget', d.budget]])),
    d.audience ? section('Target Audience', `<p>${nl2br(d.audience)}</p>`) : '',
    d.channels ? section('Promotion Channels', `<p>${nl2br(d.channels)}</p>`) : '',
    d.timeline ? section('Promotion Timeline', `<p>${nl2br(d.timeline)}</p>`) : '',
    d.kpis ? section('Success Metrics', `<p>${nl2br(d.kpis)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Testimonial Request Letter ────────────────────────────────────────────────
export const testimonialRequest = mk('testimonial-request', 'Testimonial Request Letter', 'A letter requesting a testimonial or review from a client.', ['testimonial', 'review', 'request'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'senderName', label: 'Your Name / Company', type: 'text', required: true },
    { id: 'clientName', label: 'Client Name', type: 'text', required: true },
    { id: 'projectName', label: 'Project / Service', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'platform', label: 'Preferred Platform (optional)', type: 'text', required: false, placeholder: 'e.g. Google, Trustpilot, LinkedIn' },
    { id: 'contactEmail', label: 'Your Contact Email', type: 'text', required: false },
  ]}],
  (d) => [
    `<p>${fmtDate(d.date)}</p>`,
    `<p>Dear <strong>${or(d.clientName,'[Client]')}</strong>,</p>`,
    `<p>Thank you for choosing <strong>${or(d.senderName,'[Sender]')}</strong>${d.projectName ? ` for ${d.projectName}` : ''}. We truly value your business and hope we delivered an excellent experience.</p>`,
    `<p>We would be very grateful if you could take a few minutes to share your feedback${d.platform ? ` on <strong>${d.platform}</strong>` : ''}. Your testimonial helps us improve and helps others make informed decisions.</p>`,
    `<p>If you have any questions, please don't hesitate to contact us${d.contactEmail ? ` at <strong>${d.contactEmail}</strong>` : ''}.</p>`,
    `<p>Thank you so much for your time and support.</p>`,
    divider(),
    `<p>Yours sincerely,<br><strong>${or(d.senderName,'[Sender]')}</strong></p>`,
  ].filter(Boolean).join(''),
);

// ── Case Study Template ───────────────────────────────────────────────────────
export const caseStudy = mk('case-study', 'Case Study', 'A client case study document for marketing and sales use.', ['case study', 'client', 'success story'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'clientName', label: 'Client Name', type: 'text', required: true },
    { id: 'industry', label: 'Industry', type: 'text', required: false },
    { id: 'challenge', label: 'The Challenge', type: 'textarea', required: false },
    { id: 'solution', label: 'Our Solution', type: 'textarea', required: false },
    { id: 'results', label: 'Results Achieved', type: 'textarea', required: false },
    { id: 'quote', label: 'Client Quote', type: 'textarea', required: false },
    { id: 'quotePerson', label: 'Quote Attribution', type: 'text', required: false },
    { id: 'services', label: 'Services Used', type: 'text', required: false },
  ]}],
  (d) => [
    section('Case Study', infoTable([['Client', or(d.clientName,'[Client]')],['Industry', d.industry],['Services', d.services]])),
    d.challenge ? section('The Challenge', `<p>${nl2br(d.challenge)}</p>`) : '',
    d.solution ? section('Our Solution', `<p>${nl2br(d.solution)}</p>`) : '',
    d.results ? section('Results', `<p>${nl2br(d.results)}</p>`) : '',
    d.quote ? `<blockquote style="border-left:3px solid #1B4F8A;padding:8px 14px;margin:12px 0;font-style:italic;">"${d.quote}"${d.quotePerson ? `<footer style="font-style:normal;font-size:8.5pt;margin-top:4px;">— ${d.quotePerson}</footer>` : ''}</blockquote>` : '',
  ].filter(Boolean).join(''),
);

// ── Partnership Outreach Letter ───────────────────────────────────────────────
export const partnershipOutreach = mk('partnership-outreach', 'Partnership Outreach Letter', 'A letter to propose a business partnership or collaboration.', ['partnership', 'outreach', 'collaboration'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'senderName', label: 'Your Name / Company', type: 'text', required: true },
    { id: 'recipientName', label: 'Recipient Name / Company', type: 'text', required: true },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'partnershipIdea', label: 'Partnership Idea / Proposal', type: 'textarea', required: false },
    { id: 'benefits', label: 'Mutual Benefits', type: 'textarea', required: false },
    { id: 'nextSteps', label: 'Proposed Next Steps', type: 'textarea', required: false },
    { id: 'contactEmail', label: 'Your Contact Email', type: 'text', required: false },
  ]}],
  (d) => [
    `<p>${fmtDate(d.date)}</p>`,
    `<p>Dear <strong>${or(d.recipientName,'[Recipient]')}</strong>,</p>`,
    `<p>My name is <strong>${or(d.senderName,'[Sender]')}</strong> and I am writing to explore a potential partnership opportunity between our organisations.</p>`,
    d.partnershipIdea ? `<p>${nl2br(d.partnershipIdea)}</p>` : '',
    d.benefits ? section('Mutual Benefits', `<p>${nl2br(d.benefits)}</p>`) : '',
    d.nextSteps ? section('Proposed Next Steps', `<p>${nl2br(d.nextSteps)}</p>`) : '',
    `<p>I would welcome the opportunity to discuss this further. Please feel free to contact me${d.contactEmail ? ` at <strong>${d.contactEmail}</strong>` : ''}.</p>`,
    divider(),
    `<p>Yours sincerely,<br><strong>${or(d.senderName,'[Sender]')}</strong></p>`,
  ].filter(Boolean).join(''),
);

// ── Pitch Deck Outline ────────────────────────────────────────────────────────
export const pitchDeckOutline = mk('pitch-deck-outline', 'Pitch Deck Outline', 'A structured outline for a business or investor pitch deck.', ['pitch', 'deck', 'investor', 'startup'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'companyName', label: 'Company Name', type: 'text', required: true },
    { id: 'tagline', label: 'Tagline', type: 'text', required: false },
    { id: 'problem', label: 'Problem Statement', type: 'textarea', required: false },
    { id: 'solution', label: 'Solution', type: 'textarea', required: false },
    { id: 'marketSize', label: 'Market Size', type: 'text', required: false },
    { id: 'businessModel', label: 'Business Model', type: 'textarea', required: false },
    { id: 'traction', label: 'Traction / Milestones', type: 'textarea', required: false },
    { id: 'team', label: 'Team Overview', type: 'textarea', required: false },
    { id: 'ask', label: 'The Ask (funding / partnership)', type: 'text', required: false },
  ]}],
  (d) => [
    section('Pitch Deck Outline', infoTable([['Company', or(d.companyName,'[Company]')],['Tagline', d.tagline],['Market Size', d.marketSize],['The Ask', d.ask]])),
    d.problem ? section('The Problem', `<p>${nl2br(d.problem)}</p>`) : '',
    d.solution ? section('Our Solution', `<p>${nl2br(d.solution)}</p>`) : '',
    d.businessModel ? section('Business Model', `<p>${nl2br(d.businessModel)}</p>`) : '',
    d.traction ? section('Traction & Milestones', `<p>${nl2br(d.traction)}</p>`) : '',
    d.team ? section('The Team', `<p>${nl2br(d.team)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Referral Programme Overview ───────────────────────────────────────────────
export const referralProgramme = mk('referral-programme', 'Referral Programme Overview', 'Document the structure and rules of a customer referral programme.', ['referral', 'programme', 'reward'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'brand', label: 'Brand Name', type: 'text', required: true },
    { id: 'programmeName', label: 'Programme Name', type: 'text', required: false },
    { id: 'reward', label: 'Referral Reward', type: 'text', required: false },
    { id: 'eligibility', label: 'Eligibility Criteria', type: 'textarea', required: false },
    { id: 'howItWorks', label: 'How It Works', type: 'textarea', required: false },
    { id: 'terms', label: 'Terms & Conditions', type: 'textarea', required: false },
    { id: 'contactEmail', label: 'Contact Email', type: 'text', required: false },
  ]}],
  (d) => [
    section('Referral Programme', infoTable([['Brand', or(d.brand,'[Brand]')],['Programme', d.programmeName],['Reward', d.reward],['Contact', d.contactEmail]])),
    d.howItWorks ? section('How It Works', `<p>${nl2br(d.howItWorks)}</p>`) : '',
    d.eligibility ? section('Eligibility', `<p>${nl2br(d.eligibility)}</p>`) : '',
    d.terms ? section('Terms & Conditions', `<p>${nl2br(d.terms)}</p>`) : '',
  ].filter(Boolean).join(''),
);

// ── Market Research Summary ───────────────────────────────────────────────────
export const marketResearchSummary = mk('market-research-summary', 'Market Research Summary', 'Summarise market research findings and insights.', ['market research', 'insights', 'analysis'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'brand', label: 'Brand / Project', type: 'text', required: true },
    { id: 'researchDate', label: 'Research Date', type: 'date', required: false },
    { id: 'methodology', label: 'Research Methodology', type: 'textarea', required: false },
    { id: 'keyFindings', label: 'Key Findings', type: 'textarea', required: false },
    { id: 'marketTrends', label: 'Market Trends', type: 'textarea', required: false },
    { id: 'customerInsights', label: 'Customer Insights', type: 'textarea', required: false },
    { id: 'recommendations', label: 'Recommendations', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Market Research Summary', infoTable([['Brand', or(d.brand,'[Brand]')],['Date', fmtDate(d.researchDate)]])),
    d.methodology ? section('Methodology', `<p>${nl2br(d.methodology)}</p>`) : '',
    d.keyFindings ? section('Key Findings', `<p>${nl2br(d.keyFindings)}</p>`) : '',
    d.marketTrends ? section('Market Trends', `<p>${nl2br(d.marketTrends)}</p>`) : '',
    d.customerInsights ? section('Customer Insights', `<p>${nl2br(d.customerInsights)}</p>`) : '',
    d.recommendations ? section('Recommendations', `<p>${nl2br(d.recommendations)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const ALL_MARKETING_TEMPLATES: DocumentTemplate[] = [
  marketingPlan, campaignBrief, socialMediaPlan, pressRelease, salesProposal,
  brandGuidelines, emailNewsletterPlan, competitorAnalysis, swotAnalysis,
  customerPersona, productLaunchPlan, sponsorshipProposal, advertisingBrief,
  contentStrategy, salesScript, customerJourneyMap, affiliateBrief,
  influencerBrief, eventMarketingPlan, testimonialRequest, caseStudy,
  partnershipOutreach, pitchDeckOutline, referralProgramme, marketResearchSummary,
];
