import type { DocumentTemplate } from '../document-types';
import { section, infoTable, or, nl2br, fmtDate, divider } from './html-helpers';

function mk(id: string, name: string, desc: string, tags: string[], fields: DocumentTemplate['sections'], gen: DocumentTemplate['generateDocument']): DocumentTemplate {
  return { id, name, description: desc, category: 'creative', icon: 'Palette', planRequired: 'free', tags, sections: fields, generateDocument: gen };
}

export const creativeProjectBrief = mk('creative-project-brief', 'Creative Project Brief', 'A brief for a creative project — design, photography, video or writing.', ['creative', 'brief', 'project', 'design'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'client', label: 'Client / Brand', type: 'text', required: false },
    { id: 'projectType', label: 'Project Type', type: 'select', required: false, options: ['Design', 'Photography', 'Video', 'Copywriting', 'Illustration', 'Animation', 'Other'] },
    { id: 'deadline', label: 'Deadline', type: 'date', required: false },
    { id: 'budget', label: 'Budget', type: 'text', required: false },
    { id: 'objective', label: 'Project Objective', type: 'textarea', required: false },
    { id: 'audience', label: 'Target Audience', type: 'textarea', required: false },
    { id: 'deliverables', label: 'Deliverables', type: 'textarea', required: false },
    { id: 'styleGuide', label: 'Style / Brand Guidelines', type: 'textarea', required: false },
    { id: 'references', label: 'Reference / Inspiration', type: 'textarea', required: false },
    { id: 'dosDonts', label: "Do's and Don'ts", type: 'textarea', required: false },
    { id: 'approver', label: 'Approver', type: 'text', required: false },
  ]}],
  (d) => [
    section('Creative Brief', infoTable([['Project', or(d.projectName,'[Project]')],['Client', d.client],['Type', d.projectType],['Deadline', fmtDate(d.deadline)],['Budget', d.budget],['Approver', d.approver]])),
    d.objective ? section('Objective', `<p>${nl2br(d.objective)}</p>`) : '',
    d.audience ? section('Target Audience', `<p>${nl2br(d.audience)}</p>`) : '',
    d.deliverables ? section('Deliverables', `<p>${nl2br(d.deliverables)}</p>`) : '',
    d.styleGuide ? section('Style / Brand Guidelines', `<p>${nl2br(d.styleGuide)}</p>`) : '',
    d.references ? section('References / Inspiration', `<p>${nl2br(d.references)}</p>`) : '',
    d.dosDonts ? section("Do's and Don'ts", `<p>${nl2br(d.dosDonts)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const photographyServiceAgreement = mk('photography-service-agreement', 'Photography Service Agreement', 'A service agreement for photography work.', ['photography', 'agreement', 'contract', 'creative'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'photographerName', label: 'Photographer Name', type: 'text', required: true },
    { id: 'clientName', label: 'Client Name', type: 'text', required: true },
    { id: 'eventType', label: 'Event / Shoot Type', type: 'text', required: false },
    { id: 'shootDate', label: 'Shoot Date', type: 'date', required: false },
    { id: 'location', label: 'Location', type: 'text', required: false },
    { id: 'duration', label: 'Duration', type: 'text', required: false },
    { id: 'deliverables', label: 'Deliverables', type: 'textarea', required: false },
    { id: 'deliveryTimeline', label: 'Delivery Timeline', type: 'text', required: false },
    { id: 'fee', label: 'Fee', type: 'text', required: false },
    { id: 'deposit', label: 'Deposit', type: 'text', required: false },
    { id: 'usageRights', label: 'Image Usage Rights', type: 'textarea', required: false },
    { id: 'cancellationPolicy', label: 'Cancellation Policy', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Photography Agreement', infoTable([['Photographer', or(d.photographerName,'[Photographer]')],['Client', or(d.clientName,'[Client]')],['Event / Shoot', d.eventType],['Date', fmtDate(d.shootDate)],['Location', d.location],['Duration', d.duration],['Fee', d.fee],['Deposit', d.deposit],['Delivery', d.deliveryTimeline]])),
    d.deliverables ? section('Deliverables', `<p>${nl2br(d.deliverables)}</p>`) : '',
    d.usageRights ? section('Image Usage Rights', `<p>${nl2br(d.usageRights)}</p>`) : '',
    d.cancellationPolicy ? section('Cancellation Policy', `<p>${nl2br(d.cancellationPolicy)}</p>`) : '',
    divider(),
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px;">
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Photographer Signature</p></div>
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Client Signature</p></div>
    </div>`,
  ].filter(Boolean).join(''),
);

