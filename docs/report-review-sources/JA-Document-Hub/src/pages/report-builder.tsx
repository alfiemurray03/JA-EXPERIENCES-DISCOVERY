import GenericBuilder from '@/components/GenericBuilder';
import BuilderDocPreview from '@/components/BuilderDocPreview';

export default function ReportBuilderPage() {
  return (
    <GenericBuilder
      builderId="report"
      title="Report Builder"
      subtitle="Incident, audit, inspection, risk assessment, monthly, client reports"
      metaDescription="Create professional reports including incident reports, audit reports, inspection reports, risk assessments, and monthly progress reports."
      defaultAccentColor="#ea580c"
      renderPreview={(fields, template, branding, layoutId) => (
        <BuilderDocPreview fields={fields} template={template} branding={branding} layoutId={layoutId} />
      )}
    />
  );
}