export const videoProductionBrief = mk('video-production-brief', 'Video Production Brief', 'A brief for a video production project.', ['video', 'production', 'brief', 'creative'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'client', label: 'Client', type: 'text', required: false },
    { id: 'videoType', label: 'Video Type', type: 'select', required: false, options: ['Corporate', 'Promotional', 'Social Media', 'Training', 'Documentary', 'Event', 'Other'] },
    { id: 'duration', label: 'Target Duration', type: 'text', required: false },
    { id: 'deadline', label: 'Deadline', type: 'date', required: false },
    { id: 'budget', label: 'Budget', type: 'text', required: false },
    { id: 'objective', label: 'Objective', type: 'textarea', required: false },
    { id: 'audience', label: 'Target Audience', type: 'textarea', required: false },
    { id: 'keyMessages', label: 'Key Messages', type: 'textarea', required: false },
    { id: 'style', label: 'Style / Tone', type: 'textarea', required: false },
    { id: 'locations', label: 'Filming Locations', type: 'textarea', required: false },
    { id: 'deliverables', label: 'Deliverables', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Video Production Brief', infoTable([['Project', or(d.projectName,'[Project]')],['Client', d.client],['Type', d.videoType],['Duration', d.duration],['Deadline', fmtDate(d.deadline)],['Budget', d.budget]])),
    d.objective ? section('Objective', `<p>${nl2br(d.objective)}</p>`) : '',
    d.audience ? section('Target Audience', `<p>${nl2br(d.audience)}</p>`) : '',
    d.keyMessages ? section('Key Messages', `<p>${nl2br(d.keyMessages)}</p>`) : '',
    d.style ? section('Style / Tone', `<p>${nl2br(d.style)}</p>`) : '',
    d.locations ? section('Filming Locations', `<p>${nl2br(d.locations)}</p>`) : '',
    d.deliverables ? section('Deliverables', `<p>${nl2br(d.deliverables)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const designFeedbackForm = mk('design-feedback-form', 'Design Feedback Form', 'A structured feedback form for design work.', ['design', 'feedback', 'creative', 'review'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'designer', label: 'Designer Name', type: 'text', required: false },
    { id: 'reviewer', label: 'Reviewer Name', type: 'text', required: false },
    { id: 'date', label: 'Date', type: 'date', required: false },
    { id: 'version', label: 'Version / Round', type: 'text', required: false },
    { id: 'overallImpression', label: 'Overall Impression', type: 'textarea', required: false },
    { id: 'whatWorks', label: 'What Works Well', type: 'textarea', required: false },
    { id: 'changes', label: 'Changes Required', type: 'textarea', required: false },
    { id: 'priority', label: 'Priority Changes', type: 'textarea', required: false },
    { id: 'approved', label: 'Approved for Next Stage?', type: 'select', required: false, options: ['Yes', 'No — Revisions Required', 'Approved with Minor Amends'] },
  ]}],
  (d) => [
    section('Design Feedback', infoTable([['Project', or(d.projectName,'[Project]')],['Designer', d.designer],['Reviewer', d.reviewer],['Date', fmtDate(d.date)],['Version', d.version],['Approved', d.approved]])),
    d.overallImpression ? section('Overall Impression', `<p>${nl2br(d.overallImpression)}</p>`) : '',
    d.whatWorks ? section('What Works Well', `<p>${nl2br(d.whatWorks)}</p>`) : '',
    d.changes ? section('Changes Required', `<p>${nl2br(d.changes)}</p>`) : '',
    d.priority ? section('Priority Changes', `<p>${nl2br(d.priority)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const contentWritingBrief = mk('content-writing-brief', 'Content Writing Brief', 'A brief for a copywriting or content writing project.', ['copywriting', 'content', 'brief', 'writing'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'projectName', label: 'Project Name', type: 'text', required: true },
    { id: 'client', label: 'Client / Brand', type: 'text', required: false },
    { id: 'contentType', label: 'Content Type', type: 'select', required: false, options: ['Blog Post', 'Website Copy', 'Social Media', 'Email', 'Press Release', 'Case Study', 'White Paper', 'Other'] },
    { id: 'wordCount', label: 'Target Word Count', type: 'text', required: false },
    { id: 'deadline', label: 'Deadline', type: 'date', required: false },
    { id: 'objective', label: 'Objective', type: 'textarea', required: false },
    { id: 'audience', label: 'Target Audience', type: 'textarea', required: false },
    { id: 'toneOfVoice', label: 'Tone of Voice', type: 'textarea', required: false },
    { id: 'keyMessages', label: 'Key Messages', type: 'textarea', required: false },
    { id: 'seoKeywords', label: 'SEO Keywords (if applicable)', type: 'textarea', required: false },
    { id: 'references', label: 'Reference Materials', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Content Writing Brief', infoTable([['Project', or(d.projectName,'[Project]')],['Client', d.client],['Type', d.contentType],['Word Count', d.wordCount],['Deadline', fmtDate(d.deadline)]])),
    d.objective ? section('Objective', `<p>${nl2br(d.objective)}</p>`) : '',
    d.audience ? section('Target Audience', `<p>${nl2br(d.audience)}</p>`) : '',
    d.toneOfVoice ? section('Tone of Voice', `<p>${nl2br(d.toneOfVoice)}</p>`) : '',
    d.keyMessages ? section('Key Messages', `<p>${nl2br(d.keyMessages)}</p>`) : '',
    d.seoKeywords ? section('SEO Keywords', `<p>${nl2br(d.seoKeywords)}</p>`) : '',
    d.references ? section('Reference Materials', `<p>${nl2br(d.references)}</p>`) : '',
  ].filter(Boolean).join(''),
);

export const musicPerformanceAgreement = mk('music-performance-agreement', 'Music Performance Agreement', 'An agreement for a musician or band to perform at an event.', ['music', 'performance', 'agreement', 'event'],
  [{ id: 'main', title: 'Details', fields: [
    { id: 'artistName', label: 'Artist / Band Name', type: 'text', required: true },
    { id: 'clientName', label: 'Client / Venue Name', type: 'text', required: true },
    { id: 'eventDate', label: 'Event Date', type: 'date', required: false },
    { id: 'venue', label: 'Venue Address', type: 'textarea', required: false },
    { id: 'performanceTime', label: 'Performance Time', type: 'text', required: false },
    { id: 'setLength', label: 'Set Length', type: 'text', required: false },
    { id: 'fee', label: 'Performance Fee', type: 'text', required: false },
    { id: 'deposit', label: 'Deposit', type: 'text', required: false },
    { id: 'technicalRequirements', label: 'Technical Requirements', type: 'textarea', required: false },
    { id: 'cancellationPolicy', label: 'Cancellation Policy', type: 'textarea', required: false },
  ]}],
  (d) => [
    section('Performance Agreement', infoTable([['Artist', or(d.artistName,'[Artist]')],['Client', or(d.clientName,'[Client]')],['Date', fmtDate(d.eventDate)],['Time', d.performanceTime],['Set Length', d.setLength],['Fee', d.fee],['Deposit', d.deposit]])),
    d.venue ? section('Venue', `<p>${nl2br(d.venue)}</p>`) : '',
    d.technicalRequirements ? section('Technical Requirements', `<p>${nl2br(d.technicalRequirements)}</p>`) : '',
    d.cancellationPolicy ? section('Cancellation Policy', `<p>${nl2br(d.cancellationPolicy)}</p>`) : '',
    divider(),
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px;">
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Artist Signature</p></div>
      <div><div style="height:1px;background:#374151;margin-top:28px;margin-bottom:4px;"></div><p style="font-size:8.5pt;color:#6b7280;margin:0;">Client Signature</p></div>
    </div>`,
  ].filter(Boolean).join(''),
);

export const ALL_CREATIVE_TEMPLATES: DocumentTemplate[] = [
  creativeProjectBrief, photographyServiceAgreement, videoProductionBrief,
  designFeedbackForm, contentWritingBrief, musicPerformanceAgreement,
];
